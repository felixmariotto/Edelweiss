
function Input() {

    const STICK_TRAVEL_RADIUS = 50 ;

    const domWorldCheap = document.getElementById('worldCheap');
    const domWorldHigh = document.getElementById('worldHigh');

    const domCharContainer = document.getElementById('char-container');
    const domTalkContainer = document.getElementById('talk-container');
    const domTalkSubcontainer = document.getElementById('talk-subcontainer');

    const domActionButton = document.getElementById('action-button');

    // Movement
    var moveKeys = [];
    var tempDirArray ;

    var params = {
        isSpacePressed : false,
        // is set to true once and for all whenever a touch event occurs
        isTouchScreen : false
    };

    var touches = {};

    var blockAction = false ;

    var joystick, domCross, moveVec, joystickAngle, joystickState ;

    /// JOYSTICK

    function initJoystick() {

        var domBase = document.createElement('IMG');
        domBase.src = 'assets/base.png';
        domBase.id = 'base' ;

        var domStick = document.createElement('IMG');
        domStick.src = 'assets/stick.png';
        domStick.id = 'stick' ;

        domCross = document.createElement('IMG');
        domCross.src = 'assets/cross.png';
        domCross.id = 'cross' ;
        domCross.style.top = `${ window.innerHeight - 127.5 }px` ;

        document.getElementById('joystick-container').appendChild( domCross );

        // get joystick angle
        moveVec = new THREE.Vector2(); // vec moved by joystick

        joystick = new VirtualJoystick({
            container : document.getElementById('joystick-container'),
            stickElement : domStick,
            baseElement : domBase, 
            stationaryBase : true,
            baseX : 90,
            baseY :  window.innerHeight - 90,
            limitStickTravel: true,
            stickRadius : STICK_TRAVEL_RADIUS
        });

        api.joystick = joystick ;

        params.isTouchScreen = true ;

    };

    //

    function update( delta ) {

        if ( input.params.isTouchScreen ) checkJoystickDelta();

    };

    ////////////////////
    ///// GAME KEYS
    ////////////////////

    // TOUCHSCREEN

    function checkJoystickDelta() {

        // show/hide cross blinking animation
        if ( joystick._pressed ) {

            domCross.classList.remove( 'blink-cross' );

        } else {

            domCross.classList.add( 'blink-cross' );

        };

        if ( joystick._pressed && 
             ( Math.abs( joystick.deltaX() ) > 10 ||
               Math.abs( joystick.deltaY() ) > 10 ) ) {

            if ( moveKeys.length == 0 ) {
                moveKeys.push( 'joystick' );
            };

            // Set the vector we will measure the angle of with the
            // virtual joystick's position deltas
            moveVec.set( joystick.deltaY(), joystick.deltaX() );

            joystickAngle = ( Math.round( ( moveVec.angle() / 6 ) * 4 ) / 4 ) * ( Math.PI * 2 ) ;

            if ( joystickState != joystickAngle ) {

                if ( window.navigator.vibrate) {

                    window.navigator.vibrate( 20 );

                };

                joystickState = joystickAngle ;

            };

            controler.setMoveAngle( true, utils.toPiRange( joystickAngle ) );

        } else {

            joystickState = undefined ;

            // Reset moveKeys array
            if ( moveKeys.length > 0 &&
                 moveKeys.indexOf('joystick') > -1 ) {

                moveKeys.splice( 0, 1 );
            
            };

        };

    };

    //

    domActionButton.addEventListener( 'touchstart', (e)=> {

        if (e.cancelable) {
           e.preventDefault();
        };

        if ( !params.isSpacePressed &&
             !blockAction ) {

            params.isSpacePressed = true ;

            pressAction();

        };

        // cosmetic feedback
        domActionButton.style.opacity = '1.0' ;
        domActionButton.classList.remove( 'release-button' );
        domActionButton.classList.add( 'push-button' );
        if ( window.navigator.vibrate) {

            window.navigator.vibrate( 20 );
            
        };

    });

    //

    domActionButton.addEventListener( 'touchend', (e)=> {

        if (e.cancelable) {
           e.preventDefault();
        };

        if ( !blockAction ) {

            releaseAction();
            params.isSpacePressed = false ;

        } else {

            blockAction = false ;

        };

        domActionButton.style.opacity = '0.5' ;
        domActionButton.classList.remove( 'push-button' );
        domActionButton.classList.add( 'release-button' );
        if ( window.navigator.vibrate) {

            window.navigator.vibrate( 20 );
            
        };

    });

    //

    // request next line if the touch action was not for scrolling

    domCharContainer.addEventListener( 'touchend', (e)=> {

        if ( !interaction.questionTree.isQuestionAsked &&
             interaction.isInDialogue() ) {

            interaction.requestNextLine();

        };

    });

    domTalkContainer.addEventListener( 'touchend', (e)=> {

        if ( !interaction.questionTree.isQuestionAsked &&
             interaction.isInDialogue() ) {

            interaction.requestNextLine();

        };

    });

    //KEYBOARD

    window.addEventListener( 'keydown', (e)=> {

        switch( e.code ) {

            case 'Escape' :
                // console.log('press escape');
                break;

            case 'KeyA':
            case 'ArrowLeft':
                addMoveKey( 'left' );
                break;

            case 'KeyW':    
            case 'ArrowUp' :
                addMoveKey( 'up' );
                break;

            case 'KeyD':
            case 'ArrowRight' :
                addMoveKey( 'right' );
                break;

            case 'KeyS':
            case 'ArrowDown' :
                addMoveKey( 'down' );
                break;

            case 'Space' :

                if ( !params.isSpacePressed &&
                     !blockAction ) {

                    params.isSpacePressed = true ;

                    pressAction();

                };

                break;

        };
        
    }, false);

    //

    window.addEventListener( 'keyup', (e)=> {

        switch( e.code ) {

            case 'KeyA':
            case 'ArrowLeft' :
                removeMoveKey( 'left' );
                break;

            case 'KeyW':
            case 'ArrowUp' :
                removeMoveKey( 'up' );
                break;
            
            case 'KeyD':
            case 'ArrowRight' :
                removeMoveKey( 'right' );
                break;

            case 'KeyS':
            case 'ArrowDown' :
                removeMoveKey( 'down' );
                break;

            case 'Space' :

                if ( !blockAction ) {

                    releaseAction();
                    params.isSpacePressed = false ;

                } else {

                    blockAction = false ;

                };

                break;

        };

    });

    //

    function removeMoveKey( keyString ) {

        moveKeys.splice( moveKeys.indexOf( keyString ), 1 );

        sendMoveDirection();

    };

    //

    function addMoveKey( keyString ) {

        if ( gameState.params.isGamePaused ) {

            // console.log( 'navigate in menu' );

        } else if ( interaction.isInDialogue() ) {

            interaction.chooseAnswer( keyString );

        } else if ( moveKeys.indexOf( keyString ) < 0 ) {

            moveKeys.unshift( keyString );
            sendMoveDirection();

        };
        
    };

    //

    function sendMoveDirection() {

        tempDirArray = [ moveKeys[0], moveKeys[1] ];

        if ( !tempDirArray[0] ) { // no movement

            controler.setMoveAngle( false );

        } else if ( !tempDirArray[1] ) { // orthogonal movement

            if ( tempDirArray[0] == 'left' ) {

                controler.setMoveAngle( true, -Math.PI / 2 );
            };

            if ( tempDirArray[0] == 'up' ) {

                controler.setMoveAngle( true, Math.PI );
            };

            if ( tempDirArray[0] == 'right' ) {

                controler.setMoveAngle( true, Math.PI / 2 );
            };

            if ( tempDirArray[0] == 'down' ) {

                controler.setMoveAngle( true, 0 );
            };

        } else { // diagonal movement

            if ( tempDirArray.indexOf( 'left' ) > -1 &&
                tempDirArray.indexOf( 'up' ) > -1 ) {

                controler.setMoveAngle( true, (-Math.PI / 4) * 3 );
            };

            if ( tempDirArray.indexOf( 'right' ) > -1 &&
                tempDirArray.indexOf( 'up' ) > -1 ) {

                controler.setMoveAngle( true, (Math.PI / 4) * 3 );
            };

            if ( tempDirArray.indexOf( 'right' ) > -1 &&
                tempDirArray.indexOf( 'down' ) > -1 ) {

                controler.setMoveAngle( true, Math.PI / 4 );
            };

            if ( tempDirArray.indexOf( 'left' ) > -1 &&
                tempDirArray.indexOf( 'down' ) > -1 ) {

                controler.setMoveAngle( true, -Math.PI / 4 );
            };

            // Contradictory inputs :
            // the last input is sent to atlas :

            if ( tempDirArray.indexOf( 'up' ) > -1 &&
                tempDirArray.indexOf( 'down' ) > -1 ) {

                controler.setMoveAngle( true, tempDirArray[0] == 'up' ? Math.PI : 0 );
            };

            if ( tempDirArray.indexOf( 'left' ) > -1 &&
                tempDirArray.indexOf( 'right' ) > -1 ) {

                controler.setMoveAngle( true, tempDirArray[0] == 'right' ? Math.PI / 2 : -Math.PI / 2 );
            };

        };

    };

    //

    function pressAction() {

        interaction.hideMessage();

        if ( gameState.params.isGamePaused ) {

            // console.log( 'validate in menu' );

        } else if ( interaction.isInDialogue() ) {

            interaction.requestNextLine();

        } else {

            controler.pressAction();

        };

    };

    //

    function releaseAction() {

        if ( !gameState.params.isGamePaused &&
             !interaction.isInDialogue() ) {

            controler.releaseAction();

        };
    
    };

    //

    function blockPressAction() {

        blockAction = true ;
        params.isSpacePressed = false ;
        
    };

    //

    var api = {
        params,
        moveKeys,
        update,
        initJoystick,
        blockPressAction
    };

    return api ;

};
