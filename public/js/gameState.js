
function GameState() {

	const domStartMenu = document.getElementById('start-menu');
    const domStartButton = document.getElementById('start-button');
    const domStartLoaded = document.getElementById( 'start-loaded' );
    const domStartBack = document.getElementById('start-background');
    const domHomepageLoadingIcon = document.getElementById('homepage-loading-icon');

    const domTitleBackground = document.getElementById('title-background');

	const domStaminaBar = document.getElementById('stamina-bar');

	const domJoystickContainer = document.getElementById('joystick-container');
	const domActionButton = document.getElementById('action-button');

	const domBlackScreen = document.getElementById('black-screen');

    // will hold the sceneGraphs of the caves as well
    var sceneGraphs = {
        mountain: undefined
    };

	var params = {
		isGamePaused: true,
		isCrashing: false,
		isDying: false
	};

	var respawnPos = new THREE.Vector3();
    var gateTilePos = new THREE.Vector3();

	var enterGateTime ;
	const ENTER_GATE_DURATION = 300;

    var loadingFinished = false;

	/// EVENTS

    domStartButton.addEventListener( 'touchstart', (e)=> {

        if ( loadingFinished ) {
            startGame( true );
        };

    });

    domStartButton.addEventListener( 'click', (e)=> {

        if ( loadingFinished ) {
            startGame();
        };

    });

    // LOADING MANAGER

    THREE.DefaultLoadingManager.onStart = function ( url, itemsLoaded, itemsTotal ) {

        // console.log( `${ (itemsLoaded / itemsTotal) * 100 }%` )
        // console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
        updateLoadingBar( (itemsLoaded / itemsTotal) * 100 );
    };

    THREE.DefaultLoadingManager.onLoad = function ( ) {

        // console.log( 'Loading Complete!');
        unlockStartButton();

    };

    THREE.DefaultLoadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {

        // console.log( `${ (itemsLoaded / itemsTotal) * 100 }%` )
        // console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
        updateLoadingBar( (itemsLoaded / itemsTotal) * 100 );
    };

    //

    function updateLoadingBar( percent ) {

        domStartLoaded.style.width = percent + '%' ;

        if ( percent >= 100 ) {
            unlockStartButton();
        };

    };

    //

    function unlockStartButton() {

        domStartButton.style.color = "#111111" ;
        domStartLoaded.style.backgroundColor = "#111111" ;
        loadingFinished = true ;

    };

	/// LAYOUT INIT

	domStartMenu.style.display = 'flex';
    domHomepageLoadingIcon.style.display = 'none';

	fileLoader.load( 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/mountain.json', function( file ) {

        var graph = parseJSON( file );

        // Initialize atlas with the scene graph
        atlas.init( graph );

        // store this sceneGraph into the graphs object
        sceneGraphs.mountain = graph ;

    });

    //

    function debugLoadGraph( graphData, graphName ) {

        var sceneGraph = (typeof graphData === 'string' ) ? parseJSON( graphData ) : graphData;

        console.log( `Loaded ${ graphName } graph:`, sceneGraph );

        // at this point the game is already started so we
        // want to load the json as if it was another cave

        params.isGamePaused = true ;

        sceneGraphs[ graphName ] = sceneGraph;

        atlas.switchGraph( graphName, null, function() {

            soundMixer.animEnd();

            // try to place the player on the ground

            var pos;

            for ( let tilesGraphStage of sceneGraph.tilesGraph ) {

                if ( tilesGraphStage && !pos ) {

                    for ( let logicTile of tilesGraphStage ) {

                        if ( /ground-s/.test( logicTile.type ) ) {

                            pos = new THREE.Vector3 (
                                (logicTile.points[0].x + logicTile.points[1].x) / 2,
                                (logicTile.points[0].y + logicTile.points[1].y) / 2,
                                (logicTile.points[0].z + logicTile.points[1].z) / 2
                            );

                            break;
                        };
                    };
                };
            };

            resetPlayerPos( pos );

            controler.setSpeedUp( 0 );

            params.isCrashing = false ;
            params.isDying = false ;
            params.isGamePaused = false ;

            domBlackScreen.classList.remove( 'show-black-screen' );
            domBlackScreen.classList.add( 'hide-black-screen' );

        } );
    };

    //

    document.querySelector( '#json-load input' ).onchange = function( event ) {

        var files = event.target.files;
    
        // FileReader support
        if (FileReader && files && files.length) {

            var matches = files[0].name.match(/^(.*)\.json$/);

            var graphName = matches ? matches[1] : 'unknown';

            var fr = new FileReader();

            fr.onload = function () {

                debugLoadGraph( fr.result, graphName );

            };

            fr.readAsText(files[0]);

            files.length = 0;

            document.querySelector( '#json-load input' ).blur();
        };

    };

    /// STARTING THE GAME

	function startGame( isTouchScreen ) {

        soundMixer.start();

        domStartMenu.style.display = 'none' ;
        domTitleBackground.style.display = 'none' ;

        domStaminaBar.style.display = 'flex' ;

        if ( isTouchScreen ) {

        	domJoystickContainer.style.display = 'block' ;
        	domActionButton.style.display = 'inherit' ;

        	input.initJoystick();

        };

        params.isGamePaused = false ;

        const gamePass = document.getElementById( 'game-pass' ).value.substr( 0, 15 );

        if ( gamePass ) {

            socketIO.joinGame(
                atlas.player.id,
                gamePass,
                document.getElementById( 'game-name' ).value.substr( 0, 15 ) || ( 'Anon ' + atlas.player.id.substr(0, 5) )
            );

        }

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

	function parseJSON( file ) {

        let data = lzjs.decompress( file );

        for ( let valueToReplace of Object.keys( hashTable ) ) {

            text = hashTable[ valueToReplace ]
            text = text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

            data = data.replace( new RegExp( text , 'g' ), valueToReplace );

        };

        return JSON.parse( data ) ;
    };

    //

    document.getElementById( 'json-save' ).onclick = function() {

        const curentSceneGraph = atlas.getSceneGraph();

        for( let graphName in sceneGraphs ) {

            if( sceneGraphs[ graphName ] == curentSceneGraph ) {

                let data = JSON.stringify( curentSceneGraph );

                for ( let valueToReplace of Object.keys( hashTable ) ) {

                    data = data.replace( new RegExp( valueToReplace, 'g' ), hashTable[ valueToReplace ] );

                };

                let link = document.createElement( 'a' );

                link.download = graphName + '.json';

                link.href = URL.createObjectURL( new File( [lzjs.compress( data )], graphName + '.json', { type: 'text/plain;charset=utf-8' } ) );

                link.dispatchEvent( new MouseEvent( 'click' ) );
            }
        }
    };

    ///////////////////////
    /// GENERAL FUNCTIONS
    ///////////////////////

	// This function is called when the player fell from too high.
	// Show a black screen, wait one second, respawn, remove black screen.
	function die( hasCrashed ) {

		params.isDying = true ;
		if ( hasCrashed ) params.isCrashing = true ;

		domBlackScreen.classList.remove( 'hide-black-screen' );
		domBlackScreen.classList.add( 'show-black-screen' );

        soundMixer.animStart();

        setTimeout( function() {

            if ( atlas.getSceneGraph() != sceneGraphs.mountain ) {

                atlas.switchGraph( 'mountain', null, respawn );

            } else {

                setTimeout( respawn, 1300 );

            };

        }, 250 );

    };

    //

	function respawn() {

        charaAnim.respawn();
        soundMixer.animEnd();

		atlas.player.position.copy( respawnPos );
		cameraControl.resetCameraPos();

		controler.setSpeedUp( 0 );

        params.isCrashing = false ;
        params.isDying = false ;

		domBlackScreen.classList.remove( 'show-black-screen' );
		domBlackScreen.classList.add( 'hide-black-screen' );

	};

    //

    function switchMapGraph( gateName ) {

    	if ( params.isGamePaused ) return ;

        params.isGamePaused = true ;

    	let graphName = getDestinationFromGate( gateName ) ;

        soundMixer.animStart();

    	domBlackScreen.classList.remove( 'hide-black-screen' );
		domBlackScreen.classList.add( 'show-black-screen' );

		enterGateTime = Date.now();

        setTimeout( ()=> {

	        if ( !sceneGraphs[ graphName ] ) {

	            load( `https://edelweiss-game.s3.eu-west-3.amazonaws.com/${ graphName }.json` );

	            function load( url ) {

	                fileLoader.load( url, ( file )=> {

	                    var sceneGraph = parseJSON( file );

	                    sceneGraphs[ graphName ] = sceneGraph ;

	                    atlas.switchGraph( graphName, gateName );

                        soundMixer.animEnd();

	                });

	            };

	        } else {

	             atlas.switchGraph( graphName, gateName );

                 soundMixer.animEnd();

	        };

        }, 220);

    };

    //

    function endPassGateAnim() {

    	if ( Date.now() > enterGateTime + ENTER_GATE_DURATION ) {

    		show();

    	} else {

    		setTimeout( ()=> {

    			show();

    		}, (enterGateTime + ENTER_GATE_DURATION) - Date.now() );

    	};

        function show() {

            resetPlayerPos( gateTilePos );
            gameState.params.isGamePaused = false ;

            domBlackScreen.classList.remove( 'show-black-screen' );
            domBlackScreen.classList.add( 'hide-black-screen' );

        };

    };

    //

    function resetPlayerPos( vec ) {

        atlas.player.position.copy( typeof vec != 'undefined' ? vec : respawnPos );

        cameraControl.resetCameraPos();

    };

    //

    function getDestinationFromGate( gateName ) {

    	switch( gateName ) {

            // village
    		case 'cave-0' :

    			if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

    				return 'cave-A';

    			} else {

    				return 'mountain';

    			};

            // cow field
    		case 'cave-1' :

    			if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

    				return 'cave-B';

    			} else {

    				return 'mountain';

    			};

            // dash
            case 'cave-2' :

                if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

                    return 'cave-B';

                } else {

                    return 'mountain';

                };

            // forest
            case 'cave-3' :

                if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

                    return 'cave-C';

                } else {

                    return 'mountain';

                };

            // end forest
            case 'cave-4' :

                if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

                    return 'cave-C';

                } else {

                    return 'mountain';

                };

            // checkpoint bottom cliff
            case 'cave-5' :

                if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

                    return 'cave-D';

                } else {

                    return 'mountain';

                };

            // behind pillar in the cliff
            case 'cave-6' :

                if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

                    return 'cave-D';

                } else {

                    return 'mountain';

                };

            // middle of the cliff bottom
            case 'cave-7' :

                if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

                    return 'cave-E';

                } else {

                    return 'mountain';

                };

            // middle of the cliff top (lead to other side)
            case 'cave-8' :

                if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

                    return 'cave-F';

                } else {

                    return 'mountain';

                };

            // other side cliff
            case 'cave-9' :

                if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

                    return 'cave-F';

                } else {

                    return 'mountain';

                };

            // checkpoint peak
            case 'cave-10' :

                if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

                    return 'cave-E';

                } else {

                    return 'mountain';

                };

            // dev home
            case 'cave-11' :

                if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

                    return 'dev-home';

                } else {

                    return 'mountain';

                };
    			
    	};

    };

    //

    function setSavedPosition( respawnID ) {

        if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

            checkStage( Math.floor( atlas.player.position.y ) );
            checkStage( Math.floor( atlas.player.position.y ) -1 );
            checkStage( Math.floor( atlas.player.position.y ) +1 );

            function checkStage( stage ) {

                if ( !sceneGraphs.mountain.tilesGraph[ stage ] ) return ;

                sceneGraphs.mountain.tilesGraph[ stage ].forEach( (logicTile)=> {

                    if ( logicTile.tag && logicTile.tag == 'respawn-' + respawnID ) {

                        setTileAsRespawn( logicTile );

                    };

                });

            };

        } else {

            sceneGraphs.mountain.tilesGraph.forEach( ( stage )=> {

                if ( !stage ) return ;

                stage.forEach( ( logicTile )=> {

                    if ( logicTile.tag && logicTile.tag == 'respawn-' + respawnID ) {

                        setTileAsRespawn( logicTile );

                    };

                });

            });

        };

        function setTileAsRespawn( logicTile ) {

            respawnPos.set(
                (logicTile.points[0].x + logicTile.points[1].x) / 2,
                (logicTile.points[0].y + logicTile.points[1].y) / 2,
                (logicTile.points[0].z + logicTile.points[1].z) / 2
            );

        };

    };

    //

    function update( mustUpdate ) {

        if ( !mustUpdate ) return ;

        if ( !loadingFinished ) {

            if ( domStartLoaded.clientWidth / domStartBack.clientWidth < 0.3 ) {

                domStartLoaded.style.width = ( domStartLoaded.clientWidth + 1 ) + 'px' ;

            };

        };

    };

    //

	return {
		die,
		params,
        sceneGraphs,
        switchMapGraph,
        resetPlayerPos,
        respawnPos,
        gateTilePos,
        endPassGateAnim,
        setSavedPosition,
        debugLoadGraph,
        update
	};

};
