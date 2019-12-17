


function AssetManager() {

	const SCALE_ALPINIST = 0.1 ;
	const SCALE_LADY = 0.1 ;
	const SCALE_EDELWEISS = 0.02 ;

	var currentGraph = 'mountain' ;

	var alpinistMixers = [], alpinistIdles = [];
	var ladyMixers = [], ladyIdles = [];

	var alpinists = [];
	var edelweisses = [];
	var ladies = [];
	var bonuses = [];

	addGroups( alpinists, 7 ); // unsure
	addGroups( edelweisses, 7 ); // unsure
	addGroups( ladies, 12 );
	addGroups( bonuses, 6 );

	function addGroups( arr, groupsNumber ) {

		for ( let i = 0 ; i < groupsNumber ; i++ ) {

			arr.push( new THREE.Group() );

		};

	};


	gltfLoader.load('https://edelweiss-game.s3.eu-west-3.amazonaws.com/models/alpinist.glb', (glb)=> {

		createMultipleModels(
			glb,
			SCALE_ALPINIST,
			alpinists,
			alpinistMixers,
			alpinistIdles
		);

	});


	gltfLoader.load('https://edelweiss-game.s3.eu-west-3.amazonaws.com/models/lady.glb', (glb)=> {

		createMultipleModels(
			glb,
			SCALE_LADY,
			ladies,
			ladyMixers,
			ladyIdles
		);

	});


	function createMultipleModels( glb, scale, modelsArr, mixers, actions ) {

		glb.scene.scale.set( scale, scale, scale );

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


	gltfLoader.load('https://edelweiss-game.s3.eu-west-3.amazonaws.com/models/edelweiss.glb', (glb)=> {

		createMultipleModels(
			glb,
			SCALE_EDELWEISS,
			edelweisses,
		);

	});




	//// CREATE INSTANCES

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


	function getGraphFromTag( tag ) {

		if ( tag.match( /bonus-stamina-1/ ) ) {

			return 'cave-A';

		} else {

			return 'mountain';

		};

	};





	//// GENERAL

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