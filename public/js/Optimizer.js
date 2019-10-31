

function Optimizer() {


	cheapRenderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('world'),
        antialias: false
    });
    
    cheapRenderer.setPixelRatio( window.devicePixelRatio / 2 );
    cheapRenderer.setSize( window.innerWidth, window.innerHeight );
    cheapRenderer.shadowMap.enabled = true ;

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

		renderer = cheapRenderer ;

	};




	function deOptimize( delta ) {

		console.log( 'de -  optimize' );

	};




	return {
		optimize,
		deOptimize,
		cheapRenderer
	};

};