//DATABASE
var users = {};
var mysql      = require('mysql');
var connection = mysql.createConnection({
              host     : 'localhost',
              user     : 'root',
              password : 'ubuntu',
              database : 'users'
            });
connection.connect();
global.db = connection;
function init(){
var query = db.query("SELECT * FROM MYUSERS", function(err, result) {
		if(err){
			console.log("Something wrong with DB");
		}
		else{
			var string=JSON.stringify(result);
			var json =  JSON.parse(string);
			for(var i=0;i<json.length;i++){
				var temp=json[i];
				users[temp['userId']]=temp;
			}
		}
      });
}
init();
//IMPORT MODULES AND SETUP APP	  
var express = require('express');
var app = express();
app.use(express.static('public'));
app.use('/game', express.static('game'));
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var bcrypt=require('bcrypt-nodejs');
var salt=bcrypt.genSaltSync(10);
var _ = require('lodash');
var lobbyUsers = {};
var activeGames = {};
var LastUser=undefined;
app.get('/', function(req, res) {
 res.sendFile(__dirname + '/public/index.html');
});
app.get('/game', function(req, res){
 res.sendFile(__dirname + '/game/index.html');
});
var nsp = io.of('/game');

nsp.on('connection', function (socket) {
    nicknames[socket.id] = nextGuestName();
    allUsers[socket.id] = socket;
    waitingUsers.push(socket);
    
    if(waitingUsers.length > 1){
      var p1 = waitingUsers[0];
      var p2 = waitingUsers[1];
	  p1.oppo=p2;
	  p2.oppo=p1;
      gameNumber += 1;
      var gameName = "Game-" + gameNumber.toString();
      var playersArray = [p1,p2];
      createGame(p1, p2);
      joinGame(p1, nsp, gameName);
      joinGame(p2, nsp, gameName);
    } else {
      socket.emit("notifySinglePlayer");
    };
    handlePlaceShips(socket, nsp);
    handleShot(socket, nsp);
    handleShotResponse(socket, nsp);
	socket.on('chat', function (msg){
			socket.oppo.emit('chat', {
				name: 'Opponent',
				message: msg,
			});
			socket.emit('chat', {
				name: 'Me',
				message: msg,
			});	
	});
  });
  
var waitingUsers = [];
var allUsers = {};
var gameNumber = 0;
var nicknames = {};
var currentGame = {};
var games = [];

var nextGuestName = (function () {
  var guestNumber = 1;
  return function () {
    guestNumber += 1;
    return "Guest" + guestNumber;
  };
}());

var createGame = function(p1, p2){
  waitingUsers = waitingUsers.slice(2);
  var nameOfGame = "Game-" + gameNumber.toString();
  var Game = {
    gameName: nameOfGame,
    waitingForShips: [p1.id, p2.id],
    readyPlayers: []
  };
  games.push(Game);
}

var joinGame = function (socket, io, gameName) {
  socket.join(gameName);
  currentGame[socket.id] = gameName;
  io.to(gameName).emit('placeShips', {
    text: "joined" + gameName
  })
};

var handlePlaceShips = function (socket, io){
  socket.on("shipsPlaced", function() {
    var targetGame = getTargetGame(socket.id);
    var socketIndex = targetGame.waitingForShips.indexOf(socket.id);

    switch(socketIndex){
    case 0:
      targetGame.waitingForShips.shift();
      break;
    case 1:
      targetGame.waitingForShips.pop();
      break;
    }
 
    targetGame.readyPlayers.push(socket);
    var otherSocket;
    var otherSocketId;
    if(targetGame.waitingForShips.length === 1){
      otherSocketId =  targetGame.waitingForShips[0];
      otherSocket = allUsers[otherSocketId];
      otherSocket.emit("youSuck");
      socket.emit("firstPlayer");
    } 
    if(targetGame.readyPlayers.length === 2){
      otherSocket =  targetGame.readyPlayers[0];
      otherSocket.emit("yourTurn");
      socket.emit("notYourTurn");
    }
  })
};

