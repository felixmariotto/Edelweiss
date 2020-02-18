




function GameState() {



	const DEVELOPMENT_LAYOUT = false ;

	const domStartMenu = document.getElementById('start-menu');
    const domStartButton = document.getElementById('start-button');
    const domStartLoaded = document.getElementById( 'start-loaded' );
    const domStartBack = document.getElementById('start-background');

    const domTitleBackground = document.getElementById('title-background');

    const domJSONLoader = document.getElementById('json-loader');
	const domLoadMap = document.getElementById('gui');

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



	//////// EVENTS


	domJSONLoader.addEventListener('click', ()=> {

        domJSONLoader.blur();

    });



    domJSONLoader.addEventListener('change', (e)=> {

        loadJSON(e);

    });



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


    function updateLoadingBar( percent ) {

        domStartLoaded.style.width = percent + '%' ;

        if ( percent >= 100 ) {
            unlockStartButton();
        };

    };


    function unlockStartButton() {

        domStartButton.style.color = "#111111" ;
        domStartLoaded.style.backgroundColor = "#111111" ;
        loadingFinished = true ;

    };








	//// LAYOUT INIT

	if ( DEVELOPMENT_LAYOUT ) {

		domLoadMap.style.display = 'inherit';

	} else {

		domStartMenu.style.display = 'flex';

		fileLoader.load( 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/mountain.json', ( file )=> {

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

        var graph = parseJSON( file );

        // Initialize atlas with the scene graph
        atlas.init( graph );

        // store this sceneGraph into the graphs object
        sceneGraphs.mountain = graph ;

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
	// Show a black screen, wait one second, respawn, remove black screen.
	function die( hasCrashed ) {

        if ( atlas.player && atlas.player.position ) {
            socketIO.sendDeath();
        };

		params.isDying = true ;
		if ( hasCrashed ) params.isCrashing = true ;

		domBlackScreen.classList.remove( 'hide-black-screen' );
		domBlackScreen.classList.add( 'show-black-screen' );

        soundMixer.animStart();

        setTimeout( ()=> {

            if ( atlas.getSceneGraph() != sceneGraphs.mountain ) {

                atlas.switchGraph( 'mountain', null, true );

            };

        }, 250 );

		setTimeout( ()=> {

			charaAnim.respawn();

            soundMixer.animEnd();

			atlas.player.position.copy( respawnPos );
			cameraControl.resetCameraPos();

			controler.setSpeedUp( 0 );

            params.isCrashing = false ;
            params.isDying = false ;

			domBlackScreen.classList.remove( 'show-black-screen' );
			domBlackScreen.classList.add( 'hide-black-screen' );

		}, 1500);

	};








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







    function resetPlayerPos( vec ) {

        atlas.player.position.copy( typeof vec != 'undefined' ? vec : respawnPos );

        cameraControl.resetCameraPos();

    };









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

            // gauntlet
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








    function setSavedPosition( respawnID ) {

        // console.log( `save progress on ${ 'respawn-' + respawnID }` );

        socketIO.sendSave( respawnID );

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

            }

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



    function update( mustUpdate ) {

        if ( !mustUpdate ) return ;

        if ( !loadingFinished ) {

            if ( domStartLoaded.clientWidth / domStartBack.clientWidth < 0.3 ) {

                domStartLoaded.style.width = ( domStartLoaded.clientWidth + 1 ) + 'px' ;

            };

        };

    };







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
        update
	};

};