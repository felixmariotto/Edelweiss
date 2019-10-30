

function Optimizer() {

	// remove shadows
	/*

	if ( delta > 1 / 30 ) {

		renderer.shadowMap.enabled = false;

    	if ( cameraControl ) {

    		renderer.clearT( cameraControl.directionalLight.shadowMap );

    	};

    	console.log('remove shadows')

	};
	*/



	function optimize( delta ) {

		console.log( 'optimize' );

		renderer.setPixelRatio( window.devicePixelRatio / 2 );

	};




	function deOptimize( delta ) {

		console.log( 'de -  optimize' );

	};




	return {
		optimize,
		deOptimize
	};

};