

function SoundMixer() {

	var domMusic = document.getElementById('music');

	var currentMusic = 0 ;

	const URLS = {
		AK_Pulses: "https://edelweiss-game.s3.eu-west-3.amazonaws.com/sounds/music/AK+-+Pulses.ogg",
		AndrewOdd_Elysium: "https://edelweiss-game.s3.eu-west-3.amazonaws.com/sounds/music/Andrew+Odd+-+Elysium.ogg",
		KylePreston_BrknPhoto: "https://edelweiss-game.s3.eu-west-3.amazonaws.com/sounds/music/Kyle+Preston+-+Broken+Photosynthesis.ogg",
		SimonBainton_Hurtstone: "https://edelweiss-game.s3.eu-west-3.amazonaws.com/sounds/music/Simon+Bainton+-+Hurtstone.ogg",
		SimonBainton_Porlock: "https://edelweiss-game.s3.eu-west-3.amazonaws.com/sounds/music/Simon+Bainton+-+Porlock.ogg",
		SimonBainton_Tankah: "https://edelweiss-game.s3.eu-west-3.amazonaws.com/sounds/music/Simon+Bainton+-+Tankah.ogg",
		StromNoir_Hollow: "https://edelweiss-game.s3.eu-west-3.amazonaws.com/sounds/music/Strom+Noir+-+Hollow.ogg",
		StromNoir_WinterDay: "https://edelweiss-game.s3.eu-west-3.amazonaws.com/sounds/music/Strom+Noir+-+Such+a+Beautiful+Winter+Day.ogg",
		StromNoir_Spring: "https://edelweiss-game.s3.eu-west-3.amazonaws.com/sounds/music/Strom+Noir+-+The+beginning+of+spring.ogg",
		TobiasHellkvist_HearYou: "https://edelweiss-game.s3.eu-west-3.amazonaws.com/sounds/music/Tobias+Hellkvist+-+Where+No+One+Can+Hear+You.ogg"
	};

	const TRACKS = [
		URLS.AK_Pulses,
		URLS.AndrewOdd_Elysium,
		URLS.KylePreston_BrknPhoto
	];

	const SFXS = {
		river: 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/sounds/sfx/river.ogg'
	};

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
		audioLoader.load( SFXS[ sfxName ], function( buffer ) {
			sound.setBuffer( buffer );
			sound.setRefDistance( 5 );
			sound.play();
			sound.setLoop( true );
		});

		sound.position.copy( position );

		scene.add( sound );

    };


	function setMusic( musicName ) {

		if ( musicName != 'track-' + currentMusic ) {

			setMusicSrc( musicName.slice( -1 ) );

		};

	};


	return {
		start,
		setMusic
	};

};