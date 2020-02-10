



function SocketIO() {

	var time = new Date();
	time = time.toTimeString();

	var uaResult = uaParser.getResult();

	var socket = io();

	socket.emit( 'init', {
		browser: uaResult.browser.name,
		browser_version: uaResult.browser.version,
		time
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


	function sendIsTouchScreen() {
		socket.emit( 'touchscreen' );
	};


	return {
		sendDeath,
		sendOptiLevel,,
		sendBonus
		sendIsTouchScreen
	};

};