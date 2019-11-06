

function DynamicItems() {



	

	var interactionSign = new THREE.Group(); // will contain the sign sprite
	interactionSign.visible = false ;
	scene.add( interactionSign );

	var signedCube ; // which interactive cube have a sign on it
	

	var interactiveCubes = [];
	var triggerCubes = [];
	var inertCubes = [];






	///// INIT


	var spriteMap = textureLoader.load( "https://edelweiss-game.s3.eu-west-3.amazonaws.com/sprites/bubble.png" );
	var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );
	
	sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set( 0.6, 0.4, 0.6 );
	sprite.position.y = 0.6 ;

	interactionSign.add( sprite )




	// Add a cube to the three arrays containing cubes to interact with
	function addCube( logicCube ) {

		switch ( logicCube.type ) {

			case 'cube-interactive' :
				interactiveCubes.push( logicCube );
				break;

			case 'cube-trigger' :
				triggerCubes.push( logicCube );
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



	// barrier-dad
	// barrier-herbalist
	// village-gate





	///// UPDATE


	var updateCounter = 0 ;

	function update( delta ) {

		updateCounter ++ ;

		// executed half the frames
		if ( updateCounter % 2 == 0 ) {

			if ( signedCube ) {

				interactionSign.position.copy( signedCube.position );

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
		deleteCube
	};
};