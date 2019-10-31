

function Optimizer() {


	const domWorldCheap = document.getElementById('worldCheap');
    const domWorldHigh = document.getElementById('worldHigh');
    
    var params = {
    	mustCheap: false,
    	timeCheapify: undefined
    };


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

		if ( !params.mustCheap ) {

			switchToCheapRenderer();

		};

	};




	function deOptimize( delta ) {

		console.log( 'de -  optimize' );

		if ( params.mustCheap
			 && params.timeCheapify + 1000 < Date.now() ) {

			switchToHighRenderer();

		};

	};






	//////////////////////////////
	///    GENERAL FUNCTIONS
	//////////////////////////////



	function switchToCheapRenderer() {

		params.timeCheapify = Date.now();

		cheapRenderer.render( scene, camera );

		domWorldHigh.style.display = 'none' ;
		domWorldCheap.style.display = 'inherit';

		params.mustCheap = true ;

		// cheapRenderer.setSize( window.innerWidth, window.innerHeight );
		// currentRenderer = cheapRenderer ;

	};




	function switchToHighRenderer() {

		highRenderer.render( scene, camera );

		domWorldHigh.style.display = 'inherit' ;
		domWorldCheap.style.display = 'none';

		params.mustCheap = false ;

		// cheapRenderer.setSize( window.innerWidth, window.innerHeight );
		// currentRenderer = cheapRenderer ;

	};




	return {
		optimize,
		deOptimize,
		params
	};

};