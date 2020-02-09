



function SocketIO() {

	var uaResult = uaParser.getResult();

	var socket = io();

	socket.emit( 'init', {
		browser: uaResult.browser.name,
		browser_version: uaResult.browser.version
	});


	function sendDeath( timestamp, position ) {

		socket.emit( 'death', {
			timestamp,
			position
		});

	};


	function sendOptiLevel( level ) {

		socket.emit( 'opti', {
			timestamp,
			position
		});

	};

	


	/*
	// Set a global variable ownID, which is a unique ID that the
	// player will keep during all the session, accross all the games.
	// When the server send information to the two players of a game,
	// it does not adapt the information to each player, it is the client
	// that must depart which information set is its own, that's what
	// this variable is for.
	socket.on( 'ownID', (id)=> {
		ownID = id ;
		console.log('this is my ID : ' + id);
		clearInterval( intervalID );
	});

	function sendObstacleDamage( id, damage ) {
		socket.emit( 'obstacleDamaged', id, damage );
	};
	*/

	return {
		sendDeath,
		sendOptiLevel
	};

};