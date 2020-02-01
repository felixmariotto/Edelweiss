

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
	const OFFSET_EDELWEISS = new THREE.Vector3( 0, 0.1, 0 );

	const particleMaterial = new THREE.MeshBasicMaterial({ color:0xffffff });

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
	addGroups( alpinists, 10 );
	addGroups( edelweisses, 7 );
	addGroups( ladies, 12 );
	addGroups( bonuses, 9 );

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

	

	// create little balls spinning around bonuses
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

	function createNewLady( logicCube ) {

		setAssetAt( ladies, logicCube );

	};

	function createNewAlpinist( logicCube ) {

		setAssetAt( alpinists, logicCube );

	};

	function createNewEdelweiss( logicCube ) {

		setAssetAt( edelweisses, logicCube );

	};

	function createNewBonus( logicCube ) {

		setAssetAt( bonuses, logicCube );

	};

	// Take the last free group from the right asset array, position it, and hide/show it.
	function setAssetAt( assetArray, logicCube ) {

		let pos = logicCube.position ;
		let tag = logicCube.tag ;

		for ( asset of assetArray ) {

			if ( !asset.userData.isSet ) {

				asset.position.copy( pos );

				asset.userData.isSet = true ;
				asset.userData.tag = tag ;
				asset.userData.graph = getGraphFromTag( tag );
				asset.userData.initPos = new THREE.Vector3().copy( pos );

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

	function update( delta ) {

		alpinistMixers.forEach( (mixer)=> {

			mixer.update( delta );

		});

		ladyMixers.forEach( (mixer)=> {

			mixer.update( delta );

		});

		edelweisses.forEach( (edelweissGroup)=> {

			updateBonus( edelweissGroup );

		});

		bonuses.forEach( (bonusGroup)=> {

			updateBonus( bonusGroup );

		});

	};


	function updateBonus( group ) {

		if ( group.userData.initPos ) {

			group.rotation.y += 0.01 ;

			group.position.copy( group.userData.initPos );
			group.position.y += ( Math.sin( Date.now() / 700 ) * 0.08 );

			group.children.forEach( (child)=> {

				if ( child.userData.rotationSpeed ) {

					child.rotation.y += child.userData.rotationSpeed ;

				};

			});

		};

	};






	return {
		createNewLady,
		createNewAlpinist,
		createNewEdelweiss,
		createNewBonus,
		updateGraph,
		update,
		deleteBonus
	};



};