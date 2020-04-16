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
	  
	  
//IMPORT MODULES AND SETUP APP	  
var express = require('express');
var app = express();
app.use('/', express.static('public'));
app.use('/src', express.static('src'));
app.use('/react', express.static('clients/react'));
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
 res.sendFile(__dirname + '/public/default.html');
});
app.get('/react/', function(req, res){
 res.sendFile(__dirname + '/clients/react/index.html');
});
app.get('/mygame*', function(req, res){
	//res.send("HI");
	//console.log("HI");
	var ships=decodeURIComponent(req.url.replace('/mygame', ''));
	ships=JSON.parse(ships);
	var myships = new Array(100);
	
	for(let i=0;i<myships.length;i++){
		myships[i]=0;
	}
	for(let i=0;i<ships.length;i++){
		for(let j=0;j<ships[i]["size"];j++){
			var pos=ships[i]["positions"][j];
			//res.send(pos);
			if(pos){
			var r=pos["row"]-1;
			var c=pos["col"]-1;
			myships[10*r+c]=i+1;
			}
		}
	}
	res.sendFile(__dirname + '/public/index3.html', {ships: myships.toString()});
	
});
var Game = require('./game.js');

var games = {};
/*var nsp2 = io.of('/something');//('socket.io')(http);
var BattleshipGame = require('./app/game.js');
var GameStatus = require('./app/gameStatus.js');
var users2 = {};
var gameIdCounter = 1;

nsp2.on('connection', function(socket) {
  console.log((new Date().toISOString()) + ' ID ' + socket.id + ' connected.');
	console.log(socket.handshake.query.toString());
  users2[socket.id] = {
    inGame: null,
    player: null,
	"ships": socket.handshake.query
  }; 
	socket.join('waiting room');
    socket.on('shot', function(position) {
    var game = users2[socket.id].inGame, opponent;

    if(game !== null) {
      if(game.currentPlayer === users2[socket.id].player) {
        opponent = game.currentPlayer === 0 ? 1 : 0;
    if(game.shoot(position)) {
          checkGameOver(game);
          nsp2.to(socket.id).emit('update', game.getGameState(users2[socket.id].player, opponent));
          nsp2.to(game.getPlayerId(opponent)).emit('update', game.getGameState(opponent, opponent));
        }
      }
    }
  });
  socket.on('leave', function() {
    if(users2[socket.id].inGame !== null) {
      leaveGame(socket);
      socket.join('waiting room');
      joinWaitingPlayers();
    }
  });
  socket.on('disconnect', function() {
    console.log((new Date().toISOString()) + ' ID ' + socket.id + ' disconnected.');
    
    leaveGame(socket);

    delete users2[socket.id];
  });

  joinWaitingPlayers();
});
function joinWaitingPlayers() {
  var players = getClientsInRoom('waiting room');
  
  if(players.length >= 2) {
    var game = new BattleshipGame(gameIdCounter++, players[0].id, players[1].id, users2[players[0].id]["ships"], users2[players[1].id]["ships"]);
    players[0].leave('waiting room');
    players[1].leave('waiting room');
    players[0].join('game' + game.id);
    players[1].join('game' + game.id);

    users2[players[0].id].player = 0;
    users2[players[1].id].player = 1;
    users2[players[0].id].inGame = game;
    users2[players[1].id].inGame = game;
    
    nsp2.to('game' + game.id).emit('join', game.id);
    nsp2.to(players[0].id).emit('update', game.getGameState(0, 0));
    nsp2.to(players[1].id).emit('update', game.getGameState(1, 1));

    console.log((new Date().toISOString()) + " " + players[0].id + " and " + players[1].id + " have joined game ID " + game.id);
  }
} 
function leaveGame(socket) {
  if(users2[socket.id].inGame !== null) {
    console.log((new Date().toISOString()) + ' ID ' + socket.id + ' left game ID ' + users2[socket.id].inGame.id);
    socket.broadcast.to('game' + users2[socket.id].inGame.id).emit('notification', {
      message: 'Opponent has left the game'
    });

    if(users2[socket.id].inGame.gameStatus !== GameStatus.gameOver) {
      // Game is unfinished, abort it.
      users2[socket.id].inGame.abortGame(users2[socket.id].player);
      checkGameOver(users2[socket.id].inGame);
    }

    socket.leave('game' + users2[socket.id].inGame.id);

    users2[socket.id].inGame = null;
    users2[socket.id].player = null;

    nsp2.to(socket.id).emit('leave');
  }
}
function checkGameOver(game) {
  if(game.gameStatus === GameStatus.gameOver) {
    console.log((new Date().toISOString()) + ' Game ID ' + game.id + ' ended.');
    nsp2.to(game.getWinnerId()).emit('gameover', true);
    nsp2.to(game.getLoserId()).emit('gameover', false);
  }
}
function getClientsInRoom(room) {
  var clients = [];
  for (var id in io.of('/something').adapter.rooms[room]) {
    clients.push(io.of('/something').adapter.nsp.connected[id]);
  }
  return clients;
}
/**/
var nsp=io.of('/react');
nsp.on('connection', function(socket) {
  console.log('%s connected', socket.id);
  socket.room = ""; // set room to socket session
  socket.emit('connected', socket.id.replace('/react#',''));
  socket
  .on('disconnect', function() {
    console.log('%s disconnected', socket.id);
    var game = games[socket.room];
    if (!!game) {
      if (!!_.find(game.players, {
        id: socket.id.replace('/react#','')
      })) {
        games[socket.room] = null;
        nsp.to(socket.room).emit('game_state', {
          state: 'END'
        });
      }
    }
  })
  .on('rooms', function() {
    socket.emit('rooms', nsp.sockets.adapter.rooms);
  })
  .on('join_room', function(room_name) {
    socket.join(room_name);
    socket.room = room_name;
    var res = {name:room_name};
    res.game_state = "";
    if(!!games[socket.room]){
      res.game_state = games[socket.room].state;
    }
    socket.emit('room_joined',res);
    nsp.to(socket.room).emit('player_joined', socket.id.replace('/react#',''));
  })
  .on('in_room', function(room_name) {
    var room = room_name || socket.room;
    socket.emit('in_room', nsp.sockets.adapter.rooms[room]);
  })
  .on('start_game', function() {
    try {
      games[socket.room] = new Game();
      var game = games[socket.room];
      // TRY JOIN
      var result = game.join(socket.id.replace('/react#',''));
      if (result !== 'OK') throw result;

      nsp.to(socket.room).emit('game_state', {
        state: game.state, // init
        players: game.players.map(function(p) {
          return {
            id: p.id,
            ready: p.ready
          };
        })
      });

      socket.emit('game_joined', result);
    } catch (err) {
      socket.emit('game_joined', err);
    }
  })
  .on('join_game', function() {
    try {
      // ERR CHECK
      var game = games[socket.room];
      if (!game) throw "ERR_NO_GAME";
      // TRY JOIN
      var result = game.join(socket.id.replace('/react#',''));
      if (result !== 'OK') throw result;

      socket.emit('game_joined', result);

      nsp.to(socket.room).emit('game_state', {
        state: game.state, // deploy
        players: game.players.map(function(p) {
          return {
            id: p.id,
            ready: p.ready
          };
        })
      });

    } catch (err) {
      socket.emit('game_joined', err);
    }
  })
  .on('deploy', function(fleet) {
    try {
      var game = games[socket.room];
      if (!game) throw "ERR_NO_GAME";
      // TRY DEPLOY
      var result = game.deploy(socket.id.replace('/react#',''), fleet);
      if (result !== 'OK') throw result;

      socket.emit('deployed', result);

      if (game.state == "ENGAGE") {
        nsp.to(socket.room).emit('game_state', {
          state: game.state,
          first: game.players[game.turn].id
        });
      }
    } catch (err) {
      socket.emit('deployed', err);
    }
  })
  .on('fire', function(target) {
    try {
      var game = games[socket.room];
      if (!game) throw "ERR_NO_GAME";
      // TRY fire
      var result = game.fire(socket.id.replace('/react#',''), target);
      if (!/HIT|MISS/.test(result)) throw result;

      nsp.to(socket.room).emit('engage', {
        offence: game.players[game.turn ? 0 : 1].id,
        defence: game.players[game.turn].id,
        target: target,
        result: result,
        sunk: game.sunk
      });

      if (game.state == "END") {
        nsp.to(socket.room).emit('game_state', {
          state: "END",
          winner: game.winner,
          loser: game.loser
        });
      }
    } catch (err) {
      socket.emit('fired', err);
    }
  });
});
//DEFINE SOCKET FUNCTIONS
io.on('connection', function(socket) {
	console.log('new connection ' + socket);
	//Check Last User
	socket.emit('getDATA', LastUser);
	setTimeout( function (){
		if (typeof LastUser != 'undefined' && LastUser) {
			userFound(LastUser);
			console.log("LastUser was " + LastUser);
		}
	}, 1000);
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
	//Chat Message
	socket.on('chat', function(msg) {
		console.log("i am "+socket.userId+" oppo is "+socket.opponentId);
		if(socket.opponentId && msg) {
			console.log("HEY its working");
			socket.oppo.emit('chat', {
			name: socket.userId,
			message: msg,
		});
		console.log("SUP?");

		socket.emit('chat', {
			name: 'Me',
			message: msg,
		});
		}
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
	  //socket.disconnect();
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
				socket.emit('setDATA', userId);
				socket.emit('initialize', users[userId]);
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
		var destination = '/react/#';
		let r = Math.random().toString(36).substring(7);
		socket1.emit('redirect', destination+r);
		socket2.emit('redirect', destination+r);
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