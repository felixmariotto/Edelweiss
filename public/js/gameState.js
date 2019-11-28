




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

        var mountainGraph = parseJSON( file );

        // Initialize atlas with the scene graph
        atlas = Atlas( mountainGraph );

        // store this sceneGraph into the graphs object
        sceneGraphs.mountain = mountainGraph ;

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

            if ( atlas.getSceneGraph() != sceneGraphs.mountain ) {

                atlas.switchGraph( 'mountain', null, true );

            };

        }, 250 );

		setTimeout( ()=> {

			params.isCrashing = false ;
			params.isDying = false ;

			charaAnim.respawn();

			atlas.player.position.copy( respawnPos );
			cameraControl.resetCameraPos();

			controler.setSpeedUp( 0 );

			domBlackScreen.classList.remove( 'show-black-screen' );
			domBlackScreen.classList.add( 'hide-black-screen' );

		}, 850);

	};








    function switchMapGraph( gateName ) {

    	if ( params.isGamePaused ) return ;

        params.isGamePaused = true ;

    	let graphName = getDestinationFromGate( gateName ) ;

    	domBlackScreen.classList.remove( 'hide-black-screen' );
		domBlackScreen.classList.add( 'show-black-screen' );

		enterGateTime = Date.now();

        setTimeout( ()=> {

	        if ( !sceneGraphs[ graphName ] ) {

	            switch( graphName ) {

	                case 'cave-A' :
	                    load( 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/cave-A.json' );
	                    break;

                    case 'cave-B' :
                        load( 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/cave-B.json' );
                        break;

                    case 'cave-C' :
                        load( 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/cave-C.json' );
                        break;

                    case 'cave-D' :
                        load( 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/cave-D.json' );
                        break;

	            };

	            function load( url ) {

	                fileLoader.load( url, ( file )=> {

	                    var sceneGraph = parseJSON( file );

	                    sceneGraphs[ graphName ] = sceneGraph ;

	                    atlas.switchGraph( graphName, gateName );

	                });

	            };

	        } else {

	            atlas.switchGraph( graphName, gateName );

	        };

        }, 220);

    };



    function endPassGateAnim() {

    	if ( Date.now() > enterGateTime + ENTER_GATE_DURATION ) {

    		resetPlayerPos( gateTilePos );
	    	gameState.params.isGamePaused = false ;

	    	domBlackScreen.classList.remove( 'show-black-screen' );
			domBlackScreen.classList.add( 'hide-black-screen' );

    	} else {

    		setTimeout( ()=> {

    			resetPlayerPos( gateTilePos );
		    	gameState.params.isGamePaused = false ;

		    	domBlackScreen.classList.remove( 'show-black-screen' );
				domBlackScreen.classList.add( 'hide-black-screen' );

    		}, (enterGateTime + ENTER_GATE_DURATION) - Date.now() );

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

            // gauntlet
    		case 'cave-1' :

    			if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

    				return 'cave-A';

    			} else {

    				return 'mountain';

    			};

            // glider
            case 'cave-2' :

                if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

                    return 'cave-A';

                } else {

                    return 'mountain';

                };

            // double-jump
            case 'cave-3' :

            console.log('coucou')

                if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

                    return 'cave-A';

                } else {

                    return 'mountain';

                };

            // cow field
            case 'cave-4' :

                if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

                    return 'cave-B';

                } else {

                    return 'mountain';

                };

            // low river
            case 'cave-5' :

                if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

                    return 'cave-B';

                } else {

                    return 'mountain';

                };

            // lridge right side
            case 'cave-6' :

                if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

                    return 'cave-C';

                } else {

                    return 'mountain';

                };

            // ridge left side
            case 'cave-7' :

                if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

                    return 'cave-C';

                } else {

                    return 'mountain';

                };

            // cliff
            case 'cave-8' :

                if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

                    return 'cave-D';

                } else {

                    return 'mountain';

                };

            // canyon
            case 'cave-9' :

                if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

                    return 'cave-D';

                } else {

                    return 'mountain';

                };
    			

    	};

    };








    function setSavedPosition( respawnID ) {

        console.log( `save progress on ${ 'respawn-' + respawnID }` );

        if ( atlas.getSceneGraph() == sceneGraphs.mountain ) {

            checkStage( Math.floor( atlas.player.position.y ) );
            checkStage( Math.floor( atlas.player.position.y ) -1 );
            checkStage( Math.floor( atlas.player.position.y ) +1 );

            function checkStage( stage ) {

                if ( !atlas.getSceneGraph().tilesGraph[ stage ] ) return ;

                atlas.getSceneGraph().tilesGraph[ stage ].forEach( (logicTile)=> {

                    if ( logicTile.tag && logicTile.tag == 'respawn-' + respawnID ) {

                        setTileAsRespawn( logicTile );

                    };

                });

            }

        } else {

            console.log( 'switch sceneGraph' );

        };

        function setTileAsRespawn( logicTile ) {

            respawnPos.set(
                (logicTile.points[0].x + logicTile.points[1].x) / 2,
                (logicTile.points[0].y + logicTile.points[1].y) / 2,
                (logicTile.points[0].z + logicTile.points[1].z) / 2
            );

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
        setSavedPosition
	};

};