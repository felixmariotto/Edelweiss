

function DynamicItems() {



	

	var interactionSign = new THREE.Group(); // will contain the sign sprite
	interactionSign.visible = false ;
	scene.add( interactionSign );

	var signedCube ; // which interactive cube have a sign on it
	

	var interactiveCubes = [];
	var triggerCubes = [];
	var inertCubes = [];






	///// INIT


	var spriteMap = textureLoader.load( "https://edelweiss-game.s3.eu-west-3.amazonaws.com/assets/bubble.png" );
	var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );
	
	sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set( 0.3, 0.6, 1 );
	sprite.position.y = 0.6 ;

	interactionSign.add( sprite )




	// Add a cube to the three arrays containing cubes to interact with
	function addCube( logicCube ) {

		switch ( logicCube.type ) {


			case 'cube-interactive' :

				interactiveCubes.push( logicCube );

				if ( logicCube.tag.match( /npc/ ) &&
					 !logicCube.tag.match( /npc-respawn/ ) &&
					 !logicCube.tag.match( /npc-dev/ ) ) {

					assetManager.createNewLady( logicCube );

				} else if ( logicCube.tag.match( /npc-respawn/ ) ) {

					assetManager.createNewAlpinist( logicCube );

				};

				break;


			case 'cube-trigger' :

				triggerCubes.push( logicCube );

				if ( logicCube.tag &&
					 logicCube.tag.match( /bonus-stamina/ ) ) {

					assetManager.createNewEdelweiss( logicCube );

				} else if ( logicCube.tag &&
							logicCube.tag.match( /bonus/ ) ) {

					assetManager.createNewBonus( logicCube );

				};

				break;


			case 'cube-inert' :
				inertCubes.push( logicCube );
				break;

		};

	};




	// Delete a cube from the scene graph and the arrays referencing it
	function deleteCube( name ) {

		let logicCube = getCubeByName( name );

		logicCube.helper.geometry.dispose();
		scene.remove( logicCube.helper );

		atlas.deleteCubeFromGraph( logicCube );

		[ inertCubes, interactiveCubes, triggerCubes ].forEach( ( cubes )=> {

			cubes.forEach( ( cube, i )=> {

				if ( cube == logicCube ) {

					cubes.splice( i, 1 );

				};
				
			});

		});

	};





	function getCubeByName( name ) {

		let x ;

		[ inertCubes, interactiveCubes, triggerCubes ].forEach( ( cubes )=> {

			cubes.forEach( ( logicCube )=> {

				if ( logicCube.tag == name ) {

					if ( x ) console.error( 'x already defined' );

					x = logicCube ;

				};
				
			});

		});

		return x ;

	};















	////// ANIMATIONS


	/*

	This animation system can be used to apply pre-written movements tracks
	to cubes. All the tracks describing the movements are stocked in the array
	'tracks'. A new animation can be initiated by calling 
	actuateCube( cubeToActuate, trackName ). This function create a new action
	object, that contain the cube to move, the track to apply, and the relative time.
	It also add this new action to the array 'actionsToPlay', that is checked each
	frame by the update function, to know what transform to apply.

	*/

	
	// tracks array stock the tracks that can be applied to cubes.
	tracks = {

		'move-from-wall' : [
			{ d: 1000, x: 0.018 }
		]

	};


	// store the actions to play in the update function
	actionsToPlay = [];



	// create a new action obj that will tell the update function how to transform the cube
	function actuateCube( cubeName, trackName ) {

		let logicCube = getCubeByName( cubeName );

		let action = {
			logicCube,
			track: tracks[ trackName ],
			t: 0
		};

		actionsToPlay.push( action );

	};















	///// UPDATE

	var moveSpeedRatio ;
	var updateCounter = 0 ;
	var actionVec = new THREE.Vector3();



	function update( delta ) {

		moveSpeedRatio = delta / ( 1 / 60 ) ;

		updateCounter ++ ;

		// executed half the frames
		if ( updateCounter % 2 == 0 ) {

			if ( signedCube ) {

				interactionSign.position.copy( signedCube.position );

			};

		};


		// UPDATE CUBES ACCORDING TO ACTIONS
		if ( actionsToPlay.length > 0 ) {

			for ( let i = actionsToPlay.length -1 ; i > -1 ; i-- ) {

				// update relative time of the action
				actionsToPlay[ i ].t += delta * 1000 ;

				// Get the current step in the action track
				let acc = 0 ;
				let stepID ;

				for ( let j = 0 ; j < actionsToPlay[ i ].track.length ; j++ ) {

					stepID = j ;
					acc += actionsToPlay[ i ].track[ j ].d ;

					// break the loop if step "j" is unfinished
					if ( actionsToPlay[ i ].t < acc ) {

						break ;

					// tracks is finished
					} else if ( j == actionsToPlay[ i ].track.length -1 ) {

						// delete the action
						actionsToPlay.splice( i, 1 );
						break ;

					};

				};

				if ( actionsToPlay[ i ] ) {

					// Set the transform vector according th track's value
					actionVec.set(
						( actionsToPlay[ i ].track[ stepID ].x * moveSpeedRatio || 0 ),
						( actionsToPlay[ i ].track[ stepID ].y * moveSpeedRatio || 0 ),
						( actionsToPlay[ i ].track[ stepID ].z * moveSpeedRatio || 0 ) 
					);

					// Add transform vector to the logicCube's position
					actionsToPlay[ i ].logicCube.position.x += actionVec.x ;
					actionsToPlay[ i ].logicCube.position.y += actionVec.y ;
					actionsToPlay[ i ].logicCube.position.z += actionVec.z ;

					// Move the helper
					actionsToPlay[ i ].logicCube.helper.position.copy(
						actionsToPlay[ i ].logicCube.position
					);

				};

			};

		};

	};













	////////////////////////
	///  INTERACTION SIGN
	////////////////////////


	// Find the cube-interactive that hold the requested tag,
	// and assign it to the var signedCube, which will be
	// used to position the tag in the update function
	function showInteractionSign( tag ) {

		interactionSign.visible = true ;

		interactiveCubes.forEach( ( logicCube )=> {

			if ( logicCube.tag == tag ) {

				signedCube = logicCube ;

			};
			
		});

	};



	function clearInteractionSign() {

		interactionSign.visible = false ;

		signedCube = undefined ;

	};





	return {
		update,
		showInteractionSign,
		clearInteractionSign,
		addCube,
		deleteCube,
		actuateCube
	};
};