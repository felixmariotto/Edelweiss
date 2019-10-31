

function Optimizer() {


	const OPTTIME = 500 ;	// timeout before optimizing
	const DEOPTTIME = 600 ; // timeout before de-optimizing

	const OPTFPS = 1 / 58 ;	// FPS rate above which optimization must occur
	const DEOPTFPS = 1 / 60 ; // FPS rate under which de-optimisation will occur

	const domWorldCheap = document.getElementById('worldCheap');
    const domWorldHigh = document.getElementById('worldHigh');
    
    var params = {
    	level: 0,
    	timeOpti: Date.now() // last time an optimisation was done
    };

    /*

	The levels of optimization :
		0 -> No optimization
		1 -> cheapRenderer instead of highRenderer (only diff: no antialias)
		2 -> set pixel ratio to devidePixelRatio / 2 (unnoticable on smartphone)
		3 -> remove shadows

    */







    /*
		optimize is called by the loop everytime the frame rate
		is above the OPTFPS (which means rendering is slow).
		It will increment the level of optimization by one,
		so rendering will be faster, with worst graphics as
		a trade-off
    */
	function optimize( delta ) {

		if ( params.timeOpti + OPTTIME < Date.now() ) {

			params.timeOpti = Date.now();

			// change renderer to display the no-antialiasing one
			if ( params.level == 0 ) {

				switchToCheapRenderer();
				params.level = 1 ;

			// make pixel ratio lower, which make the screen more
			// pixelated, but hardly noticable on smartphone
			} else if ( params.level == 1 ) {

				cheapRenderer.setPixelRatio( window.devicePixelRatio / 2 );
				cheapRenderer.render( scene, camera );
				params.level = 2 ;

			// Remove the shadow from the dynamic objects,
			// and stop rendering shadows dynamically
			} else if ( params.level == 2 ) {

				atlas.player.group.traverse( (child)=> {

					if ( child.type == 'Mesh' ||
						 child.type == 'SkinnedMesh' ) {

						child.castShadow = false ;
						child.receiveShadow = false ;
					};

				});

				cheapRenderer.render( scene, camera );

				setTimeout( ()=> {
					cheapRenderer.shadowMap.enabled = false;
				}, 0);

		    	params.level = 3 ;

			};

		};

	};




	/*
		deOptimize is called by the loop every time the frame rate
		is under DEOPTFPS (meaning rendering is fast).
		It will decrement the level of optimization by one,
		which will make graphics better but frame rate maybe lower
	*/
	function deOptimize( delta ) {

		// Respect a timeout before any attempt of de-optimizing
		if ( params.timeOpti + DEOPTTIME < Date.now() ) {

			params.timeOpti = Date.now();

			// There is already no optimization occuring
			if ( params.level == 0 ) {

				return

			// set the high quality renderer with antialiasing
			} else if ( params.level == 1 ) {

				switchToHighRenderer();
				params.level = 0 ;

			// set pixel ratio to the default device pixel ratio
			} else if ( params.level == 2 ) {

				cheapRenderer.setPixelRatio( window.devicePixelRatio );
				cheapRenderer.render( scene, camera );
				params.level = 1 ;

			// enable shadows on dynamic objects
			} else if ( params.level == 3 ) {

				cheapRenderer.shadowMap.enabled = true;

				atlas.player.group.traverse( (child)=> {

					if ( child.type == 'Mesh' ||
						 child.type == 'SkinnedMesh' ) {

						child.castShadow = true ;
						child.receiveShadow = true ;
					};

				});

		    	params.level = 2 ;

			};

		};

	};






	//////////////////////////////
	///    GENERAL FUNCTIONS
	//////////////////////////////



	function switchToCheapRenderer() {

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
		params,
		OPTFPS,
		DEOPTFPS
	};

};