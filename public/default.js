(function () {
    WinJS.UI.processAll().then(function () {
      var socket, serverGame;
      var username, playerColor, oppo;
      var game, board;
	  var wins, losses, rating;
      var usersOnline = [];
	  var scores = [];
      socket = io();
	  socket.on('setScores', function(msg){
		 scores=msg; 
	  });
	  socket.on('initialize', function(data){
		  wins=Number(data['wins']);
		  wins+=Number(sessionStorage.getItem('win'));
		  sessionStorage.setItem('wins', 0);
		  losses=Number(data['losses']);
		  losses+=Number(sessionStorage.getItem('loss'));
		  sessionStorage.setItem('losses', 0);
		  rating=data['rating'];
		  socket.emit('updateDict', {"userId":username, "wins":wins, "losses":losses});
		  $('#wins').text("No. of Wins "+wins);
		  $('#losses').text("No. of Losses "+losses);
		  $('#rating').text("Rating: "+rating);
	  });
	  socket.on('setText', function(key, val){
		  $(key).text(val);
	  });
      socket.on('login', function(msg) {
            usersOnline = msg.users;
            updateUserList();
      });
      socket.on('joinlobby', function (msg) {
        addUser(msg);
      });
       socket.on('leavelobby', function (msg) {
        removeUser(msg);
		socket.emit('displaythis', "removing "+msg+" i am "+username);
      });
      socket.on('logout', function (msg) {
        removeUser(msg);
      });
	  socket.on('redirect', function(dest){
		  location.href=dest;
	  });
	  socket.on('paired', function (msg){
		  $('#message-box').show();
		  $('#messages-list').show();
	  });
	  socket.on('request', function(msg){
		  $('#opponent').text(msg);
		  $('#invites').show();
	  });
	  socket.on('disp', function(msg){
		  $('#msg').text(msg);
		  $('#myModal').modal('show');
      });
      socket.on('loggedin', function(msg){
				username=msg;
				$('#userLabel').text(username);
				$('#page-login').hide();
				$('#page-lobby').show();
	  });
	  socket.on('setDATA', function(key, val){
		   sessionStorage.setItem(key, val);		  
	  });
	  socket.on('getDATA', function(msg){
		  socket.emit('getVal', sessionStorage.getItem(msg));
	  });
	  socket.on('disconnect', function(msg){
		  socket.emit('disconnect');
	  });
	  $('#Accept').on('click', function(){
		  $('#invites').hide();
		  oppo=$('#opponent').text();
		  if(oppo.length >0){
			  socket.emit('accept', oppo);
		  }
	  });
	  $('#Decline').on('click', function(){
		  $('#invites').hide();
	  });
      $('#login').on('click', function() {
        username = $('#username').val();
        pass=$('#password').val();
        if (username.length > 0 && pass.length > 0) {
            $('#userLabel').text(username);
            socket.emit('login', {u:username, p:pass});
        } 
      });
      $('#register').on('click', function() {
        username = $('#username').val();
        pass=$('#password').val();
        if (username.length > 0 && pass.length > 0) {
            socket.emit('register',{u: username, p:pass});
        } 
      });
	  $('#scoreboard').on('click', function(){
		  socket.emit('scoreboard', "FOO");
		  setTimeout(function(){
			  document.getElementById('scoreboardDisp').innerHTML = '';
				$('#scoreboardDisp').show();
			scores.forEach(function(user) {
			$('#scoreboardDisp').append($('<h4>').text("Username: "+user[0]+" Wins: "+user[1]+" Losses: "+user[2]));
		  })}, 1000);
	  });
      $('#logout').on('click', function(){
		  sessionStorage.removeItem('username');
		  socket.emit('mylogout',  'Logging out');
		  location.reload();
	  });
      var addUser = function(userId) {
        usersOnline.push(userId);
        updateUserList();
      };
	var updateMyData = function(){
			var mywins, mylosses;
			mywins=sessionStorage.getItem('win');
			sessionStorage.setItem('win', 0);
			mylosses=sessionStorage.getItem('loss');
			sessionStorage.setItem('loss', 0);
			wins+=mywins;
			losses+=mylosses;
			socket.emit('updateData', username, wins, losses, ratings);
		}
     var removeUser = function(userId) {
          for (var i=0; i<usersOnline.length; i++) {
            if (usersOnline[i] === userId) {
                usersOnline.splice(i, 1);
            }
         }
         updateUserList();
      };
      var updateUserList = function() {
        document.getElementById('userList').innerHTML = '';
        usersOnline.forEach(function(user) {
          $('#userList').append($('<button>')
                        .text('Username: '+user)
                        .on({'mouseenter': function () {
								socket.emit('populate', user);
								$('#userProfile').show();
							},
							'mouseleave': function (){
								$('#userProfile').hide();
							}
							,
							'click': function() {
								socket.emit('invite',  user);
							}
						}));
        });
      };
    });
})();