



function SocketIO() {

	var time = new Date();
	time = time.toTimeString();

	var uaResult = uaParser.getResult();

	var playerInfo;

	function joinGame( id, pass, name ) {

		playerInfo = {

			id, pass, name

		};

		setInterval( function() {

			charaAnim.getPlayerState( playerInfo );

			socket.emit( 'playerInfo', playerInfo );

		}, 300 );

	}


	var socket = io('https://edelweiss.32x.io');

	socket.on('connect', ()=> {

		socket.emit( 'init', {
			browser: uaResult.browser.name,
			browser_version: uaResult.browser.version,
			time
		});

	});


	function sendDeath() {

		var data = JSON.stringify({
			t: Date.now(),
			p: {
				x: atlas.player.position.x.toFixed(1),
				y: atlas.player.position.y.toFixed(1),
				z: atlas.player.position.z.toFixed(1)
			}
		});

		socket.emit( 'death', data );

	};


	function sendOptiLevel() {

		var data = JSON.stringify({
			t: Date.now(),
			l: optimizer.params.level
		});

		socket.emit( 'opti', data );

	};


	function sendBonus( bonusName ) {

		var data = JSON.stringify({
			t: Date.now(),
			b: bonusName
		});

		socket.emit( 'bonus', data );

	};

	function sendDialogue( dialogueName ) {

		var data = JSON.stringify({
			t: Date.now(),
			d: dialogueName
		});

		socket.emit( 'dialogue', data );

	};

	function sendSave( id ) {

		var data = JSON.stringify({
			t: Date.now(),
			id: id
		});

		socket.emit( 'save', data );

	};

	function onPlayerUpdates( handler ) {
		socket.on( 'playerInfo', handler );
	}

	function onPlayerDisconnects( handler ) {
		socket.on( 'playerLeft', handler );
	}

	function sendIsTouchScreen() {
		socket.emit( 'touchscreen' );
	};


	return {
		joinGame,
		onPlayerUpdates,
		onPlayerDisconnects,
		sendDeath,
		sendOptiLevel,
		sendBonus,
		sendDialogue,
		sendSave,
		sendIsTouchScreen
	};

};
