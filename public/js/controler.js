
function Controler( player ) {


    // TEMPORARY FEATURE CONTROL
    datGUI.add( GUIControler, 'gliding', true ).onChange( toggleGliding );
    datGUI.add( GUIControler, 'infinityJump', true ).onChange( toggleInfinityJump );
    datGUI.add( GUIControler, 'dash', true ).onChange( toggleDash );

    function toggleGliding( bool ) {
        permission.gliding = bool ;
    };

    function toggleInfinityJump( bool ) {
        permission.infinityJump = bool ;
    };

    function toggleDash( bool ) {
        permission.dash = bool ;
    };


    var cancelSpace = false ;
    var actionTime;

    // animations
    const HAULDURATION = 250 ;
    const SWITCHTILEDURATION = 250 ;
    const PULLUNDERDURATION = 250 ;
    const HAULDOWNDURATION = 250 ;
    const LANDWALLDURATION = 250 ;

    const DISTANCEINTERNALSWITCH = 0.3 ;
    const HAULDOWNLIMIT = -0.02 ;
    const HAULDOWNMAXSPEED = 0.95 ;
    const PERCENTHEIGHTHAULDOWN = 0.9 ; // height of final position

    // vert movements
    var speedUp = 0 ;
    var yCollision;
    const SLIPSPEED = -0.21 ;
    const MAXSLIPINERTIA = 0.15 ;
    const HAULTOPLIMIT = 0.75 ;
    const HAULLLOWLIMIT = 0.45 ; // when player arrives from the top
    const PULLUNDERLIMIT = 0.3 ;

    // horiz movements
    var SPEED = 0.035 ;
    var HORIZMOVEVECT = new THREE.Vector3( 0, 0, SPEED );
    var AXISHORIZMOVEROT = new THREE.Vector3( 0, 1, 0 );
    var requestedMove ;
    var currentDirection = 0 ;
    var requestedDirection = 0 ;
    var angleToApply = 0 ;
    var inertia = 0 ;
    var runCounter = 0;

    // climbing movements
    var xCollision ;
    var SLIPWALLFACTOR = 0.35 ;
    const EASYWALLFACTOR = 1 ;
    const HARDWALLFACTOR = 0.4 ;
    const MEDIUMWALLFACTOR = 0.65 ;
    var climbSpeedFactor;
    var CLIMBSPEED = 0.022 ;
    var CLIMBVEC = new THREE.Vector3();
    var AXISX = new THREE.Vector3( 1, 0, 0 );
    var AXISZ = new THREE.Vector3( 0, 0, 1 );

    // wall-jump
    const WALLJUMPINERTIA = 1.8 ;
    const WALLJUMPSPEEDUP = 0.95 ;

    // player state
    var state = {
        isFlying: false,
        isGliding: false,
        isClimbing: false,
        isSlipping: false,
        isDashing: false,
        chargingDash: false
    };

    // player permission
    var permission = {
        gliding: true,
        infinityJump: true,
        dash: true
    };

    const GLIDINGTIME = 200 ;
    var glidingCount = 0 ;

    const DASHTIME = 300 ; // ms necessary to charge a dash
    const DASHTIMEINCREMENT = 0.05 ; // dash speed
    const DASHDISTANCE = 0.28 ;
    var dashCount = 0 ;
    var dashVec = new THREE.Vector3();
    var dashTime;
    var dashWallDirection;
    const DASHTGRAVITY = 0.5 ; // t from which the dash get gravity
    var initialX, initialZ ; // Used in case the player dash to an no-wall area,
                             // so we can push the player toward the ground

    // hold the side on which the player contacts
    // a wall. "left", "right", "up" or "down".
    // undefined if no wall
    var contactDirection; 

    /*
    pendingAction can hold an object containing the information
    about the action to perform :
    {
        startTime,
        duration, ( t is computed from startTime and duration )
        startVec,
        endVec
    }
    */
    var pendingAction; 


    function startAction( name, duration, endVec, startAngle, endAngle ) {

        pendingAction = {
            name,
            startTime : Date.now(),
            duration,
            startAngle,
            endAngle,
            startVec : new THREE.Vector3().copy( player.position ),
            endVec
        };

    };



    function updateAction( delta ) {

        // Play the animation
        // We must put this in the loop to recompute
        // climbing animations balance
        switch ( pendingAction.name ) {

            case 'haulDown' :
                charaAnim.haulDown();
                break;

            case 'switchInward' :
                charaAnim.switchInward();
                break;

            case 'switchOutward' :
                charaAnim.switchOutward();
                break;

            case 'pullUnder' :
                charaAnim.pullUnder();
                break;

            case 'haulUp' :
                charaAnim.haulUp();
                break;

        };

        // update timer
        actionTime = ( Date.now() - pendingAction.startTime ) / pendingAction.duration ;

        // move and rotate

        player.position.lerpVectors(
            pendingAction.startVec,
            pendingAction.endVec,
            actionTime
        );

        charaAnim.setCharaRot( utils.lerpAngles(
            pendingAction.startAngle,
            pendingAction.endAngle,
            actionTime
        ));

        if ( actionTime > 1 ) {
            
            // Reset all movements value,
            // so at the end of the action, the player will
            // start on fresh new movements
            inertia = 0 ;
            speedUp = 0 ;
            contactDirection = undefined ;

            pendingAction = undefined ;
        };

    };






    function update( delta ) {


        // an alternate update function is called if
        // an action is pending
        if ( pendingAction ) {

            updateAction( delta );
            return

        };




        /////////////////////////////////
        ///  GLIDING AND DASH STATES
        /////////////////////////////////

        if ( state.isFlying && input.params.isSpacePressed ) {

            glidingCount += delta * 1000 ;

            if ( glidingCount >= GLIDINGTIME && permission.gliding ) {
                state.isGliding = true ;
                cancelSpace = true ;
            };

        } else if ( !cancelSpace &&
                    state.isClimbing &&
                    input.params.isSpacePressed ) {

            dashCount += delta * 1000 ;

            if ( dashCount >= DASHTIME && permission.dash ) {
                state.chargingDash = true ;
            };

        } else {

            glidingCount = 0 ;
            dashCount = 0 ;
            state.isGliding = false ;

        };










        ///////////////////////////////////////
        ///       HORIZONTAL MOVEMENT
        ///////////////////////////////////////


        if ( ( input.moveKeys.length > 0 ) &&
            !state.isClimbing &&
            !state.isSlipping &&
            !state.isDashing &&
            !state.chargingDash ) {


            charaAnim.setCharaRot( currentDirection );


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

                    // slow down before instead of U-turn if fast in the air
                    if ( state.isFlying && inertia > 0.15 ) {

                        inertia = inertia * 0.7 ;

                    } else {

                        currentDirection = requestedDirection ;
                        HORIZMOVEVECT.applyAxisAngle( AXISHORIZMOVEROT, angleToApply );

                        // reset inertia
                        inertia = 0 ;

                    };


                // Normal tweening
                } else {

                    if ( state.isFlying ) {

                        currentDirection = utils.toPiRange( currentDirection + (angleToApply / 20) );
                        HORIZMOVEVECT.applyAxisAngle( AXISHORIZMOVEROT, angleToApply / 20 );

                    } else {

                        currentDirection = utils.toPiRange( currentDirection + (angleToApply / 4) );
                        HORIZMOVEVECT.applyAxisAngle( AXISHORIZMOVEROT, angleToApply / 4 );

                    };

                };

            } else {

                angleToApply = 0 ;

            };



            /////////////
            //  INERTIA
            /////////////

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

                    inertia = inertia >= 1 ? inertia * 0.95 : inertia + 0.06 ;
                    
                };

            };




        //////////////////////////
        ///  CLIMBING MOVEMENTS
        //////////////////////////

        } else if ( ( input.moveKeys.length > 0 ) &&
                    ( state.isClimbing || state.isSlipping ) &&
                    !state.chargingDash &&
                    !state.isDashing ) {


            runCounter = 0 ;
            inertia = 0 ;

            // Animation will be computed according to climbing direction
            if ( !state.isSlipping ) {
                charaAnim.climb( contactDirection, requestedDirection );
            };

            switch ( contactDirection ) {

                case 'up' :
                    climb( AXISZ, -1, requestedDirection );
                    charaAnim.setCharaRot( Math.PI );
                    break;

                case 'down' :
                    climb( AXISZ, -1, requestedDirection );
                    charaAnim.setCharaRot( 0 );
                    break;

                case 'left' :
                    climb( AXISX, 1, utils.toPiRange( requestedDirection + (Math.PI / 2) ) );
                    charaAnim.setCharaRot( -Math.PI / 2 );
                    break;

                case 'right' :
                    climb( AXISX, -1, utils.toPiRange( (requestedDirection + (Math.PI / 2)) * -1 ) );
                    charaAnim.setCharaRot( Math.PI / 2 );
                    break;

            };


            // Move the player while on the wall
            function climb( axis, vecInversion, angle ) {

                CLIMBVEC.set( 0, CLIMBSPEED * vecInversion, 0 );
                CLIMBVEC.applyAxisAngle( axis, angle );

                player.position.addScaledVector( CLIMBVEC, climbSpeedFactor );

                // This part is to allow the player to go down the wall when they
                // touch the ground
                if ( CLIMBVEC.y < -0.005 && (yCollision.point != undefined)) {

                    state.isClimbing = false ;

                    // Get the player out of the wall
                    angleToApply = utils.toPiRange( requestedDirection - currentDirection ) ;
                    currentDirection = requestedDirection ;
                    HORIZMOVEVECT.applyAxisAngle( AXISHORIZMOVEROT, angleToApply );
                    player.position.addScaledVector( HORIZMOVEVECT, 0.5 );

                };

            };

            



        /////////////////////////////
        ///  DASH DIRECTION SETTING
        /////////////////////////////

        } else if ( ( input.moveKeys.length > 0 ) &&
                    state.chargingDash ) {


            switch ( contactDirection ) {

                case 'up' :
                    setDashVec( AXISZ, -1, requestedDirection );
                    break;

                case 'down' :
                    setDashVec( AXISZ, -1, requestedDirection );
                    break;

                case 'left' :
                    setDashVec( AXISX, 1, utils.toPiRange( requestedDirection + (Math.PI / 2) ) );
                    break;

                case 'right' :
                    setDashVec( AXISX, -1, utils.toPiRange( (requestedDirection + (Math.PI / 2)) * -1 ) );
                    break;

            };


            function setDashVec( axis, vecInversion, angle ) {

                dashVec.set( 0, vecInversion, 0 );
                dashVec.applyAxisAngle( axis, angle );

            };



        ///////////////////////
        ///  DASH MOVEMENT
        ///////////////////////

        } else if ( state.isDashing ) {

            charaAnim.dash( contactDirection, requestedDirection );

            inertia = 0 ;

            dashTime = dashTime + DASHTIMEINCREMENT || 0.01 ;

            let factor = 1 - dashTime ;

            player.position.addScaledVector(
                dashVec,
                Math.min( DASHDISTANCE * factor, 0.14 )
            );

            
            switch ( contactDirection ) {

                case 'up' :
                    player.position.z -= 0.05 ;
                    break;

            };


            if ( dashTime > 0.98 ) {
                state.isDashing = false ;
                dashTime = undefined ;
            };




        //////////////////
        ///  SLOWDOWN
        //////////////////

        } else {


            // reset the counter allowing to run
            runCounter = 0 ;

            if ( state.isFlying ) {

                // We set a minimal speed when gliding
                if ( state.isGliding ) {

                    inertia = Math.max( inertia, 0.2 );

                } else {

                    // slowdown is slower in the air
                    inertia = inertia * 0.98 ;

                };

            } else { // on ground

                inertia = inertia / 1.6 ;

            };

        };


        ////////////  PLAYER X Z TRANSLATION ///////////////////////
        player.position.addScaledVector( HORIZMOVEVECT, inertia );

        


        //////////////////////////////////////
        ///  GRAVITY AND GROUND COLLISION
        //////////////////////////////////////

        
        // atlas compute the position of the player according
        // to the horizontal obstacles in the scene.
        yCollision = atlas.collidePlayerGrounds() ;


        // There is a collision with the ground
        if ( yCollision.point != undefined ) {


            if ( state.isFlying &&
                 !state.isClimbing &&
                 !state.isSlipping &&
                 !state.isGliding ) {

                charaAnim.hitGround( Math.max( - speedUp, 0 ) / 2.3 );
            };


            // We don't want any Y movement when standing
            // on the ground
            speedUp = 0 ;

            // Player stands on the ground
            if ( yCollision.direction == 'down' ) {


                state.isFlying = false ;
                player.position.y = yCollision.point ;


                /////////////////////////
                ///  HAUL DOWN ACTION
                /////////////////////////

                // Check for speed so that if the player walk fast or run
                // toward the edge, they won't be hauled down. To be hauled down,
                // one must approach the edge slowly.
                if ( inertia <= HAULDOWNMAXSPEED ) {

                    if ( yCollision.maxX < player.position.x + HAULDOWNLIMIT ) {

                        startAction(
                            'haulDown',
                            HAULDOWNDURATION,
                            new THREE.Vector3(
                                yCollision.maxX + ( atlas.PLAYERWIDTH / 2 ) - 0.1,
                                player.position.y - (atlas.PLAYERHEIGHT * PERCENTHEIGHTHAULDOWN),
                                player.position.z
                            ),
                            charaAnim.group.rotation.y,
                            utils.toPiRange( charaAnim.group.rotation.y + 3.1 )
                        );
                    };


                    if ( yCollision.minX > player.position.x - HAULDOWNLIMIT ) {

                        startAction(
                            'haulDown',
                            HAULDOWNDURATION,
                            new THREE.Vector3(
                                yCollision.minX - ( atlas.PLAYERWIDTH / 2 ) + 0.1,
                                player.position.y - (atlas.PLAYERHEIGHT * PERCENTHEIGHTHAULDOWN),
                                player.position.z
                            ),
                            charaAnim.group.rotation.y,
                            utils.toPiRange( charaAnim.group.rotation.y + 3.1 )
                        );
                    };


                    if ( yCollision.minZ > player.position.z - HAULDOWNLIMIT ) {

                        startAction(
                            'haulDown',
                            HAULDOWNDURATION,
                            new THREE.Vector3(
                                player.position.x,
                                player.position.y - (atlas.PLAYERHEIGHT * PERCENTHEIGHTHAULDOWN),
                                yCollision.minZ - ( atlas.PLAYERWIDTH / 2 ) + 0.1
                            ),
                            charaAnim.group.rotation.y,
                            utils.toPiRange( charaAnim.group.rotation.y + 3.1 )
                        );
                    };


                    if ( yCollision.maxZ < player.position.z + HAULDOWNLIMIT ) {

                        startAction(
                            'haulDown',
                            HAULDOWNDURATION,
                            new THREE.Vector3(
                                player.position.x,
                                player.position.y - (atlas.PLAYERHEIGHT * PERCENTHEIGHTHAULDOWN),
                                yCollision.maxZ + ( atlas.PLAYERWIDTH / 2 ) - 0.1
                            ),
                            charaAnim.group.rotation.y,
                            utils.toPiRange( charaAnim.group.rotation.y + 3.1 )
                        );
                    };

                };



            } else { // Player hit a roof

                // It's important to position the player slightly out
                // of collision with the roof, or at next frame a new
                // collision with the roof will be detected and speedUp
                // will be set again to 0, which would stick the player
                // to the roof
                player.position.y = yCollision.point - 0.05 ;

            };


        // There is no collision with the ground
        } else if ( !state.isDashing || dashTime > DASHTGRAVITY ) {
            
            state.isFlying = true ;

            if ( state.isGliding ) {

                // set gliding fall speed
                speedUp = -0.1 ;

            } else if ( state.isClimbing ) {

                // Here we make the player slip a little bit along
                // a climbing wall if they were falling ( or slipping
                // a slip-wall )
                speedUp = speedUp > -0.01 ?
                                0 :
                                Math.max( speedUp, -0.3 ) * 0.85 ;

            } else {

                // Normal gravity
                speedUp -= 0.06 ;
                speedUp = Math.max( Math.min( speedUp, 1.25 ), -2.3 );

            };


        };







        /////////////  APPLY GRAVITY  ////////////////
        player.position.y += ( speedUp * 0.1 ) ;




        /////////////////////////////////////////////
        ///  CLIMBING SETTING AND WALL COLLISIONS
        /////////////////////////////////////////////

        // COLLISIONS FROM ATLAS MODULE
        xCollision = atlas.collidePlayerWalls( currentDirection );


        


        // INWARD ANGLE SWITCH ACTION
        if ( !state.isDashing && 
             xCollision.majorWallType != 'wall-slip' &&
             xCollision.majorWallType != 'wall-fall' &&
             xCollision.majorWallType != 'wall-limit' &&
             contactDirection &&
             xCollision.direction &&
             contactDirection != xCollision.direction ) {
    

            let x, z ;
            

            // Set one axis from the direction of the final tile
            switch ( xCollision.direction ) {

                case 'right' :
                    x = player.position.x ;
                    finalAnimationAngle = Math.PI / 2 ;
                    if ( contactDirection == 'up' ) {
                        z = player.position.z + DISTANCEINTERNALSWITCH;
                    } else {
                        z = player.position.z - DISTANCEINTERNALSWITCH;
                    };
                    break;

                case 'left' :
                    x = player.position.x ;
                    finalAnimationAngle = -Math.PI / 2 ;
                    if ( contactDirection == 'up' ) {
                        z = player.position.z + DISTANCEINTERNALSWITCH;
                    } else {
                        z = player.position.z - DISTANCEINTERNALSWITCH;
                    };
                    break;

                case 'up' :
                    z = player.position.z ;
                    finalAnimationAngle = Math.PI ;
                    if ( contactDirection == 'right' ) {
                        x = player.position.x - DISTANCEINTERNALSWITCH;
                    } else {
                        x = player.position.x + DISTANCEINTERNALSWITCH;
                    };
                    break;

                case 'down' :
                    z = player.position.z ;
                    finalAnimationAngle = 0 ;
                    if ( contactDirection == 'right' ) {
                        x = player.position.x - DISTANCEINTERNALSWITCH;
                    } else {
                        x = player.position.x + DISTANCEINTERNALSWITCH;
                    };
                    break;

            };


            let endVec = new THREE.Vector3(
                x,
                player.position.y,
                z
            );

            startAction(
                'switchInward',
                SWITCHTILEDURATION,
                endVec,
                charaAnim.group.rotation.y,
                finalAnimationAngle
            );


        };


        contactDirection = xCollision.direction ;


        if ( xCollision.xPoint ) {
            player.position.x = xCollision.xPoint ;
        };

        if ( xCollision.zPoint ) {
            player.position.z = xCollision.zPoint ;
        };

        if ( xCollision.majorWallType &&
            ( !state.isDashing ||
              xCollision.direction == dashWallDirection ) ) {



            // Save the direction of the wall while charging dash,
            // for collision detection while dashing
            if ( state.chargingDash ) {
                dashWallDirection = xCollision.direction ;
            };



            ///////////////////////////////////////////////////////
            ///  SPECIAL ANIMATIONS (HAUL, SWITCH DIRECTION...)
            ///////////////////////////////////////////////////////


            // Here we detect if the player is going toward the edge
            // of a climbable tile, so that we can trigger some special
            // actions, like hauling to player up an edge, or
            // switch direction
            if ( !state.isDashing &&
                 xCollision.majorWallType != 'wall-slip' &&
                 xCollision.majorWallType != 'wall-fall' &&
                 xCollision.majorWallType != 'wall-limit') {


                // switch on -X
                if ( xCollision.minX > player.position.x ) {

                    if ( contactDirection == 'up' ) {
                        setPos( -1 );
                    };

                    if ( contactDirection == 'down' ) {
                        setPos( 1 );
                    };

                    function setPos( factor ) {
                        startAction(
                            'switchOutward',
                            SWITCHTILEDURATION,
                            new THREE.Vector3(
                                xCollision.minX - ( atlas.PLAYERWIDTH / 2 ) + 0.1,
                                player.position.y,
                                player.position.z + (atlas.PLAYERWIDTH * factor)
                            ),
                            charaAnim.group.rotation.y,
                            Math.PI / 2
                        );
                    };

                    // return
                };


                // switch on +X
                if ( xCollision.maxX < player.position.x ) {

                    if ( contactDirection == 'up' ) {
                        setPos( -1 );
                    };

                    if ( contactDirection == 'down' ) {
                        setPos( 1 );
                    };

                    function setPos( factor ) {
                        startAction(
                            'switchOutward',
                            SWITCHTILEDURATION,
                            new THREE.Vector3(
                                xCollision.maxX + ( atlas.PLAYERWIDTH / 2 ) - 0.1,
                                player.position.y,
                                player.position.z + (atlas.PLAYERWIDTH * factor)
                            ),
                            charaAnim.group.rotation.y,
                            -Math.PI / 2
                        );
                    };

                    // return
                };


                // switch on -Z
                if ( xCollision.minZ > player.position.z ) {

                    if ( contactDirection == 'left' ) {
                        setPos( -1 );
                    };

                    if ( contactDirection == 'right' ) {
                        setPos( 1 );
                    };

                    function setPos( factor ) {
                        startAction(
                            'switchOutward',
                            SWITCHTILEDURATION,
                            new THREE.Vector3(
                                player.position.x + ( atlas.PLAYERWIDTH * factor ),
                                player.position.y,
                                xCollision.minZ - ( atlas.PLAYERWIDTH / 2 ) + 0.1
                            ),
                            charaAnim.group.rotation.y,
                            0
                        );
                    };

                    // return
                };


                // switch on +Z
                if ( xCollision.maxZ < player.position.z ) {

                    if ( contactDirection == 'left' ) {
                        setPos( -1 );
                    };

                    if ( contactDirection == 'right' ) {
                        setPos( 1 );
                    };

                    function setPos( factor ) {
                        startAction(
                            'switchOutward',
                            SWITCHTILEDURATION,
                            new THREE.Vector3(
                                player.position.x + ( atlas.PLAYERWIDTH * factor ),
                                player.position.y,
                                xCollision.maxZ + ( atlas.PLAYERWIDTH / 2 ) - 0.1
                            ),
                            charaAnim.group.rotation.y,
                            Math.PI
                        );
                    };

                    // return
                };


                if ( xCollision.maxHeight < player.position.y + (atlas.PLAYERHEIGHT * HAULTOPLIMIT) ) {

                    haul();

                    // return
                };


                // Pull the player under the lower edge of a tile
                if ( xCollision.minHeight > player.position.y + (atlas.PLAYERHEIGHT * PULLUNDERLIMIT) ) {
                    
                    switch (contactDirection) {

                        case 'up' :
                            startAction(
                                'pullUnder',
                                PULLUNDERDURATION,
                                new THREE.Vector3(
                                    player.position.x,
                                    xCollision.minHeight - atlas.PLAYERHEIGHT,
                                    player.position.z - (atlas.PLAYERWIDTH / 2)
                                ),
                                charaAnim.group.rotation.y,
                                charaAnim.group.rotation.y
                            );
                            break;

                        case 'down' :
                            startAction(
                                'pullUnder',
                                PULLUNDERDURATION,
                                new THREE.Vector3(
                                    player.position.x,
                                    xCollision.minHeight - atlas.PLAYERHEIGHT,
                                    player.position.z + (atlas.PLAYERWIDTH / 2)
                                ),
                                charaAnim.group.rotation.y,
                                charaAnim.group.rotation.y
                            );
                            break;

                        case 'left' :
                            startAction(
                                'pullUnder',
                                PULLUNDERDURATION,
                                new THREE.Vector3(
                                    player.position.x - (atlas.PLAYERWIDTH / 2),
                                    xCollision.minHeight - atlas.PLAYERHEIGHT,
                                    player.position.z
                                ),
                                charaAnim.group.rotation.y,
                                charaAnim.group.rotation.y
                            );
                            break;

                        case 'right' :
                            startAction(
                                'pullUnder',
                                PULLUNDERDURATION,
                                new THREE.Vector3(
                                    player.position.x + (atlas.PLAYERWIDTH / 2),
                                    xCollision.minHeight - atlas.PLAYERHEIGHT,
                                    player.position.z
                                ),
                                charaAnim.group.rotation.y,
                                charaAnim.group.rotation.y
                            );
                            break;

                    };

                    // return
                };
            
            
            // Here we handle the special actions that will occur
            // only if the tile is a slip-wall. Notably, don't want the
            // player to be able to pull themselves underneath the edge
            // of a slip-wall, we want them to just fall numbly
            } else if ( xCollision.majorWallType == 'wall-slip' ) {

                haul();

            };




            // This is used just a few lines higher by the functions
            // that trigger special animations.
            // It haul the player on top of an edge
            function haul() {

                // This first conditional discarded cases when the player was well above
                // the edge of the tile. It was useful before to add a haul down function,
                // but now it's useless and leaded to some issues with dash.
                if ( /* xCollision.maxHeight > player.position.y + (HAULLLOWLIMIT * atlas.PLAYERHEIGHT) &&
                     */ xCollision.maxHeight < player.position.y + (HAULTOPLIMIT * atlas.PLAYERHEIGHT) ) {


                    switch (contactDirection) {

                        case 'up' :

                            startAction(
                                'haulUp',
                                HAULDURATION,
                                new THREE.Vector3(
                                    player.position.x,
                                    xCollision.maxHeight,
                                    player.position.z - atlas.PLAYERWIDTH
                                ),
                                charaAnim.group.rotation.y,
                                charaAnim.group.rotation.y
                            );

                            break;

                        case 'down' :
                            
                            startAction(
                                'haulUp',
                                HAULDURATION,
                                new THREE.Vector3(
                                    player.position.x,
                                    xCollision.maxHeight,
                                    player.position.z + atlas.PLAYERWIDTH
                                ),
                                charaAnim.group.rotation.y,
                                charaAnim.group.rotation.y
                            );

                            break;

                        case 'left' :
                            
                            startAction(
                                'haulUp',
                                HAULDURATION,
                                new THREE.Vector3(
                                    player.position.x - atlas.PLAYERWIDTH,
                                    xCollision.maxHeight,
                                    player.position.z
                                ),
                                charaAnim.group.rotation.y,
                                charaAnim.group.rotation.y
                            );

                            break;

                        case 'right' :
                            
                            startAction(
                                'haulUp',
                                HAULDURATION,
                                new THREE.Vector3(
                                    player.position.x + atlas.PLAYERWIDTH,
                                    xCollision.maxHeight,
                                    player.position.z
                                ),
                                charaAnim.group.rotation.y,
                                charaAnim.group.rotation.y
                            );

                            break;

                    };

                };

            };
            


            


            //////////////////////////////////////////////
            ///  BEHAVIOR SETUP DEPENDING ON WALL TYPE
            //////////////////////////////////////////////
            
            state.isSlipping = false ;

            switch (xCollision.majorWallType) {


                case 'wall-slip' :

                    // set slipping speed
                    if ( speedUp < 0 &&
                         player.position.y > xCollision.minHeight - (atlas.PLAYERHEIGHT / 2) &&
                         player.position.y < xCollision.maxHeight - (atlas.PLAYERHEIGHT * 0.95) ) {

                        speedUp = SLIPSPEED ;
                        // Clamp inertia during slipping so the fall is quite straight
                        inertia = Math.min( inertia, MAXSLIPINERTIA ) ;
                    };

                    setClimbingState( false );
                    climbSpeedFactor = SLIPWALLFACTOR ;

                    // If player touches the ground, we don't want them
                    // to be considered slipping
                    if ( typeof yCollision.point != 'undefined' ) {
                        state.isSlipping = false ;
                    } else {
                        state.isSlipping = true ;
                    };

                    break;



                case 'wall-fall' :

                    // make the player fall
                    if ( player.position.y > xCollision.minHeight - (atlas.PLAYERHEIGHT / 2) &&
                         player.position.y < xCollision.maxHeight - (atlas.PLAYERHEIGHT * 0.95) &&
                         !state.isDashing ) {

                        console.log( yCollision.point == undefined )
                        debugger

                        // compute desired fall direction
                        if ( contactDirection == 'left' ) {

                            currentDirection = Math.PI / 2 ;
                            HORIZMOVEVECT.set( SPEED, 0, 0 );
                        
                        } else if ( contactDirection == 'right' ) {

                            currentDirection = -Math.PI / 2 ;
                            HORIZMOVEVECT.set( -SPEED, 0, 0 );

                        } else if ( contactDirection == 'up' ) {

                            currentDirection = 0 ;
                            HORIZMOVEVECT.set( 0, 0, SPEED );

                        } else if ( contactDirection == 'down' ) {

                            currentDirection = Math.PI ;
                            HORIZMOVEVECT.set( 0, 0, -SPEED );

                        };

                        inertia = 1 ;
                        speedUp = -0.35 ;
                        // player is pushed out of contact with the wall,
                        // so the fall cannot be avoided
                        player.position.addScaledVector( HORIZMOVEVECT, 1.5 );
                    };
                    setClimbingState( false );
                    break;



                case 'wall-easy' :
                    setClimbingState( true );
                    climbSpeedFactor = EASYWALLFACTOR ;
                    break;



                case 'wall-medium' :
                    setClimbingState( true );
                    climbSpeedFactor = MEDIUMWALLFACTOR ;
                    break;



                case 'wall-hard' :
                    setClimbingState( true );
                    climbSpeedFactor = HARDWALLFACTOR ;
                    break;

            };

        // Handle the case when a player hit a wall while dashing
        } else if ( xCollision.majorWallType &&
                    xCollision.direction != dashWallDirection ) {


            // if dashing, rotate the character according to the hitting wall
            if ( state.isDashing ) {

                switch( xCollision.direction ) {

                    case 'up' :
                        charaAnim.setCharaRot( Math.PI );
                        break;

                    case 'down' :
                        charaAnim.setCharaRot( 0 );
                        break;

                    case 'right' :
                        charaAnim.setCharaRot( Math.PI / 2 );
                        break;

                    case 'left' :
                        charaAnim.setCharaRot( -Math.PI / 2 );
                        break;

                };

            };


            state.isDashing = false ;
            dashTime = undefined ;

            // Reposition the player on the wall they collided while dashing

            if ( xCollision.xPoint ) {
                player.position.x = xCollision.xPoint ;
            };
            
            if ( xCollision.zPoint ) {
                player.position.z = xCollision.zPoint ;
            };

            // Offset a little bit the player on the wall they collided,
            // So that inward switching occur from the previous wall
            // to the collided one.

            switch (dashWallDirection) {

                case 'up' :
                    player.position.z += 0.05 ;
                    break ;

                case 'down' :
                    player.position.z -= 0.05 ;
                    break;

                case 'left' :
                    player.position.x += 0.05 ;
                    break;

                case 'right' :
                    player.position.x -= 0.05 ;
                    break;

            };

        } else {

            setClimbingState( false );
            state.isSlipping = false ;

        };



        function setClimbingState( isClimbing ) {

            if ( isClimbing ) {

                state.isClimbing = true ;
                state.isFlying = false ;

            } else {

                state.isClimbing = false ;

            };

        };





        //////////////////////////////
        ///  CALLS FOR ANIMATIONS
        //////////////////////////////


        // Here we check states and call animations accordingly
        if ( state.chargingDash == false &&
            state.isClimbing == false &&
            state.isDashing == false &&
            state.isFlying == false &&
            state.isGliding == false &&
            state.isSlipping == false ) {

            if ( input.moveKeys.length > 0 ) {

                if ( inertia > 1.1 ) {

                    charaAnim.runFast();
    
                } else {
    
                    charaAnim.runSlow();
    
                };

            } else {

                charaAnim.idleGround();

            };

        } else if ( state.isDashing ) {

            charaAnim.dash();

        } else if ( state.chargingDash ) {

            charaAnim.chargeDash();

        } else if ( state.isClimbing ) {

            if ( input.moveKeys.length == 0 ) {

                charaAnim.idleClimb();

            };

            // climbing animation is called higher, to pass
            // direction as argument

        } else if ( state.isGliding ) {

            charaAnim.glide();

        } else if ( state.isSlipping ) {

            // We want to play the slipping animation
            // only if the player is slipping down
            if ( speedUp < 0 ) {
                charaAnim.slip();
            };

        } else if ( state.isFlying && speedUp < 0 ) {

            charaAnim.fall();

        };



        /// UPDATE CAMERA
        cameraControl.update();



    };




















    ////////////////////////////////////
    ///////    GENERAL FUNCTIONS
    ////////////////////////////////////



    // Sent here by input module when the user released space bar
    function spaceInput() {

        

        if ( cancelSpace ) {
            cancelSpace = false ;
            return
        };



        if ( state.chargingDash ) {

            state.chargingDash = false ;
            state.isDashing = true ;
            state.isClimbing = false ;
            state.isSlipping = false ;

            return

        };



        // jump
        if ( ( !permission.infinityJump && !state.isFlying || 
             permission.infinityJump ) ||
             state.isSlipping ) {

            charaAnim.jump();

            player.position.y += 0.1 ;

            // This conditional to make sure that the player is climbing
            // or slipping along a wall
            if ( state.isSlipping || state.isClimbing ) {

                switch ( contactDirection ) {

                    case 'right' :
                        currentDirection = -Math.PI / 2 ;
                        charaAnim.setCharaRot( -Math.PI / 2 );
                        HORIZMOVEVECT.set( -SPEED, 0, 0 );
                        setJump();
                        break;

                    case 'left' :
                        currentDirection = Math.PI / 2 ;
                        charaAnim.setCharaRot( Math.PI / 2 );
                        HORIZMOVEVECT.set( SPEED, 0, 0 );
                        setJump();
                        break;

                    case 'up' :
                        currentDirection = 0 ;
                        charaAnim.setCharaRot( 0 );
                        HORIZMOVEVECT.set( 0, 0, SPEED );
                        setJump();
                        break;

                    case 'down' :
                        currentDirection = Math.PI ;
                        charaAnim.setCharaRot( Math.PI );
                        HORIZMOVEVECT.set( 0, 0, -SPEED );
                        setJump();
                        break;

                    default :
                        speedUp = 1.25 ;
                        break;

                };

            } else {

                speedUp = 1.25 ;
            
            };
            

            function setJump() {

                state.isClimbing = false ;
                state.isSlipping = false ;
                state.isFlying = true ;
                inertia = WALLJUMPINERTIA ;
                speedUp = WALLJUMPSPEEDUP ;

            };


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