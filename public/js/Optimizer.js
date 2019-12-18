



function Optimizer() {


	/*
		These two constants define in what range of FPS the game
		will be displayed. The larger the range, the more stable
		it will be, as there will be fewer attempts or optimization/ deoptimization
	*/

	const OPTFPS = 1 / 32 ;	// FPS rate above which optimization must occur
	const DEOPTFPS = 1 / 50 ; // FPS rate under which de-optimisation will occur

	//

	const OPT_STEP = 300 ; // ms duration of FPS sampling between each opti
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
	function optimize() {

		// change renderer to display the no-antialiasing one
		if ( params.level == 0 ) {

			switchToCheapRenderer();
			params.level = 1 ;

		// set pixel ratio to 1, which has effect mostly on smartphones
		} else if ( params.level == 1 ) {

			cheapRenderer.setPixelRatio( 1 );
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






	//////////////////////////////
	///    GENERAL FUNCTIONS
	//////////////////////////////



	function switchToCheapRenderer() {

		cheapRenderer.render( scene, camera );

		domWorldCheap.style.display = 'inherit';
		domWorldHigh.style.display = 'none' ;

		params.mustCheap = true ;

	};




	function switchToHighRenderer() {

		highRenderer.render( scene, camera );

		domWorldHigh.style.display = 'inherit' ;
		domWorldCheap.style.display = 'none';

		params.mustCheap = false ;

	};





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

	        } else if ( average < DEOPTFPS ) {

	        	deOptimize();

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