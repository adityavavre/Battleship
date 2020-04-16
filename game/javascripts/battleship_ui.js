(function (root) {
  var App = root.App = (root.App || {});
  var BattleshipUI = App.BattleshipUI = function(options){
    this.$root = options.$root;
    this.socket = options.socket;
    this.myHit = new hitHelper();
    this.ourBoard = [];
    this.oppBoard = [];
    this.shipCounter = 0;
    this.takenPositions = {};
    this.ableToFire = false;
    this.hitShipSegments = [];
    this.createGrids();
    this.displayGrids();
    this.ships = this.createShips();
  };
  BattleshipUI.prototype = {
    createShips: function(){
        var ships = [];
        var shipOne = new Ship({length:2});
        ships.push(shipOne);
        var shipTwo = new Ship({length:3});
        ships.push(shipTwo);
        var shipThree = new Ship({length:3});
        ships.push(shipThree);
        var shipFour = new Ship({length:4});
        ships.push(shipFour);
        var shipFive = new Ship({length:5});
        ships.push(shipFive);
        return ships;
    },
    registerHandlers: function(){
      var battleshipUI = this;
      this.socket.on('placeShips', function(payload) {
        $("#game-announcement").html("Click on a tile to place your ship and then click on another tile denoting possible endpoints of that ship.");
        $("#board1 .blueTile").on("click", battleshipUI.placeShips.bind(battleshipUI));
      });
      this.socket.on('notifySinglePlayer', function() {
        $("#game-announcement").html("Welcome to the Battle of the Iron Islands.");
      });
      this.socket.on('goTime', function() {
        $("#game-announcement").html("The Battle Begins!");
      });
      this.socket.on('youSuck', function() {
        $("#game-announcement").html("Winter is HERE! Just place your Navy Already!");
      });
      this.socket.on('firstPlayer', function() {
        $("#game-announcement").html("You finished placing ships first: once your partner catches up, you will drop first bomb.");
      });
      this.socket.on('yourTurn', function() {
        $("#game-announcement").html("Your Turn");
        battleshipUI.ableToFire = true;
		var counter=5;
		var timer=setInterval(foo, 100);
		function foo(){
			$('#time').text("Until next move: "+Number((counter).toFixed(2)));
			if(counter<=0 || !battleshipUI.ableToFire){
				clearInterval(timer);
				if(counter<=0){		
					$('#time').text("Until next move: "+"Oops");
					battleshipUI.ableToFire = false;
					this.socket.emit("SHOT_RESPONSE", {gameLost:true});
				}
			}
			else{
				counter-=0.1;
				$("#board2 .tile").on("click", battleshipUI.handleShot.bind(battleshipUI));
			}
		}
        
      });
      this.socket.on('notYourTurn', function() {
        $("#game-announcement").html("Your speed has cost you the chance to attack first.");
      });
      this.socket.on('SHOT', function(coords) {   
        var gameLost = false;     
        var hit;
        var takenCoords = [coords.row, coords.col];
        var hitSquare = $(battleshipUI.ourBoard[coords.row][coords.col].children()[0]);
        battleshipUI.ableToFire = true;
        if(battleshipUI.takenPositions[takenCoords]){
          battleshipUI.hitShipSegments.push(takenCoords);
          if(battleshipUI.hitShipSegments.length === 17){
            gameLost = true;
          }
          hit = true;
          battleshipUI.myHit.myHitHandler(coords, hitSquare)
        } else {
          hit = false;
          $(hitSquare).addClass("nohit");
        }
        battleshipUI.socket.emit("SHOT_RESPONSE", {hit: hit, row: coords.row, col: coords.col, gameLost: gameLost});
      })
      this.socket.on('makeNotTurn', function(params) {
        var hitSquare = $(battleshipUI.oppBoard[params.row][params.col].children()[0]);
        $("#board2 .blueTile").off("click");
        battleshipUI.ableToFire = false;
        if(params.hit){
          var message = "HIT!!!!!" + '<br>' + "Waiting for opponent's shot";
          battleshipUI.myHit.myHitHandler(params, hitSquare, message);
        } else {
          $(hitSquare).addClass("nohit");
          $("#game-announcement").html("swing and a miss..." + '<br>');
          $("#game-announcement").append("Waiting for opponent's shot");
        }
      })
      this.socket.on('GAME_OVER', function(object){
        var params = object[0];
        var gameOverResponse = object[1];
        var didWin = object[2];
        $("#board2 .blueTile").off("click");
        if(didWin){
          /*var hitSquare = $(battleshipUI.oppBoard[params.row][params.col].children()[0]);
          battleshipUI.myHit.myHitHandler(params, hitSquare)*/
		  sessionStorage.setItem('win', 1);
		  sessionStorage.setItem('loss', 0);
        }
		else{
			sessionStorage.setItem('win', 0);
			sessionStorage.setItem('loss', 1);
		}	
        battleshipUI.ableToFire = false;
        $("#game-announcement").html(gameOverResponse + '<br>');
        $("#game-announcement").append("Go to localhost:3000 or press the 'Back' button to get 'Back' in the game");
		//setTimeout(function (){location.href="/";}, 1000);
      })
    },
    handleShot: function(e){
      if($(e.currentTarget.children[0]).hasClass("nohit") || $(e.currentTarget.children[0]).hasClass("hit")){
        alert("It's not a White Walker!!! Kill it once and thats enough");
        return;
      }
      if(this.ableToFire){
        e.preventDefault();
        this.ableToFire = false;
        var rowCord = parseInt(e.currentTarget.dataset.row);
        var colCord = parseInt(e.currentTarget.dataset.col);
        var coords = {row: rowCord, col: colCord};
        $("#board2 .blueTile").off("click");
        $("#game-announcement").html("FIRING...");
        var battleshipUI = this;
        battleshipUI.socket.emit("HANDLE_SHOT_RESPONSE", coords);
      }
    },
    createGrids: function(){
      for (var i = 0; i < 2; i++) {
        for (var j = 0; j < 10; j++) {
          var row = [];
          for (var k = 0; k < 10; k++) {
            var div = document.createElement("div");
            var childDiv = document.createElement("div");
            var $div = $(div);
            var $childDiv = $(childDiv);
            $div.append($childDiv);
            $div.addClass("tile")
            $childDiv.addClass("blueTile");
            $div.attr('data-row', j);
            $div.attr('data-col', k);
            row.push($div);
          }
          if(i === 0){
            this.ourBoard.push(row);
          } else {
            this.oppBoard.push(row);
          }
        }
      }
    },
    displayGrids: function () {
      var $board1 = this.$root.find("#board1");
      var $board2 = this.$root.find("#board2");
      for(var i = 0; i < this.ourBoard.length; i++){
        for(var j = 0; j < this.ourBoard[i].length; j++){
          $board1.append(this.ourBoard[i][j]);
          $board2.append(this.oppBoard[i][j]);
        }
      }
      this.registerHandlers();
    },
    placeShips: function(event){
      var currentCoord = [$(event.currentTarget.parentElement).data("row"),
                          $(event.currentTarget.parentElement).data("col") ];
      var currentShip = this.ships[this.shipCounter];
      currentShip.startCoord = currentCoord;
      var validCoords = this.possibleCoords(currentCoord, currentShip.length - 1);
      if(validCoords.length > 0){
        $(event.currentTarget).removeClass("blueTile").addClass("greenTile");
        $("#board1 .blueTile").off();
      }else{
        $("#board1 .blueTile").on("click", this.placeShips.bind(this));
      }
      for (var i = 0; i < validCoords.length; i++) {
        var $tempTile = $($(this.ourBoard[validCoords[i][0]][validCoords[i][1]]).children()[0]);
        $tempTile.removeClass("blueTile");
        $tempTile.off();
        $tempTile.addClass("redTile");
        $tempTile.on("click", this.placeNextShip.bind(this));
      }
    },
    placeNextShip: function(event){
      var placementCoord = [$(event.currentTarget.parentElement).data("row"),
                          $(event.currentTarget.parentElement).data("col") ];
      var placements = this.$root.find(".redTile");
      placements.removeClass("redTile");
      placements.addClass("blueTile");
      placements.off();      
      //update coords once ship has been placed
      var targetShip = this.ships[this.shipCounter];
      targetShip.endCoord = placementCoord;
      targetShip.detectCoords();
      for(var i = 0; i < targetShip.segments.length; i ++) {
        var tempCoords = targetShip.segments[i];
        this.takenPositions[tempCoords] = true;
        var $tempTile = $($(this.ourBoard[tempCoords[0]][tempCoords[1]]).children()[0]);
        $tempTile.removeClass("blueTile");
        $tempTile.addClass("greenTile");
      }
      this.shipCounter += 1;
      if(this.shipCounter === 5){
        this.socket.emit("shipsPlaced");
        return;
      } else {
        $("#board1 .blueTile").on("click", this.placeShips.bind(this));
      }
    },
    possibleCoords: function(startCoords, length){
      var validCoords = [];
      var offsets = [];
      var rowOffPos = [startCoords[0] + length, startCoords[1]];
      var good = true;
      for (var i = startCoords[0] ; i <= (startCoords[0] + length); i++) {
        var tempRowOffPos = [i, startCoords[1]];
        if (this.takenPositions[tempRowOffPos]) {
          good = false;
        }
      }
      if(good){
        offsets.push(rowOffPos);
      }
      var rowOffNeg = [startCoords[0] - length, startCoords[1]];
      var good2 = true;
      for (var i = startCoords[0] - length ; i <= (startCoords[0]); i++) {
        var tempRowOffNeg = [i, startCoords[1]];
        if (this.takenPositions[tempRowOffNeg]) {
          good2 = false;
        }
      }
      if(good2){
        offsets.push(rowOffNeg);
      }
      var colOffPos = [startCoords[0], startCoords[1] + length];
      var good3 = true;
      for (var i = startCoords[1]; i <= (startCoords[1] + length); i++) {
        var tempColOffNeg = [startCoords[0], i];
        if (this.takenPositions[tempColOffNeg]) {
          good3 = false;
        }
      }
      if(good3){
        offsets.push(colOffPos);
      }
      var colOffNeg = [startCoords[0], startCoords[1] - length];
      var good4 = true;
      for (var i = startCoords[1] - length; i <= (startCoords[1]); i++) {
        var tempColOffNeg = [startCoords[0], i];
        if (this.takenPositions[tempColOffNeg]) {
          good4 = false;
        }
      }
      if(good4){
        offsets.push(colOffNeg);
      }
      for(var i = 0; i < offsets.length; i++){
        if(offsets[i][0] >= 0 && offsets[i][0] <= 9  &&
          offsets[i][1] >= 0 && offsets[i][1] <= 9 ){
          validCoords.push(offsets[i])
        }
      }
      return validCoords;
    },
    shoot: function(event){
      var oppCoord = [$(event.currentTarget).data("row"),
                          $(event.currentTarget).data("col") ];
      var that = this;
        that.myHit.myHitHandler(oppCoord);
    },
    autopopulate: function(){
      var ships = this.socket.shipsToPlace;
      for (var i = 0; i < 5; i++) {
        for (var j = 0; j < ships[i].length; j++) {
          ships[i].segments[j] = [i,j];
          $(this.ourBoard[i][j]).addClass("greenTile");
        }
      }
      $("#board1 .tile").off();
      $("#board2 .tile").on("click", this.shoot.bind(this));
    }
  };
}(this));
function hitHelper(){}
hitHelper.prototype = {
  myHitHandler: function(params, hitSquare, message){
    var displayMessage = message || "dontDisplay";
    var $hitSquare = $(hitSquare);
    $hitSquare.addClass("explosion");
    var that = this;
    window.setTimeout(function(){
      if(!(displayMessage === "dontDisplay")){
        $("#game-announcement").html(displayMessage);
      } 
      $hitSquare.addClass("hit");
    }, 800);
  },
}
function Ship(options){
  this.length = options.length
  this.segments = [];
  this.startCoord;
  this.endCoord;
}

Ship.prototype = {
  detectCoords: function(){
    var direction;
    var startY;
    var endRow;
    //if they are on the same row
    if (this.startCoord[0] === this.endCoord[0]) {
      if (this.startCoord[1] < this.endCoord[1]) {
        startY = this.startCoord[1];
        endY = this.endCoord[1];
      }else{
        endY = this.startCoord[1];
        startY = this.endCoord[1];
      }
      for (var i = startY; i <= endY; i++) {
        this.segments.push([this.startCoord[0], i])
      }
    }
    //if they are all in the same col
    if (this.startCoord[1] === this.endCoord[1]) {
      if (this.startCoord[0] < this.endCoord[0]) {
        startY = this.startCoord[0];
        endY = this.endCoord[0];
      }else{
        endY = this.startCoord[0];
        startY = this.endCoord[0];
      }
      for (var i = startY; i <= endY; i++) {
        this.segments.push([i, this.startCoord[1]]);
      }
    }

  }
}

