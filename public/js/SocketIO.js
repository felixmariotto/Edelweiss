
function SocketIO() {

	var playerInfo;

	var socket = io( 'https://edelweiss-g.herokuapp.com' /* 'http://edelweiss-stage.herokuapp.com' */ );

	function joinGame( id, pass, name ) {

		playerInfo = {

			id, pass, name

		};

		setInterval( function() {

			charaAnim.getPlayerState( playerInfo );

			socket.emit( 'playerInfo', playerInfo );

		}, 300 );

	};

	function onPlayerUpdates( handler ) {
		socket.on( 'playerInfo', handler );
	};

	function onPlayerDisconnects( handler ) {
		socket.on( 'playerLeft', handler );
	};

	return {
		joinGame,
		onPlayerUpdates,
		onPlayerDisconnects
	};

};
