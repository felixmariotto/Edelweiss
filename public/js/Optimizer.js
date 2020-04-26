
function Optimizer() {

	/*
		These two constants define in what range of FPS the game
		will be displayed. The larger the range, the more stable
		it will be, as there will be fewer attempts or optimization/ deoptimization
	*/

	const OPTFPS = 1 / 28 ;	// FPS rate above which optimization must occur
	const DEOPTFPS = 1 / 53 ; // FPS rate under which de-optimisation will occur

	//

	var optStep = 50 ; // ms duration of FPS sampling between each opti
	var lastOptiTime = 0 ;
	var samples = [];

	//
	
	const domWorldCheap = document.getElementById('worldCheap');
    const domWorldHigh = document.getElementById('worldHigh');
    
    var params = {
    	level: 0,
    	attempts: [ 0, 0, 0, 0, 0 ], // holds the number of failed attempt to set the optimization at given level
    	timeOpti: Date.now() // last time an optimisation was done
    };

    /*
		optimize is called by the loop everytime the frame rate
		is above the OPTFPS (which means rendering is slow).
		It will increment the level of optimization by one,
		so rendering will be faster, with worst graphics as
		a trade-off
    */
	function optimize() {

		// Will disable FXAA
		if ( params.level == 0 ) {

			renderer.setPixelRatio( 1 );
			params.level = 1 ;

		// set pixel ratio to 1, which has effect mostly on smartphones
		} else if ( params.level == 1 ) {

			params.level = 2 ;

		// Remove the shadow from the dynamic objects,
		// and stop rendering shadows dynamically
		} else if ( params.level == 2 ) {

			assetManager.toggleCharacterShadows( false );

			setTimeout( ()=> {
				renderer.shadowMap.enabled = false;
			}, 0);

	    	params.level = 3 ;

		} else if ( params.level == 3 ) {

			camera.far = 11.5 ;
			camera.updateProjectionMatrix();

			params.level = 4 ;

		};

	};

	/*
		deOptimize is called by the loop every time the frame rate
		is under DEOPTFPS (meaning rendering is fast).
		It will decrement the level of optimization by one,
		which will make graphics better but frame rate maybe lower
	*/
	function deOptimize() {

		// There is already no optimization occuring
		if ( params.level == 0 ) {

			return

		// enable FXAA
		} else if ( params.level == 1 ) {

			renderer.setPixelRatio( window.devicePixelRatio );
			params.level = 0 ;

		// set pixel ratio to the default device pixel ratio
		} else if ( params.level == 2 ) {

			params.level = 1 ;

		// enable shadows on dynamic objects
		} else if ( params.level == 3 ) {

			renderer.shadowMap.enabled = true;

			assetManager.toggleCharacterShadows( true );

	    	params.level = 2 ;

		} else if ( params.level == 4 ) {

			camera.far = 23.5 ;
			camera.updateProjectionMatrix();

			params.level = 3 ;

		};

	};

	//////////////////////////////
	///    GENERAL FUNCTIONS
	//////////////////////////////

	/*
	update will sample the current frame's delta, then when it's time
	to decide if an opti/de-opti is needed, it decides over an average of
	the sampled deltas.
	*/
	function update( delta ) {

		// We don't want neither to optimize or to sample the performance
		// inside the caves, because it would necessarily be better,
		// and lead to uneven randering and opti/deopti
		if ( mapManager.params.currentMap != 'mountain' ) return ;

		if ( Date.now() > lastOptiTime + optStep ) {

			lastOptiTime = Date.now();

			if ( optStep < 3200 ) {

				optStep *= 2 ;

			};

			let total = samples.reduce( ( accu, current )=> {

				return accu + current ;
				
			}, 0 );

			let average = total / ( samples.length - 1 );
			samples = [];

			if ( average < DEOPTFPS &&
				 params.level != 0 &&
				 params.attempts[ params.level - 1 ] <= 2 ) {

	            deOptimize();

	        } else if ( average > OPTFPS ) {

	        	params.attempts[ params.level ] ++ ; // record the failure of the current opti level
	        	optimize();

	        };

		} else {

			samples.push( delta );

		};

	};

	//

	return {
		params,
		update
	};

};
