
function DynamicItems() {

	var interactionSign = new THREE.Group(); // will contain the sign sprite
	interactionSign.visible = false ;
	scene.add( interactionSign );
	
	var interactiveCubes = [];

	// INIT

	var spriteMap = textureLoader.load( "https://edelweiss-game.s3.eu-west-3.amazonaws.com/assets/bubble.png" );
	var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );
	
	sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set( 0.3, 0.6, 1 );
	sprite.position.y = 0.6 ;

	interactionSign.add( sprite )

	//

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

				if ( logicCube.tag &&
					 logicCube.tag.match( /bonus-stamina/ ) ) {

					assetManager.createNewEdelweiss( logicCube );

				} else if ( logicCube.tag &&
							logicCube.tag.match( /bonus/ ) ) {

					assetManager.createNewBonus( logicCube );

				};

				break;

		};

	};

	////////////////////////
	///  INTERACTION SIGN
	////////////////////////

	function showInteractionSign( tag ) {

		interactionSign.visible = true ;

		interactiveCubes.forEach( ( logicCube )=> {

			if ( logicCube.tag == tag ) {

				interactionSign.position.copy( logicCube.position );

			};
			
		});

	};

	//

	function clearInteractionSign() {

		interactionSign.visible = false ;

	};

	//

	return {
		showInteractionSign,
		clearInteractionSign,
		addCube
	};

};
