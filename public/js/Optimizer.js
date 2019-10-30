

function Optimizer( delta ) {

	// remove shadows

	if ( delta > 1 / 30 ) {

		renderer.shadowMap.enabled = false;

    	if ( cameraControl ) {

    		renderer.clearT( cameraControl.directionalLight.shadowMap );

    	};

    	console.log('remove shadows')

	};

};