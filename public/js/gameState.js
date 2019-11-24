




function GameState() {



	const DEVELOPMENT_LAYOUT = false ;



	const domStartMenu = document.getElementById('start-menu');
    const domStartButton = document.getElementById('start-button');
    const domTitleBackground = document.getElementById('title-background');
    const domTitleContainer = document.getElementById('title-container');

    const domJSONLoader = document.getElementById('json-loader');
	const domLoadMap = document.getElementById('gui');

	const domStaminaBar = document.getElementById('stamina-bar');

	const domJoystickContainer = document.getElementById('joystick-container');
	const domActionButton = document.getElementById('action-button');

	const domBlackScreen = document.getElementById('black-screen');



    // will hold the sceneGraphs of the caves as well
    var sceneGraphs = {
        moutain: undefined
    };

	var params = {
		isGamePaused: true,
		isCrashing: false,
		isDying: false
	};

	var respownPos = new THREE.Vector3( 0, 1, -4.5 );







	//////// EVENTS


	domJSONLoader.addEventListener('click', ()=> {

        domJSONLoader.blur();

    });



    domJSONLoader.addEventListener('change', (e)=> {

        loadJSON(e);

    });



    domStartButton.addEventListener( 'touchstart', (e)=> {

        startGame( true );

    });
    


    domStartButton.addEventListener( 'click', (e)=> {

        startGame();

    });











	//// LAYOUT INIT

	if ( DEVELOPMENT_LAYOUT ) {

		domLoadMap.style.display = 'inherit';

	} else {

		domStartMenu.style.display = 'inherit';

		fileLoader.load( 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/moutain.json', ( file )=> {

            generateWorld( file );

        });

	};











	///// STARTING THE GAME


    function loadJSON( evt ) {

        var tgt = evt.target || window.event.srcElement,
        files = tgt.files;
    
        // FileReader support
        if (FileReader && files && files.length) {

            var fr = new FileReader();

            fr.onload = function () {

                generateWorld( fr.result );

                startGame();

            };

            fr.readAsText(files[0]);

        };

    };



	function startGame( isTouchScreen ) {

        domStartMenu.style.display = 'none' ;
        domTitleBackground.style.display = 'none' ;
        domTitleContainer.style.display = 'none' ;

        domStaminaBar.style.display = 'flex' ;

        if ( isTouchScreen ) {

        	domJoystickContainer.style.display = 'block' ;
        	domActionButton.style.display = 'inherit' ;

        	input.initJoystick();

        };

        params.isGamePaused = false ;

        setTimeout( ()=> {

            // feedback.showMessage();

        });

    };



	/////////////////////
    ///   IMPORT JSON
    /////////////////////


    var hashTable = {
        true: '$t',
        false: '$f',
        position: '$p',
        scale: '$b',
        type: '$k',
        points: '$v',
        isWall: '$w',
        isXAligned: '$i',
        'ground-basic': '$g',
        'ground-start': '$s',
        'wall-limit': '$l',
        'wall-easy': '$e',
        'wall-medium' : '$m',
        'wall-hard': '$h',
        'wall-fall': '$a',
        'wall-slip': '$c',
        'cube-inert': '$r',
        'cube-interactive': '$q',
        'cube-trigger': '$o'
    };



    function generateWorld( file ) {

        var moutainGraph = parseJSON( file );

        // Initialize atlas with the scene graph
        atlas = Atlas( moutainGraph );

        // store this sceneGraph into the graphs object
        sceneGraphs.mountain = moutainGraph ;

    };



	function parseJSON( file ) {

        let data = lzjs.decompress( file );

        for ( let valueToReplace of Object.keys( hashTable ) ) {

            text = hashTable[ valueToReplace ]
            text = text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

            data = data.replace( new RegExp( text , 'g' ), valueToReplace );

        };

        return JSON.parse( data ) ;
    };





    





    




    









	// This function is called when the player fell from too high.
	// Show a black screen, wait one second, respown, remove black screen.
	function die( hasCrashed ) {

		params.isDying = true ;
		if ( hasCrashed ) params.isCrashing = true ;

		domBlackScreen.classList.remove( 'hide-black-screen' );
		domBlackScreen.classList.add( 'show-black-screen' );

		setTimeout( ()=> {

			params.isCrashing = false ;
			params.isDying = false ;

			charaAnim.respawn();

			atlas.player.position.copy( respownPos );
			cameraControl.resetCameraPos();

			controler.setSpeedUp( 0 );

			domBlackScreen.classList.remove( 'show-black-screen' );
			domBlackScreen.classList.add( 'hide-black-screen' );

		}, 1000);

	};





    function switchMapGraph( caveGraphName, caveGateName ) {

        if ( params.isGamePaused ) return ;

        params.isGamePaused = true ;

        console.log( 'enter cave ' + caveGraphName + ' by gate ' + caveGateName );

        if ( !sceneGraphs[ caveGraphName ] ) {

            switch( caveGraphName ) {

                case 'cave-A' :
                    load( 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/cave-A.json' );
                    break;

            };

            function load( url ) {

                fileLoader.load( url, ( file )=> {

                    var sceneGraph = parseJSON( file );

                    sceneGraphs[ caveGraphName ] = sceneGraph ;

                    atlas.switchGraph( caveGraphName, caveGateName );

                });

            };

        } else {

            console.log( 'sceneGraph is already acquired' );

            atlas.switchGraph( caveGraphName, caveGateName );

        };

    };







    function resetPlayerPos() {

        atlas.player.position.copy( respownPos );

        cameraControl.resetCameraPos();

    };
	









	return {
		die,
		params,
        sceneGraphs,
        switchMapGraph,
        resetPlayerPos,
        respownPos
	};

};