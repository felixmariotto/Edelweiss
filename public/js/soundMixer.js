

function SoundMixer() {

	var domMusic = document.getElementById('music');

	var currentMusic = 0 ;

	const SFXURL = 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/sounds/sfx/' ;

	const MUSIC_URL = "https://edelweiss-game.s3.eu-west-3.amazonaws.com/sounds/music/" ;

	const URLS = {
		AK_Pulses: "AK+-+Pulses.ogg",
		AndrewOdd_Elysium: "Andrew+Odd+-+Elysium.ogg",
		KylePreston_BrknPhoto: "Kyle+Preston+-+Broken+Photosynthesis.ogg",
		SimonBainton_Hurtstone: "Simon+Bainton+-+Hurtstone.ogg",
		SimonBainton_Porlock: "Simon+Bainton+-+Porlock.ogg",
		SimonBainton_Tankah: "Simon+Bainton+-+Tankah.ogg",
		StromNoir_Hollow: "Strom+Noir+-+Hollow.ogg",
		StromNoir_WinterDay: "Strom+Noir+-+Such+a+Beautiful+Winter+Day.ogg",
		StromNoir_Spring: "Strom+Noir+-+The+beginning+of+spring.ogg",
		TobiasHellkvist_HearYou: "Tobias+Hellkvist+-+Where+No+One+Can+Hear+You.ogg"
	};

	const TRACKS = [
		MUSIC_URL + URLS.AK_Pulses,
		MUSIC_URL + URLS.AndrewOdd_Elysium,
		MUSIC_URL + URLS.KylePreston_BrknPhoto
	];

	const SFX_PARAMS = {
		faint_waves: {
			volume: 0.7,
			distance: 3,
			maxDistance: 10
		}
	}

	var sfxs = [];
	var sfxCanPlay = true ;

	var listener;
	var audioLoader = new THREE.AudioLoader();

    
    


    function setMusicSrc( musicID ) {

    	domMusic.src = TRACKS[ musicID ] ;
    	domMusic.load();
    	domMusic.play();
    	domMusic.volume = 0.7 ;

    	currentMusic = musicID ;

    };


    function start() {

    	setMusicSrc( 0 );

    	listener = new THREE.AudioListener();
		camera.add( listener );

    	//

    	var cubesGraph = atlas.getSceneGraph().cubesGraph;

    	for ( let i of Object.keys( cubesGraph ) ) {

			if ( cubesGraph[i] ) {

				cubesGraph[i].forEach( (logicCube)=> {

					if ( logicCube.type == 'cube-anchor' ) {
						
						createSFX( logicCube.tag, logicCube.position );

					};

				});

			};

		};

    };


    function createSFX( sfxName, position ) {

    	// create the PositionalAudio object (passing in the listener)
		var sound = new THREE.PositionalAudio( listener );

		// load a sound and set it as the PositionalAudio object's buffer
		audioLoader.load( SFXURL + sfxName + '.ogg' , function( buffer ) {

			sound.setBuffer( buffer );

			sound.setRefDistance( SFX_PARAMS[ sfxName ].distance );
			sound.setVolume( SFX_PARAMS[ sfxName ].volume );
			sound.maxDistance = SFX_PARAMS[ sfxName ].maxDistance

			sound.setLoop( true );
			sound.play();
			
		});

		sound.position.copy( position );

		scene.add( sound );

		sfxs.push( sound );

    };


	function setMusic( musicName ) {

		if ( musicName != 'track-' + currentMusic ) {

			setMusicSrc( musicName.slice( -1 ) );

		};

	};


	function switchGraph( graphName ) {

		if ( graphName == 'mountain' ) {

			sfxCanPlay = true ;

		} else {

			sfxCanPlay = false ;

			for ( let sound of sfxs ) {

				sound.stop();

			};

		};

	};


	function update( mustCheck ) {

		if ( mustCheck && sfxCanPlay ) {

			for ( let sound of sfxs ) {

				// Check that the sound emitter is in the range to be heard

				if ( sound.position.distanceTo( camera.position ) > sound.maxDistance ) {

					if ( sound.isPlaying ) sound.stop();

				} else {

					if ( !sound.isPlaying ) sound.play();

				};

			};

		};

	};


	return {
		start,
		setMusic,
		update,
		switchGraph
	};

};