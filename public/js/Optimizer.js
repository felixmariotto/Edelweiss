



function Optimizer() {


	/*
		These two constants define in what range of FPS the game
		will be displayed. The larger the range, the more stable
		it will be, as there will be fewer attempts or optimization/ deoptimization
	*/

	const OPTFPS = 1 / 37 ;	// FPS rate above which optimization must occur
	const DEOPTFPS = 1 / 50 ; // FPS rate under which de-optimisation will occur

	//

	const OPT_STEP = 400 ; // ms duration of FPS sampling between each opti
	var lastOptiTime = 0 ;
	var samples = [];

	//
	
	const domWorldCheap = document.getElementById('worldCheap');
    const domWorldHigh = document.getElementById('worldHigh');
    
    var params = {
    	level: 0,
    	timeOpti: Date.now() // last time an optimisation was done
    };

    /*

	The levels of optimization :
		0 -> No optimization
		1 -> disable FXAA
		2 -> set pixel ratio to devidePixelRatio / 2 (unnoticable on smartphone)
		3 -> remove shadows
		3 -> bring camera's far plane nearer

    */







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

			params.level = 1 ;

		// set pixel ratio to 1, which has effect mostly on smartphones
		} else if ( params.level == 1 ) {

			renderer.setPixelRatio( Math.ceil( window.devicePixelRatio / 2 ) );
			renderer.render( scene, camera );
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

			params.level = 0 ;

		// set pixel ratio to the default device pixel ratio
		} else if ( params.level == 2 ) {

			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.render( scene, camera );
			params.level = 1 ;

		// enable shadows on dynamic objects
		} else if ( params.level == 3 ) {

			renderer.shadowMap.enabled = true;

			atlas.player.group.traverse( (child)=> {

				if ( child.type == 'Mesh' ||
					 child.type == 'SkinnedMesh' ) {

					child.castShadow = true ;
					child.receiveShadow = true ;
				};

			});

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

		if ( Date.now() > lastOptiTime + OPT_STEP ) {

			lastOptiTime = Date.now();

			let total = samples.reduce( ( accu, current )=> {
				return accu + current ;
			}, 0 );

			let average = total / ( samples.length - 1 );
			samples = [];

			if ( average > OPTFPS ) {

	            optimize();

	            console.log( 'opti' );

	        } else if ( average < DEOPTFPS ) {

	        	deOptimize();

	        	console.log( 'de-opti' );

	        };



		} else {

			samples.push( delta );

		};

	};




	return {
		params,
		update
	};

};