var getOtherPlayer = function(targetGame, socketId){
  var currentSocketIndex;
  for(var i = 0; i < 2; i ++){
    if(targetGame.readyPlayers[i].id === socketId){
      currentSocketIndex = i;
    }
  } 
  var otherSocket;
  switch(currentSocketIndex){
  case 0:
    otherSocket = targetGame.readyPlayers[1];
    break;
  case 1:
    otherSocket = targetGame.readyPlayers[0];
    break;
  }
  return otherSocket;
};
var getTargetGame = function (socketId) {
  var targetGame;
  for(var i = 0; i < games.length; i ++){
    if(games[i].gameName === currentGame[socketId]){
      targetGame = games[i];
    }
  }
  return targetGame;
};
var handleShot = function(socket, io){
  socket.on("HANDLE_SHOT_RESPONSE", function(coords) {
    var targetGame = getTargetGame(socket.id);
    var otherPlayer = getOtherPlayer(targetGame, socket.id);
    otherPlayer.emit("SHOT", coords);
  });
};
var handleShotResponse = function(socket, io){
  socket.on("SHOT_RESPONSE", function(params) {
    var targetGame = getTargetGame(socket.id);
    var otherPlayer = getOtherPlayer(targetGame, socket.id);  
    if(params.gameLost){
      socket.emit("GAME_OVER", [params, "You Lost. You should be sent to Ramsay!", false]);
      otherPlayer.emit("GAME_OVER", [params, "Woah, You might get to fight Euron!", true])
    } else {
      socket.emit("yourTurn");
      otherPlayer.emit("makeNotTurn", params);
    }
  })
};
//DEFINE SOCKET FUNCTIONS
io.on('connection', function(socket) {
	console.log('new connection ' + socket);
	//Check Last User
	socket.emit('getDATA', 'username');
	setTimeout( function (){
		if (typeof LastUser != 'undefined' && LastUser) {
			userFound(LastUser);
			console.log("LastUser was " + LastUser);
		}
	}, 1000);
	socket.on('scoreboard', function(data) {
		var scoretemp = [];
		var mytemp =[];
		for(i in users){
			mytemp=[];
			mytemp.push(users[i]["userId"]);
			mytemp.push(users[i]["wins"]);
			mytemp.push(users[i]["losses"]);
			scoretemp.push(mytemp);
		}
		scoretemp.sort(function (a, b){return (Number(b[1])-Number(a[1]))+(Number(a[2])-Number(b[2]));});
		socket.emit('setScores', scoretemp);
		/*for(i in scoretemp){
			console.log(JSON.stringify(scoretemp[i]));
		}*/
		console.log(scoretemp);
		
	});
	socket.on('updateDict', function(data) {
		var myfoo=data["userId"];
		users[myfoo]["wins"]=data["wins"];
		users[myfoo]["losses"]=data["losses"];
		updateData(myfoo, data["wins"], data["losses"]);
	});
	//Login
	socket.on('login', function(data) {
		console.log("CALLED ME");
		if (LastUser === undefined || LastUser === null) {
			console.log("Logging "+data['u']);
			doLogin(socket, data["u"], data["p"]);
		}
    });
	//Register
	socket.on('register', function(data){
		console.log('CALLING REGISTER');
		doRegister(socket, data["u"], data["p"]);
	});
	//Invite Notif
    socket.on('invite', function(opponentId) {
		console.log('got an invite from: ' + socket.userId + ' --> ' + opponentId);
		var socket2=lobbyUsers[opponentId];
		if(socket2){
			socket2.emit('request', socket.userId);
		}
	});
	socket.on('populate', function(opponentId){
		socket.emit('setText', '#profileLabel', "Username: "+users[opponentId]["userId"]);
		socket.emit('setText', '#profilewins', "Wins: "+users[opponentId]["wins"]);
		socket.emit('setText', '#profilelosses', "Losses: "+users[opponentId]["losses"]);
		socket.emit('setText', '#profilerating', "Rating: "+users[opponentId]["rating"]);
	});
	//Accepted Request
	socket.on('accept', function(opponentId){
		doPair(socket.userId, opponentId);
		io.sockets.emit('leavelobby', socket.userId);
        io.sockets.emit('leavelobby', opponentId);
		delete lobbyUsers[socket.userId];
		delete lobbyUsers[opponentId];
    });
    //HMMM
	socket.on('addtolobby', function(msg){
		console.log("adding "+msg+" to lobby");
		lobbyUsers[msg] = socket;
		socket.broadcast.emit('joinlobby', socket.userId);	
	});
	//LOGOUT
    socket.on('mylogout', function(msg) {
		console.log('MY LOGOUT '+socket.userId);
			if(socket && socket.userId ) {
			console.log(socket.userId + ' disconnected');
		}
		delete lobbyUsers[socket.userId];
		io.sockets.emit('logout', socket.userId); 
	});
	//DISCONNECT
    socket.on('disconnect', function(msg) {
      console.log('DISCONNECTING');
      if(socket && socket.userId ) {
        console.log(socket.userId + ' disconnected');
      }
      delete lobbyUsers[socket.userId];
      io.sockets.emit('logout', socket.userId);
    });
	function userFound(userId){ 
		socket.userId = userId;   
		console.log('IN USER FOUND ' + userId);
			if(!lobbyUsers[userId]){
					socket.emit('loggedin', userId);/*
					Object.keys(users[userId].games).forEach(function(gameId) {
					console.log('gameid - ' + gameId);
					});*/
				socket.emit('login', {users: Object.keys(lobbyUsers), 
				games:{}});//games: Object.keys(users[userId].games)});
				lobbyUsers[userId] = socket;
				socket.broadcast.emit('joinlobby', socket.userId);
				//socket.emit('setDATA', 'username', userId);
				console.log(JSON.stringify(users[userId]));
				socket.emit('initialize', users[userId]);
				//socket.emit('updateMyData', "FOO");
			}
			else{
					socket.emit('disp', 'Dual Identities??');	
				}
	}
    function doLogin(socket, userId, pass) {
        socket.userId = userId;  
		console.log("HERE");
        if (!users[userId]) {    
            socket.emit('disp','Please register first!');
        } else {
			if(bcrypt.compareSync(pass, users[userId].pass)){
				console.log('user found!');
				socket.emit('setDATA', 'username', userId);
				socket.emit('initialize', users[userId]);
				userFound(userId);
			}
			else{
				socket.emit('disp', 'Wrong Credentials!');
			}
        }
    }
    function doRegister(socket, userId, pass) {
        socket.userId = userId;   
        if (!users[userId]) {    
            var myhash=bcrypt.hashSync(pass, salt);
			var sql="INSERT INTO `myusers`(`userId`,`pass`,`wins`,`losses`, `rating`) VALUES ('" + userId + "','" + myhash + "',0,0,1200)";
			var query = db.query(sql, function(err, result) {
				if(err){
					console.log("Something wrong with DB");
				}
				else{
					socket.emit('disp','Wohoo! You are now registered!');
					users[userId] = {userId: socket.userId, pass:myhash, wins:0, losses:0, rating:1200};
				}
			});
        } else {
            
            socket.emit('disp','You have already registered!');
        }
    }
	function doPair(user1, user2){
		var socket1=lobbyUsers[user1];
		var socket2=lobbyUsers[user2];
		socket1.emit('paired', "FOO");
		socket2.emit('paired', "FOO");
		socket1.opponentId=user2;
		socket2.opponentId=user1;
		socket1.oppo=socket2;
		socket2.oppo=socket1;
		var destination = '/game';
		socket1.emit('redirect', destination);
		socket2.emit('redirect', destination);
	}
	function updateData(userId, wins, losses){
		var sql="UPDATE `myusers` SET `wins` = "+wins+", `losses` = "+losses+" WHERE `userId` = '" + userId+"'";
		var query = db.query(sql, function(err, result) {
			if(err){
				console.log(sql);
				console.log("Something wrong with DB");
			}
			else{
				console.log("Updated.");
				init();
			}
		});
	}
	//SET Last User
	socket.on('getVal', function(msg) {
		LastUser=msg;
	});
	//FOR DEBUGGING
	socket.on('displaythis', function(shit){
		console.log(shit);
	});
	
});
http.listen(port, function() {
    console.log('listening on *: ' + port);
});