
/*
	AssetManager keeps track of all the special assets like animated NPCs and bonuses.
	At initialisation, it create groups that will hold the loaded assets once loading is done.
	AssetManager is able to hide/show the groups when gameState tells it to change of graph.
*/

function AssetManager() {

	// assets constants
	const SCALE_ALPINIST = 0.1 ;
	const SCALE_LADY = 0.08 ;
	const SCALE_CHAR = 0.075 ;
	const SCALE_EDELWEISS = 0.02 ;

	const OFFSET_EDELWEISS = new THREE.Vector3( 0, 0.1, 0 );

	const particleMaterial = new THREE.MeshBasicMaterial({ color:0xffffff });

	// What graph the player is currently playing in ?
	var currentGraph = 'mountain' ;

	var charGlb;

	// will be used to add a label at the top of the hero if multiplayer
	const textCanvas = document.createElement( 'canvas' );
	textCanvas.height = 34;

	// Hold one mixer and one action per asset iteration
	var alpinistMixers = [], alpinistIdles = [];
	var ladyMixers = [], ladyIdles = [];
	var charMixers = [], charActions = [];

	// Asset groups arrays
	var alpinists = [];
	var edelweisses = [];
	var ladies = [];
	var bonuses = [];
	var characters = [];

	// different sets of color for the hero character,
	// for multiplayer differentiation.
	var charSkins = [
		textureLoader.load( 'assets/models/hero-texture-0.png' ),
		textureLoader.load( 'assets/models/hero-texture-1.png' ),
		textureLoader.load( 'assets/models/hero-texture-2.png' ),
		textureLoader.load( 'assets/models/hero-texture-3.png' )
	];

	//////////////
	///   INIT
	//////////////

	// Create one group per iteration, before the assets is loaded/created
	addGroups( alpinists, 10 );
	addGroups( edelweisses, 7 );
	addGroups( ladies, 12 );
	addGroups( bonuses, 9 );
	addGroups( characters, 4 );

	function addGroups( arr, groupsNumber ) {

		for ( let i = 0 ; i < groupsNumber ; i++ ) {

			let group = new THREE.Group();

			if ( arr == bonuses ||
				 arr == edelweisses ) {

				addParticles( group );

			};

			if ( arr == bonuses ) {

				let bonus = new THREE.Mesh(
					new THREE.ConeBufferGeometry( 0.1, 0.20, 4 ),
					particleMaterial
				);

				let bonus2 = new THREE.Mesh(
					new THREE.ConeBufferGeometry( 0.1, 0.2, 4 ),
					particleMaterial
				);

				bonus.position.y = 0.1 ;
				bonus2.position.y = - 0.1 ;
				bonus2.rotation.x = Math.PI ;

				group.add( bonus, bonus2 );

			};

			arr.push( group );

		};

	};

	// create animation of little balls spinning around bonuses
	function addParticles( group ) {

		for ( let i = 0 ; i < 26 ; i ++ ) {

			let particle = new THREE.Mesh(
				new THREE.SphereBufferGeometry( 0.03, 4, 3 ),
				particleMaterial
			);

			let particleGroup = new THREE.Group();

			let yOffset = Math.random() ;

			particle.position.y += ( yOffset * 1.7 ) - 0.3 ;
			particle.position.x += ( Math.random() * 0.1 ) + ( ( 1 - yOffset ) * 0.2 ) + 0.1 ;

			particle.scale.setScalar( (1 - yOffset) + 0.1 );

			particleGroup.rotation.y = Math.random() * ( Math.PI * 2 );
			particleGroup.userData.rotationSpeed = ( Math.random() * 0.1 ) + 0.02 ;

			particleGroup.add( particle );
			group.add( particleGroup );

		};

	};

	//// ASSETS LOADING /////

	gltfLoader.load('https://edelweiss-game.s3.eu-west-3.amazonaws.com/models/alpinist.glb', (glb)=> {

		createMultipleModels(
			glb,
			SCALE_ALPINIST,
			null,
			alpinists,
			alpinistMixers,
			alpinistIdles
		);

	});

	gltfLoader.load('https://edelweiss-game.s3.eu-west-3.amazonaws.com/models/lady.glb', (glb)=> {

		createMultipleModels(
			glb,
			SCALE_LADY,
			null,
			ladies,
			ladyMixers,
			ladyIdles
		);

	});

	gltfLoader.load('https://edelweiss-game.s3.eu-west-3.amazonaws.com/models/edelweiss.glb', (glb)=> {

		createMultipleModels(
			glb,
			SCALE_EDELWEISS,
			OFFSET_EDELWEISS,
			edelweisses,
			null,
			null,
			true
		);

	});

	gltfLoader.load('https://edelweiss-game.s3.eu-west-3.amazonaws.com/hero.glb', (glb)=> {

		charGlb = glb;

		createMultipleModels(
			glb,
			SCALE_CHAR,
			null,
			characters,
			charMixers,
			charActions
		);

	});

	// Create iterations of the same loaded asset. nasty because of skeletons.
	// Hopefully THREE.SkeletonUtils.clone() is able to clone skeletons correctly.
	function createMultipleModels( glb, scale, offset, modelsArr, mixers, actions, lightEmissive ) {

		glb.scene.scale.set( scale, scale, scale );
		if ( offset ) glb.scene.position.add( offset );

		for ( let i = mixers ? mixers.length : 0 ; i < modelsArr.length ; i++ ) {

			let newModel = THREE.SkeletonUtils.clone( glb.scene );

			modelsArr[ i ].add( newModel );

			if ( mixers ) {

				mixers[ i ] = new THREE.AnimationMixer( newModel );

				actions[ i ] = {};
				for ( let clip of glb.animations ) {
					actions[ i ][ clip.name ] = mixers[ i ].clipAction( clip ).play();
				};

			};

			setLambert( newModel, lightEmissive !== undefined );

		};

	};

	// Create a label at the top of the hero characters head,
	// for multiplayer differentiation
	function createCharacterLabel( text ) {

		const ctx = textCanvas.getContext( '2d' );
		const font = '24px grobold';

		ctx.font = font;
		textCanvas.width = Math.ceil( ctx.measureText( text ).width + 16 );

		ctx.font = font;
		ctx.strokeStyle = '#222';
		ctx.lineWidth = 8;
		ctx.lineJoin = 'miter';
		ctx.miterLimit = 3;
		ctx.strokeText( text, 8, 26 );
		ctx.fillStyle = 'white';
		ctx.fillText( text, 8, 26 );

		const spriteMap = new THREE.Texture( ctx.getImageData( 0, 0, textCanvas.width, textCanvas.height ) );
		spriteMap.minFilter = THREE.LinearFilter;
		spriteMap.generateMipmaps = false;
		spriteMap.needsUpdate = true;

		const sprite = new THREE.Sprite( new THREE.SpriteMaterial( { map: spriteMap } ) );
		sprite.scale.set( 0.12 * textCanvas.width / textCanvas.height, 0.12, 1 );
		sprite.position.y = 0.7 ;

		return sprite;

	};

	//

	function createCharacter( skinIndex, displayName ) {

		for ( let i = 0; i < characters.length; i++ ) {

			if ( !characters[ i ].userData.isUsed ) {
				 
				 characters[ i ].userData.isUsed = true;

				// assign character skin
				let skin = charSkins[ skinIndex % charSkins.length ];
				if( skin ) {
					let body = characters[ i ].getObjectByName( 'hero001' );
					if( body ) {
						body.material.map = skin;
					};
				};

				// set up charater display name
				if( displayName ) {
					characters[ i ].add( createCharacterLabel( displayName ) );
				};

				// return both the character and its actions
				return {
					model : characters[ i ], actions : charActions[ i ]
				};
			};

		};

		// if here, we have exhausted all the characters - make some more

		addGroups( characters, 2 );

		createMultipleModels(
			charGlb,
			SCALE_CHAR,
			null,
			characters,
			charMixers,
			charActions
		);

		return createCharacter( skinIndex, displayName );
	};

	//

	function releaseCharacter( model ) {

		model.userData.isUsed = false;

		const label = model.getObjectByProperty( 'type', 'Sprite' );
		if ( label ) model.remove( label ) && label.material.map.dispose();

	};

	//

	function toggleCharacterShadows( enabled ) {

		for ( let character of characters ) {

			character.traverse( function (child) {

				if ( child.type == 'Mesh' ||
					 child.type == 'SkinnedMesh' ) {

					child.castShadow = enabled ;
					child.receiveShadow = enabled ;
				};

			});

		};

	};

	/////////////////////
	///  INSTANCES SETUP
	/////////////////////

	// methods called by atlas when it loads cubes with required names

	function createNewLady( logicCube ) {

		setAssetAt( ladies, logicCube, true, 0.45 );

	};

	function createNewAlpinist( logicCube ) {

		setAssetAt( alpinists, logicCube, true, 0.6 );

	};

	function createNewEdelweiss( logicCube ) {

		setAssetAt( edelweisses, logicCube );

	};

	function createNewBonus( logicCube ) {

		setAssetAt( bonuses, logicCube );

	};

	// Take the last free group from the right asset array, position it, and hide/show it.
	function setAssetAt( assetArray, logicCube, floor, bubbleOffset ) {

		let pos = logicCube.position ;
		let tag = logicCube.tag ;

		for ( let asset of assetArray ) {

			if ( !asset.userData.isSet ) {

				asset.position.copy( pos );

				if ( floor ) {
					asset.position.y = Math.floor( asset.position.y );

					// patch the cube position itself to get the
					// exclamation mark sign positioned properly

					pos.y = Math.floor( pos.y ) + bubbleOffset;
				}

				asset.userData.isSet = true ;
				asset.userData.tag = tag ;
				asset.userData.graph = getGraphFromTag( tag );

				// anchor for bonus floating animation

				asset.userData.initPos = asset.position.clone();

				setGroupVisibility( asset );

				scene.add( asset );

				break ;

			};

		};

	};

	// Get the name of the graph bound to a given asset
	function getGraphFromTag( tag ) {

		if ( tag.match( /bonus-stamina-1/ ) ) {

			return 'cave-A';

		} else {

			return 'mountain';

		};

	};

	///////////////
	//// GENERAL
	///////////////

	// Create a new lambert material for the passed model, with the original map
	function setLambert( model, lightEmissive ) {

		model.traverse( (obj)=> {

			if ( obj.type == 'Mesh' ||
				 obj.type == 'SkinnedMesh' ) {

				obj.material = new THREE.MeshLambertMaterial({
					map: obj.material.map,
					side: obj.material.side,
					skinning: obj.material.skinning,
					emissive: lightEmissive ? 0x191919 : 0x000000
				});

				// fix self-shadows on double-sided materials

				obj.material.onBeforeCompile = function(stuff) {
					var chunk = THREE.ShaderChunk.shadowmap_pars_fragment
						.split ('z += shadowBias')
						.join ('z += shadowBias - 0.001');
					stuff.fragmentShader = stuff.fragmentShader
						.split ('#include <shadowmap_pars_fragment>')
						.join (chunk);
				};

				obj.castShadow = true ;
				obj.receiveShadow = true ;

			};

		});

	};

	// Called by gameState to hide/show assets depending on sceneGraph
	function updateGraph( destination ) {

		if ( destination ) {
			currentGraph = destination
		};

		alpinists.forEach( ( assetGroup )=> {
			setGroupVisibility( assetGroup );
		});

		ladies.forEach( ( assetGroup )=> {
			setGroupVisibility( assetGroup );
		});

		edelweisses.forEach( ( assetGroup )=> {
			setGroupVisibility( assetGroup );
		});

		bonuses.forEach( ( assetGroup )=> {
			setGroupVisibility( assetGroup );
		});

	};

	//

	function setGroupVisibility( assetGroup ) {

		if ( assetGroup.userData.graph == currentGraph ) {

			assetGroup.visible = true ;

		} else {

			assetGroup.visible = false ;

		};

		if ( assetGroup.userData.isDeleted ) {

			assetGroup.visible = false ;

		};

	};

	//

	function deleteBonus( bonusName ) {

		if ( bonusName.match( /stamina/ ) ) {

			checkForBonus( edelweisses );

		} else {

			checkForBonus( bonuses );

		};

		function checkForBonus( groupArr ) {

			groupArr.forEach( (group)=> {

				if ( group.userData.tag == bonusName ) {

					group.visible = false ;
					group.userData.isDeleted = true ;

				};

			});

		};

	};

	//

	function update( delta ) {

		for ( let mixer of alpinistMixers ) {

			mixer.update( delta );

		};

		for ( let mixer of ladyMixers ) {

			mixer.update( delta );

		};

		for ( let mixer of charMixers ) {

			mixer.update( delta );

		};

		for ( let group of edelweisses ) {

			updateBonus( group );

		};

		for ( let group of bonuses ) {

			updateBonus( group );

		};

	};

	//

	function updateBonus( group ) {

		if ( group.userData.initPos ) {

			group.rotation.y += 0.01 ;

			group.position.copy( group.userData.initPos );
			group.position.y += ( Math.sin( Date.now() / 700 ) * 0.08 );

			for ( let child of group.children ) {

				if ( child.userData.rotationSpeed ) {

					child.rotation.y += child.userData.rotationSpeed ;

				};

			};

		};

	};

	//

	return {
		createCharacter,
		releaseCharacter,
		toggleCharacterShadows,
		createNewLady,
		createNewAlpinist,
		createNewEdelweiss,
		createNewBonus,
		updateGraph,
		update,
		deleteBonus
	};

};
