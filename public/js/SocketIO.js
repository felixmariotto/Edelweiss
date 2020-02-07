



function SocketIO() {

	var socket = io();

	socket.emit( 'test', [ 'place', 'date' ] );



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

};