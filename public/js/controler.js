
function Controler( player ) {


    // TEMPORARY FEATURE CONTROL
    datGUI.add( GUIControler, 'gliding', true ).onChange( toggleGliding );
    datGUI.add( GUIControler, 'infinityJump', true ).onChange( toggleInfinityJump );
    datGUI.add( GUIControler, 'dash', true ).onChange( toggleDash );

    function toggleGliding( bool ) {
        permission.gliding = bool ;

        console.log(permission)
    };

    function toggleInfinityJump( bool ) {
        permission.infinityJump = bool ;
    };

    function toggleDash( bool ) {
        permission.dash = bool ;
    };



    // climbing movements
    var xCollision ;

    // vert movements
    var speedUp = 0 ;
    var yCollision;

    // horiz movements
    var HORIZMOVEVECT = new THREE.Vector3( 0, 0, 0.04 );
    var AXISHORIZMOVEROT = new THREE.Vector3( 0, 1, 0 );
    var requestedMove ;
    var currentDirection = 0 ;
    var requestedDirection = 0 ;
    var angleToApply = 0 ;
    var inertia = 0 ;
    var runCounter = 0;

    // player state
    var state = {
        isFlying: false,
        isGliding: false
    };

    // player permission
    var permission = {
        gliding: true,
        infinityJump: true,
        dash: true
    };

    const GLIDINGTIME = 250 ;
    var glidingCount = 0 ;


    function update( delta ) {


        //////////////////////
        ///  GLIDING STATE
        //////////////////////

        if ( state.isFlying && input.params.isSpacePressed ) {

            glidingCount += delta * 1000 ;

            if ( glidingCount >= GLIDINGTIME ) {
                state.isGliding = true ;
            };

        } else {

            glidingCount = 0 ;
            state.isGliding = false ;

        };



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

        } else {

            angleToApply = 0 ;

        };
        


        //////////////////////////////////////
        ///  GRAVITY AND GROUND COLLISION
        //////////////////////////////////////

        // atlas compute the position of the player according
        // to the horizontal obstacles in the scene.
        yCollision = atlas.collidePlayerGrounds() ;

        // There is a collision with the ground
        if ( yCollision.point != undefined ) {

            speedUp = 0 ;

            // Player stands on the ground
            if ( yCollision.direction == 'down' ) {

                state.isFlying = false ;
                player.position.y = yCollision.point ;

            } else { // Player hit a roof

                // It's important to position the player slightly out
                // of collision with the roof, or at next frame a new
                // collision with the roof will be detected and speedUp
                // will be set again to 0, which would stick the player
                // to the roof
                player.position.y = yCollision.point - 0.05 ;

            };


        // There is no collision with the ground
        } else {

            state.isFlying = true ;

            if ( state.isGliding ) {

                // fall eased slowdown
                speedUp += ( -0.3 - speedUp ) * 0.1 ;

            } else {

                // Normal gravity
                speedUp -= 0.06 ;
                speedUp = Math.max( Math.min( speedUp, 1.25 ), -2.3 );

            };

        };

        player.position.y += ( speedUp * 0.1 ) ;


        ///////////////////////////////////////
        ///       HORIZONTAL MOVEMENT
        ///////////////////////////////////////

        // Acceleration
        if ( input.moveKeys.length > 0 ) {

            // increment the counter allowing to run
            if ( input.params.isSpacePressed ) {
                runCounter += delta * 1000 ;
            } else {
                runCounter = 0;
            };

            if ( state.isFlying ) { // in air

                // Keep the inertia if it a running jump
                if ( inertia > 1 ) {

                    // test for change of direction while in the air
                    if ( angleToApply > 0.1 || angleToApply < -0.1 ) {
                        inertia = inertia >= 1 ? inertia - 0.05 : inertia + 0.05 ;
                    };

                } else {
                    
                    inertia = inertia >= 1 ? 1 : inertia + 0.03 ;

                };
                

            } else { // on ground

                if ( runCounter > 350 ) {
                    inertia = inertia >= 1.8 ? 1.8 : inertia + 0.1 ;
                } else {
                    inertia = inertia >= 1 ? 1 : inertia + 0.06 ;
                };

            };


        // Slowdown
        } else {

            // reset the counter allowing to run
            runCounter = 0 ;

            if ( state.isFlying ) {

                inertia = inertia / 1.12 ;

            } else { // on ground

                inertia = inertia / 1.6 ;

            };

        };

        player.position.addScaledVector( HORIZMOVEVECT, inertia );



        ////////////////////////////
        ///    CLIMBING MOVEMENT
        ////////////////////////////

        xCollision = atlas.collidePlayerWalls( currentDirection );
        // console.log(xCollision)

    };







    // Sent here by input module when the user released space bar
    function spaceInput() {

        if ( !state.isGliding &&
             ( !permission.infinityJump && !state.isFlying || 
             permission.infinityJump ) ) {

            speedUp = 1.25 ;

            player.position.y += 0.1 ;

        };
    };








    function setMoveAngle( requestMove, requestedDir ) {

        requestedMove = requestMove ;

        if ( typeof requestedDir != 'undefined' ) {

            requestedDirection = requestedDir ;

        };

    };



    return {
        update,
        spaceInput,
        setMoveAngle
    };

};