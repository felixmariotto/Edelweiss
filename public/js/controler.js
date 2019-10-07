
function Controler( player ) {


    // TEMPORARY FEATURE CONTROL
    datGUI.add( GUIControler, 'gliding', true ).onChange( toggleGliding );
    datGUI.add( GUIControler, 'doubleJump', true ).onChange( toggleDoubleJump );
    datGUI.add( GUIControler, 'dash', true ).onChange( toggleDash );

    function toggleGliding( bool ) {
        console.log( 'gliding : ' + bool );
    };

    function toggleDoubleJump( bool ) {
        console.log( 'doubleJump : ' + bool );
    };

    function toggleDash( bool ) {
        console.log( 'dash : ' + bool );
    };


    // vert movements
    var speedUp = 0 ;
    var YCollisionHeight;

    // horiz movements
    var HORIZMOVEVECT = new THREE.Vector3( 0, 0, 0.04 );
    var AXISHORIZMOVEROT = new THREE.Vector3( 0, 1, 0 );
    var requestedMove ;
    var currentDirection = 0 ;
    var requestedDirection = 0 ;
    var angleToApply = 0 ;
    var inertia = 0 ;

    // player state
    var state = {
        isFlying: false
    };



    function update( delta ) {


        ////////////////////////
        ////   MOVEMENT ANGLE
        ////////////////////////

        if ( currentDirection != requestedDirection ) {

            // get the difference in radians between the current orientation
            // and the requested one
            angleToApply = utils.toPiRange( requestedDirection - currentDirection ) ;

            // finish the tweening if the turn is almost finished
            if ( angleToApply < 0.01 && angleToApply > -0.01 ) {

                currentDirection = requestedDirection ;
                HORIZMOVEVECT.applyAxisAngle( AXISHORIZMOVEROT, angleToApply );

            // No tweening in case of U-turn, + inertia reset
            } else if ( angleToApply > 2.8 || angleToApply < -2.8 ) {

                currentDirection = requestedDirection ;
                HORIZMOVEVECT.applyAxisAngle( AXISHORIZMOVEROT, angleToApply );

                // reset inertia
                inertia = 0 ;

            // Normal tweening
            } else {

                currentDirection = utils.toPiRange( currentDirection + (angleToApply / 4) );
                HORIZMOVEVECT.applyAxisAngle( AXISHORIZMOVEROT, angleToApply / 4 );

            };

        };
        


        //////////////////////////////////////
        ///  GRAVITY AND GROUND COLLISION
        //////////////////////////////////////

        // atlas compute the position of the player according
        // to the horizontal obstacles in the scene.
        YCollisionHeight = atlas.collidePlayerGround() ;

        // There is a collision on the Y axis
        if ( YCollisionHeight || YCollisionHeight == 0 ) {

            state.isFlying = false ;

            speedUp = 0 ;
            player.position.y = YCollisionHeight ;

        // There is no collision on the Y axis
        } else {

            state.isFlying = true ;

            speedUp -= 0.06 ;
            speedUp = Math.max( Math.min( speedUp, 1.25 ), -2.3 );

        };

        player.position.y += ( speedUp * 0.1 ) ;


        ///////////////////////////////////////
        ///       HORIZONTAL MOVEMENT
        ///////////////////////////////////////

        // Acceleration
        if ( input.moveKeys.length > 0 ) {

            if ( state.isFlying ) {
                inertia = inertia >= 1 ? 1 : inertia + 0.05 ;
            } else { // on ground
                inertia = inertia >= 1 ? 1 : inertia + 0.1 ;
            };

        // Slowdown
        } else { 

            if ( state.isFlying ) {
                inertia = inertia / 1.12 ;
            } else { // on ground
                inertia = inertia / 1.6 ;
            };

        };

        player.position.addScaledVector( HORIZMOVEVECT, inertia );

    };



    function setJumpSpeed() {
        speedUp = 1.25 ;
        player.position.y += 0.1 ;
    };



    function setMoveAngle( requestMove, requestedDir ) {
        requestedMove = requestMove ;
        if ( typeof requestedDir != 'undefined' ) {
            requestedDirection = requestedDir ;
        };
    };



    return {
        update,
        setJumpSpeed,
        setMoveAngle
    };

};