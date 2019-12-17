

/*
	AssetManager keep track of all the special assets like animated NPCs and bonuses.
	At initialisation, it create groups that will hold the loaded assets once loading is done.
	AssetManager is able to hide/show the groups when gameState tells it to change of graph.
*/
function AssetManager() {

	// assets constants
	const SCALE_ALPINIST = 0.1 ;
	const SCALE_LADY = 0.08 ;
	const SCALE_EDELWEISS = 0.02 ;

	const OFFSET_ALPINIST = new THREE.Vector3( 0, -0.5, 0 );
	const OFFSET_LADY = new THREE.Vector3( 0, -0.5, 0 );
	const OFFSET_EDELWEISS = new THREE.Vector3( 0, -0.5, 0 );

	// What graph the player is currently playing in ?
	var currentGraph = 'mountain' ;

	// Hold one mixer and one action per asset iteration
	var alpinistMixers = [], alpinistIdles = [];
	var ladyMixers = [], ladyIdles = [];

	// Asset groups arrays
	var alpinists = [];
	var edelweisses = [];
	var ladies = [];
	var bonuses = [];







	//////////////
	///   INIT
	//////////////




	// Create one group per iteration, before the assets is loaded/created
	addGroups( alpinists, 7 ); // unsure
	addGroups( edelweisses, 7 ); // unsure
	addGroups( ladies, 12 );
	addGroups( bonuses, 6 );

	function addGroups( arr, groupsNumber ) {

		for ( let i = 0 ; i < groupsNumber ; i++ ) {

			arr.push( new THREE.Group() );

		};

	};

	//// ASSETS LOADING /////

	gltfLoader.load('https://edelweiss-game.s3.eu-west-3.amazonaws.com/models/alpinist.glb', (glb)=> {

		createMultipleModels(
			glb,
			SCALE_ALPINIST,
			OFFSET_ALPINIST,
			alpinists,
			alpinistMixers,
			alpinistIdles
		);

	});

	gltfLoader.load('https://edelweiss-game.s3.eu-west-3.amazonaws.com/models/lady.glb', (glb)=> {

		createMultipleModels(
			glb,
			SCALE_LADY,
			OFFSET_LADY,
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
		);

	});

	// Create iterations of the same loaded asset. nasty because of skeletons.
	// Hopefully THREE.SkeletonUtils.clone() is able to clone skeletons correctly.
	function createMultipleModels( glb, scale, offset, modelsArr, mixers, actions ) {

		glb.scene.scale.set( scale, scale, scale );
		glb.scene.position.add( offset );

		for ( let i = 0 ; i < modelsArr.length ; i++ ) {

			let newModel = THREE.SkeletonUtils.clone( glb.scene );

			modelsArr[ i ].add( newModel );

			if ( mixers ) {

				mixers[ i ] = new THREE.AnimationMixer( newModel );

				actions[ i ] = mixers[ i ].clipAction( glb.animations[ 0 ] );
				actions[ i ].play();

			};

			setLambert( newModel );

		};

	};













	/////////////////////
	///  INSTANCES SETUP
	/////////////////////

	// methods called by atlas when it loads cubes with required names

	function createNewLady( pos, tag ) {

		setAssetAt( ladies, pos, tag );

	};

	function createNewAlpinist( pos, tag ) {

		setAssetAt( alpinists, pos, tag );

	};

	function createNewEdelweiss( pos, tag ) {

		setAssetAt( edelweisses, pos, tag );

	};

	function createNewBonus( pos, tag ) {

		setAssetAt( bonuses, pos, tag );

	};

	// Take the last free group from the right asset array, position it, and hide/show it.
	function setAssetAt( assetArray, pos, tag ) {

		for ( asset of assetArray ) {

			if ( !asset.userData.isSet ) {

				asset.userData.isSet = true ;
				asset.userData.graph = getGraphFromTag( tag );

				setGroupVisibility( asset );

				asset.position.copy( pos );

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
	function setLambert( model ) {

		model.traverse( (obj)=> {

			if ( obj.type == 'Mesh' ||
				 obj.type == 'SkinnedMesh' ) {

				obj.material = new THREE.MeshLambertMaterial({
					map: obj.material.map,
					side: THREE.FrontSide,
					skinning: true
				});

				obj.castShadow = true ;
				obj.receiveShadow = true ;

			};

		});

	};

	// Called by gameState to hide/show assets depending on sceneGraph
	function switchGraph( destination ) {

		currentGraph = destination ;

		edelweisses.forEach( ( assetGroup )=> {
			setGroupVisibility( assetGroup );
		});

	};

	function setGroupVisibility( assetGroup ) {

		if ( assetGroup.userData.graph == currentGraph ) {

			assetGroup.visible = true ;

		} else {

			assetGroup.visible = false ;

		};

	};

	function update( delta ) {

		alpinistMixers.forEach( (mixer)=> {

			mixer.update( delta );

		});

		ladyMixers.forEach( (mixer)=> {

			mixer.update( delta );

		});

	};






	return {
		createNewLady,
		createNewAlpinist,
		createNewEdelweiss,
		createNewBonus,
		switchGraph,
		update
	};



};