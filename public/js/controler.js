
function Controler( player ) {

    function toggleGliding( bool ) {
        permission.gliding = bool ;
    };

    function toggleInfinityJump( bool ) {
        permission.infinityJump = bool ;
    };

    function toggleDash( bool ) {
        permission.dash = bool ;
    };

    var deathTimeoutToken;
    const FALL_DEATH_TIMEOUT = 400 ;
    const MAX_FALL_SPEED = 4 ;
    var speedDeathLevel = 0 ; // when 4, fallSpeedDeath is 0.65
    var fallSpeedDeath = 0.6 ; // btwn 0 and 1

    var moveSpeedRatio ; // is used to multiply the speed of movements according to FPS

    var cancelSpace = false ;
    var actionTime;

    var hasCollidedCube;

    var hasJumped = false;
    var flyingStartTimestamp = null;
    const JUMP_WHILE_FLYING_THRESHOLD = 250 ;

    // CUBES
    var cubeCollision;
    var interactiveTag; // will be undefined if no interactive cube in range

    /// STAMINA PRICE
    const CLIMBPRICE = 0.00855 ;
    const GLIDINGPRICE = 0.015 ;
    const JUMPPRICE = 2.0 ;
    const DASHPRICE = 3.0 ;

    // animations
    const HAULDURATION = 250 ;
    const SWITCHTILEDURATION = 250 ;
    const PULLUNDERDURATION = 250 ;
    const HAULDOWNDURATION = 250 ;
    const LANDWALLDURATION = 250 ;

    const DISTANCEINTERNALSWITCH = 0.15 ;
    const HAULDOWNLIMIT = -0.02 ;
    const HAULDOWNMAXSPEED = 0.965 ;
    const PERCENTHEIGHTHAULDOWN = 0.9 ; // height of final position

    // vert movements
    var speedUp = 0 ;
    var yCollision;
    const SLIPSPEED = -0.21 ;
    const MAXSLIPINERTIA = 0.15 ;
    const HAULTOPLIMIT = 0.75 ;
    const HAULLLOWLIMIT = 0 ; // when player arrives from the top
    const PULLUNDERLIMIT = 0.3 ;

    // horiz movements
    var SPEED = 0.04 ;
    var HORIZMOVEVECT = new THREE.Vector3( 0, 0, SPEED );
    var AXISHORIZMOVEROT = new THREE.Vector3( 0, 1, 0 );
    var requestedMove ;
    var currentDirection = 0 ;
    var requestedDirection = 0 ;
    var angleToApply = 0 ;
    var inertia = 0 ;

    // climbing movements
    var xCollision ;
    var SLIPWALLFACTOR = 0.35 ;
    const EASYWALLFACTOR = 0.8 ; // speed
    const MEDIUMWALLFACTOR = 0.6 ; // speed
    const HARDWALLFACTOR = 0.5 ; // speed
    var climbSpeedFactor = SLIPWALLFACTOR ;
    var accelerationLevel = 0 ;
    var climbAcceleration = 1 ; // This is used for climbing faster after the player unlocked bonuses
    var CLIMBSPEED = 0.022 ;
    var CLIMBVEC = new THREE.Vector3();
    var AXISX = new THREE.Vector3( 1, 0, 0 );
    var AXISZ = new THREE.Vector3( 0, 0, 1 );

    // fall wall
    const FALLINITGRAVITY = -0.1 ;
    const FALLINITINERTIA = 0.9 ;
    const FALLINITPUSHPOWER = 1.1 ;

    // hit ground
    var hitGroundRecovering = 0 ;
    const HITGROUNDRECOVERYTIME = 150 ;

    // slipping
    var slipRecovering = 0;
    const SLIPRECOVERTIME = 500 ; // time in ms during which
                                  // the user keep slipping after
                                  // they get to a climbable wall

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
        gliding: false,
        infinityJump: false,
        dash: false
    };

    const GLIDINGTIME = 200 ;
    var glidingCount = 0 ;
    var hasGlided = false ;

    var hasDoubledJumped = false;

    const DASHTIME = 300 ; // ms necessary to charge a dash
    const DASHTIMEINCREMENT = 0.05 ; // dash speed
    const DASHDISTANCE = 0.21 ;
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
    var contactType ;

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

    //

    function startAction( name, duration, endVec, startAngle, endAngle ) {

        // Check that the final p osition of the action will no be in a cube

        let startVec = new THREE.Vector3().copy( player.position );

        player.position.copy( endVec );

        let collision = atlas.collidePlayerCubes();

        player.position.copy( startVec );

        // if final position is ok, start action

        if ( !collision.point ) {

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

        return !collision.point ;

    };

    //

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

    ////////////
    /// UPDATE
    ////////////

    function update( delta ) {

        moveSpeedRatio = delta / ( 1 / 60 ) ;

        // Handle the gliding action on the stamina level,
        // and stop gliding of the stamina is over
        if ( state.isGliding ) {

            if ( stamina.params.stamina <= 0 ) {

                glidingCount = 0 ;
                state.isGliding = false ;

            } else if ( !permission.airborne ) {

                stamina.reduceStamina( GLIDINGPRICE );

            };
            
        };

        // an alternate update function is called if
        // an action is pending
        if ( pendingAction ) {

            updateAction( delta );
            return

        };

        // abort the update if player is dying and will respawn
        if ( gameState.params.isCrashing ||
             gameState.params.isGamePaused ) return ;

        // slipRecovering get set to around 500 when the player access
        // a climbable wall after slipping, this way they continue slipping
        // a little bit until slipRecovering <= 0
        if ( slipRecovering > 0 ) {

            slipRecovering -= delta * 1000 ;

        };

        // Same for hit ground recovery time, so the player cannot
        // re-jump right after hitting the ground strongly
        if ( hitGroundRecovering > 0 ) {

            hitGroundRecovering -= delta * 1000 ;

        };

        /////////////////////////////////
        ///  GLIDING AND DASH STATES
        /////////////////////////////////

        if ( state.isFlying && input.params.isSpacePressed ) {

            glidingCount += delta * 1000 ;

            if ( glidingCount >= GLIDINGTIME &&
                permission.gliding &&
                stamina.params.stamina > 0 &&
                !hasGlided ) {

                state.isGliding = true ;
                cancelSpace = true ;
                hasGlided = true ;

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

        if ( !state.isFlying ) {

            hasGlided = false ;

        };

        ///////////////////////////////////////
        ///       HORIZONTAL MOVEMENT
        ///////////////////////////////////////

        if ( ( input.moveKeys.length > 0 ) &&
            !state.isClimbing &&
            ( !state.isSlipping || hasCollidedCube ) &&
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
                    if ( state.isFlying && inertia > 0.10 ) {

                        inertia = inertia * ( 0.94 - ( 0.2 * moveSpeedRatio ) ) ;

                    } else {

                        currentDirection = requestedDirection ;
                        HORIZMOVEVECT.applyAxisAngle( AXISHORIZMOVEROT, angleToApply );

                        // reset inertia
                        inertia = 0 ;

                    };

                // Normal tweening
                } else {

                    if ( state.isFlying ) {

                        currentDirection = utils.toPiRange( currentDirection + (angleToApply / (20 / moveSpeedRatio)) );
                        HORIZMOVEVECT.applyAxisAngle( AXISHORIZMOVEROT, angleToApply / (20 / moveSpeedRatio) );

                    } else {

                        currentDirection = utils.toPiRange( currentDirection + (angleToApply / (4 / moveSpeedRatio)) );
                        HORIZMOVEVECT.applyAxisAngle( AXISHORIZMOVEROT, angleToApply / (4 / moveSpeedRatio) );

                    };

                };

            } else {

                angleToApply = 0 ;

            };

            /////////////
            //  INERTIA
            /////////////

            if ( state.isFlying ) { // in air

                inertia = inertia + (0.03 * moveSpeedRatio) ;
                
            } else { // on ground

                inertia = inertia + ( 0.04 * moveSpeedRatio ) ;

            };

            inertia = Math.min( inertia, 1 );

        //////////////////////////
        ///  CLIMBING MOVEMENTS
        //////////////////////////

        } else if ( ( input.moveKeys.length > 0 ) &&
                    ( state.isClimbing || ( state.isSlipping && !hasCollidedCube ) ) &&
                    !state.chargingDash &&
                    !state.isDashing &&
                    slipRecovering <= 0 ) {

            inertia = 0 ;

            // Animation will be computed according to climbing direction
            if ( !state.isSlipping &&
                 stamina.params.stamina > 0 ) {

                charaAnim.climb(
                    contactDirection,
                    requestedDirection,
                    climbSpeedFactor * climbAcceleration
                );

            } else if ( !state.isSlipping &&
                        stamina.params.stamina <= 0 ) {

                charaAnim.idleClimb();

            };

            switch ( contactDirection ) {

                case 'up' :
                    climb( AXISZ, -1, requestedDirection );
                    charaAnim.setCharaRot( Math.PI );
                    break;

                case 'down' :
                    climb( AXISZ, 1, -requestedDirection );
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

                if ( stamina.params.stamina > 0 ||
                     state.isSlipping ) {

                    if ( contactType != 'wall-slip' ) {
                        stamina.reduceStamina( CLIMBPRICE * ( moveSpeedRatio * 2 ) );
                    };

                    CLIMBVEC.set( 0, moveSpeedRatio * CLIMBSPEED * vecInversion, 0 );
                    CLIMBVEC.applyAxisAngle( axis, angle );

                    player.position.addScaledVector( CLIMBVEC, climbSpeedFactor * climbAcceleration );

                    if ( Number.isNaN( player.position.x ) ) console.log( climbAcceleration )

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

            dashTime = dashTime + ( DASHTIMEINCREMENT * moveSpeedRatio ) || 0.01 ;

            let factor = 1 - dashTime ;

            player.position.addScaledVector(
                dashVec,
                Math.min( DASHDISTANCE * factor, 0.14 ) * moveSpeedRatio
            );

            if ( dashTime > 0.98 ) {
                state.isDashing = false ;
                dashTime = undefined ;
            };

        //////////////////
        ///  SLOWDOWN
        //////////////////

        } else {


            if ( state.isFlying ) {

                // We set a minimal speed when gliding
                if ( state.isGliding ) {

                    inertia = Math.max( inertia, 0.2 ) ;

                } else {

                    // slowdown is slower in the air
                    inertia = inertia / ( 1 + ( 0.02 * moveSpeedRatio ) ) ;

                };

            } else { // on ground

                inertia = inertia / ( 1 + ( 0.6 * moveSpeedRatio ) ) ;

            };

        };

        ////////////  PLAYER X Z TRANSLATION ///////////////////////
        player.position.addScaledVector( HORIZMOVEVECT, inertia * moveSpeedRatio );

        //////////////////////////////////////
        ///  GRAVITY AND GROUND COLLISION
        //////////////////////////////////////
        
        // atlas compute the position of the player according
        // to the vertical obstacles in the scene.
        yCollision = atlas.collidePlayerGrounds() ;

        // if ground collision, retry collision with less velocity
        if ( yCollision.point != undefined ) {

            player.position.y -= speedUp * 0.1 * ( moveSpeedRatio - 1 ) ;

            yCollision = atlas.collidePlayerGrounds() ;

        };

        // There is a collision with the ground
        if ( yCollision.point != undefined ) {

            hasDoubledJumped = false ;
            
            if ( state.isFlying &&
                 !state.isClimbing &&
                 !state.isSlipping &&
                 !state.isGliding &&
                 speedUp < -0.8 ) {

                if ( - speedUp / MAX_FALL_SPEED > fallSpeedDeath ) {

                    clearTimeout( deathTimeoutToken );
                    deathTimeoutToken = undefined ;

                    charaAnim.die();
                    gameState.die( true );

                } else {

                    charaAnim.hitGround();
                    hitGroundRecovering = HITGROUNDRECOVERYTIME ;

                };

            };

            // We don't want any Y movement when standing
            // on the ground
            speedUp = 0 ;

            // Player stands on the ground
            if ( yCollision.direction == 'down' ) {

                state.isFlying = false ;
                player.position.y = yCollision.point ;

                // Reset timestamp on contact
                flyingStartTimestamp = null;
                hasJumped = false;

                // The player can recover all their stamina
                stamina.resetStamina();

                /////////////////////////
                ///  HAUL DOWN ACTION
                /////////////////////////

                // Check for speed so that if the player walk fast
                // toward the edge, they won't be hauled down. To be hauled down,
                // one must approach the edge slowly.
                if ( inertia <= HAULDOWNMAXSPEED ) {

                    // ledge on the right
                    if ( yCollision.maxX < player.position.x + HAULDOWNLIMIT ) {

                        startAction(
                            'haulDown',
                            HAULDOWNDURATION,
                            new THREE.Vector3(
                                yCollision.maxX + ( atlas.PLAYERWIDTH / 2 ) - 0.1,
                                player.position.y - (atlas.PLAYERHEIGHT * PERCENTHEIGHTHAULDOWN),
                                player.position.z
                            ),
                            Math.PI / 2,
                            -Math.PI / 2
                        );

                        currentDirection = -Math.PI / 2 ;
                        HORIZMOVEVECT.set( -SPEED, 0, 0 ); 
                    };

                    // ledge on the left
                    if ( yCollision.minX > player.position.x - HAULDOWNLIMIT ) {

                        startAction(
                            'haulDown',
                            HAULDOWNDURATION,
                            new THREE.Vector3(
                                yCollision.minX - ( atlas.PLAYERWIDTH / 2 ) + 0.1,
                                player.position.y - (atlas.PLAYERHEIGHT * PERCENTHEIGHTHAULDOWN),
                                player.position.z
                            ),
                            -Math.PI / 2,
                            Math.PI / 2
                        );

                        currentDirection = Math.PI / 2 ;
                        HORIZMOVEVECT.set( SPEED, 0, 0 ); 
                    };

                    // ledge on the front
                    if ( yCollision.minZ > player.position.z - HAULDOWNLIMIT ) {

                        startAction(
                            'haulDown',
                            HAULDOWNDURATION,
                            new THREE.Vector3(
                                player.position.x,
                                player.position.y - (atlas.PLAYERHEIGHT * PERCENTHEIGHTHAULDOWN),
                                yCollision.minZ - ( atlas.PLAYERWIDTH / 2 ) + 0.1
                            ),
                            Math.PI,
                            0
                        );

                        currentDirection = 0 ;
                        HORIZMOVEVECT.set( 0, 0, SPEED ); 
                    };

                    // ledge on the back
                    if ( yCollision.maxZ < player.position.z + HAULDOWNLIMIT ) {

                        startAction(
                            'haulDown',
                            HAULDOWNDURATION,
                            new THREE.Vector3(
                                player.position.x,
                                player.position.y - (atlas.PLAYERHEIGHT * PERCENTHEIGHTHAULDOWN),
                                yCollision.maxZ + ( atlas.PLAYERWIDTH / 2 ) - 0.1
                            ),
                            0,
                            Math.PI
                        );

                        currentDirection = Math.PI ;
                        HORIZMOVEVECT.set( 0, 0, -SPEED ); 
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

            // only set timestamp when flying state is initially set
            if (flyingStartTimestamp === null) {
                flyingStartTimestamp = Date.now() ;
            }
            

            if ( state.isGliding ) {

                // set gliding fall speed
                speedUp = permission.airborne ? 0 : -0.1 ;

            } else if ( state.isClimbing ) {

                // Here we make the player slip a little bit along
                // a climbing wall if they were falling ( or slipping
                // a slip-wall )
                speedUp = speedUp > -0.01 ?
                                0 :
                                Math.max( speedUp, -0.3 ) * 0.85 ;

            } else {

                // Normal gravity
                speedUp -= ( 0.06 * moveSpeedRatio ) ;
                speedUp = Math.max( Math.min( speedUp, 1.25 ), -MAX_FALL_SPEED );

            };

        };

        // Die if the user is falling very fast :
        // They will either hit the ground to death, or fall for ever
        if ( Math.max( - speedUp, 0 ) / MAX_FALL_SPEED > 0.95 && !deathTimeoutToken ) {

            if ( !gameState.params.isDying ) {

                gameState.params.isDying = true ;

                deathTimeoutToken = setTimeout( ()=> {

                    deathTimeoutToken = undefined ;

                    gameState.die();

                }, FALL_DEATH_TIMEOUT );

            };

        };

        // Die if fell into the water at the stage 0
        if ( player.position.y + ( atlas.PLAYERHEIGHT / 2 ) < 0.5 ) {

            clearTimeout( deathTimeoutToken );
            deathTimeoutToken = undefined ;

            if ( !gameState.params.isDying ) {

                 gameState.die();

            };

        };

        /////////////  APPLY GRAVITY  ////////////////

        // We want to clamp the fall value, or player could traverse grounds
        player.position.y += speedUp * 0.1 * moveSpeedRatio ;

        ////////////////////////////
        ///   CUBES COLLISION
        ////////////////////////////

        hasCollidedCube = false ;

        setPlayerFromCubes(0);

        function setPlayerFromCubes(count) {

            cubeCollision = atlas.collidePlayerCubes();

            if ( cubeCollision.point ) {

                hasCollidedCube = true ;

                if ( player.position.y != cubeCollision.point.y ) {
                    
                    if ( Math.max( - speedUp, 0 ) / MAX_FALL_SPEED > fallSpeedDeath ) {

                        clearTimeout( deathTimeoutToken );
                        deathTimeoutToken = undefined ;

                        charaAnim.die();
                        gameState.die( true );

                    } else {

                        speedUp = 0 ;

                    };
                    
                };

                player.position.set(
                    cubeCollision.point.x,
                    cubeCollision.point.y,
                    cubeCollision.point.z
                );

                if ( count < 7 ) setPlayerFromCubes( count + 1 );

            };

        };

        if ( cubeCollision.inRange ) {

            if ( interactiveTag != cubeCollision.tag ) {
                dynamicItems.showInteractionSign( cubeCollision.tag );
            };

            interactiveTag = cubeCollision.tag ;

        } else {

            if ( interactiveTag ) {
                dynamicItems.clearInteractionSign();
            };

            interactiveTag = undefined ;

        };

        /////////////////////////////////////////////
        ///  CLIMBING SETTING AND WALL COLLISIONS
        /////////////////////////////////////////////

        // COLLISIONS FROM ATLAS MODULE
        xCollision = atlas.collidePlayerWalls( currentDirection );

        if ( xCollision.xPoint ) {
            player.position.x = xCollision.xPoint ;
        };

        if ( xCollision.zPoint ) {
            player.position.z = xCollision.zPoint ;
        };

        // INWARD ANGLE SWITCH ACTION
        if ( !state.isDashing &&
             contactDirection &&
             contactType != 'wall-slip' &&
             xCollision.direction &&
             contactDirection != xCollision.direction ) {
    
            let x, z ;

            // blick switching, because we don't want the player to be able
            // to swith to a non-climbable tile.
            if ( xCollision.majorWallType == 'wall-slip' ) {

                switch ( xCollision.direction ) {

                    case 'right' :
                        player.position.x -= 0.01 ;
                        break;

                    case 'left' :
                        player.position.x += 0.01 ;
                        break;

                    case 'up' :
                        player.position.z += 0.01 ;
                        break;

                    case 'down' :
                        player.position.z += 0.01 ;
                        break;

                };

                // this object needs refresh after this teleporting
                xCollision = atlas.collidePlayerWalls( currentDirection );

            // make player switch tile inward
            } else {

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

        };

        contactDirection = xCollision.direction ;
        contactType = xCollision.majorWallType ;

        if ( xCollision.majorWallType &&
            ( !state.isDashing ||
              xCollision.direction == dashWallDirection ) ) {

            // Check if player is mostly out of any wall
            if ( xCollision.maxHeight < player.position.y + ( atlas.PLAYERHEIGHT / 2 ) ||
                 xCollision.minHeight > player.position.y + ( atlas.PLAYERHEIGHT / 2 ) ||
                 xCollision.maxX < player.position.x - 0.05 ||
                 xCollision.minX > player.position.x + 0.05 ||
                 xCollision.maxZ < player.position.z - 0.05 ||
                 xCollision.minZ > player.position.z + 0.05 ) {

                state.isClimbing = false ;
                return
            };

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
            // actions, like hauling the player up an edge, or
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
                };

                haul();

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
                };
            
            // Here we handle the special actions that will occur
            // only if the tile is a slip-wall. Notably, don't want the
            // player to be able to pull themselves underneath the edge
            // of a slip-wall, we want them to just fall numbly
            } else if ( xCollision.majorWallType == 'wall-slip' ) {

                haul();

            };

            // Handle hauling up a ledge

            function haul() {

                if ( xCollision.maxHeight > player.position.y + (HAULLLOWLIMIT * atlas.PLAYERHEIGHT) &&
                     xCollision.maxHeight < player.position.y + (HAULTOPLIMIT * atlas.PLAYERHEIGHT) &&
                     speedUp < 0.4 ) {

                    // cancel the hypotetic ongoing dashing
                    state.isDashing = false ;
                    dashTime = undefined ;

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
                                Math.PI,
                                Math.PI
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
                                0,
                                0
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
                                -Math.PI / 2,
                                -Math.PI / 2
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
                                Math.PI / 2,
                                Math.PI / 2
                            );

                            break;

                    };

                };

            };
            
            //////////////////////////////////////////////
            ///  BEHAVIOR SETUP DEPENDING ON WALL TYPE
            //////////////////////////////////////////////
            
            switch ( xCollision.majorWallType ) {

                case 'wall-slip' :

                    // Make player slip along the wall
                    if ( speedUp <= 0 &&
                         typeof yCollision.point == 'undefined' &&
                         !state.isGliding ) {

                        /*
                        We check if the character is looking at the wall.
                        If not, the player probably doesn't intend to slip on this wall.
                        If yes, then slipping is triggered.
                        */

                        if ( state.isSlipping ) {

                            speedUp = SLIPSPEED ;

                            // Clamp inertia during slipping so the fall is quite straight
                            inertia = Math.min( inertia, MAXSLIPINERTIA ) ;

                            climbSpeedFactor = SLIPWALLFACTOR ;

                        } else {

                            let mustOffset = true ;

                            // is character looking at the RIGHT ?
                            if ( currentDirection > Math.PI / 4 &&
                                 currentDirection < ( Math.PI / 4 ) * 3 ) {

                                if ( contactDirection == 'right' ) mustOffset = false ;

                            // is character looking at the LEFT ?
                            } else if ( currentDirection < -Math.PI / 4 &&
                                        currentDirection > ( -Math.PI / 4 ) * 3 ) {

                                if ( contactDirection == 'left' ) mustOffset = false ;

                            // is character looking FORWARD ?
                            } else if ( currentDirection < Math.PI / 4 &&
                                        currentDirection > -Math.PI / 4 ) {

                                if ( contactDirection == 'down' ) mustOffset = false ;

                            // is character looking at the BACKWARD ?
                            } else if ( currentDirection > ( Math.PI / 4 ) * 3 ||
                                        currentDirection < ( -Math.PI / 4 ) * 3 ) {

                                if ( contactDirection == 'up' ) mustOffset = false ;

                            };

                            if ( !mustOffset ) {

                                state.isSlipping = true ;
                                hasDoubledJumped = false ;

                            };

                        };

                    } else {

                        state.isSlipping = false ;

                    };

                    setClimbingState( false );

                    break;

                case 'wall-fall' :

                    // make the player fall
                    if ( player.position.y > xCollision.minHeight - (atlas.PLAYERHEIGHT / 2) &&
                         player.position.y < xCollision.maxHeight - (atlas.PLAYERHEIGHT * 0.95) &&
                         !state.isDashing ) {

                        jumpOutWall( WALLJUMPINERTIA / 3, WALLJUMPSPEEDUP / 3 );
                    };

                    setClimbingState( false );

                    state.isSlipping = false ;

                    break;

                case 'wall-easy' :

                    setClimbingState( true );

                    climbSpeedFactor = EASYWALLFACTOR ;

                    state.isSlipping = false ;

                    break;

                case 'wall-medium' :

                    setClimbingState( true );

                    climbSpeedFactor = MEDIUMWALLFACTOR ;

                    state.isSlipping = false ;

                    break;

                case 'wall-hard' :

                    setClimbingState( true );

                    climbSpeedFactor = HARDWALLFACTOR ;

                    state.isSlipping = false ;

                    break;

                default :

                    setClimbingState( false );

                    state.isSlipping = false ;

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

        // No x or z collision
        } else {

            setClimbingState( false );
            state.isSlipping = false ;

            // Push the player toward the top of the ledge,
            // so they do not land on the wall again
            if ( state.isDashing &&
                 /* This targets the dash on the Y direction */
                 dashVec.y.toFixed(2) != 0 ) {

                switch ( dashWallDirection ) {

                    case 'up' :
                        player.position.z -= 0.02 ;
                        break;

                    case 'down' :
                        player.position.z += 0.02 ;
                        break;

                    case 'left' :
                        player.position.x -= 0.02 ;
                        break;

                    case 'right' :
                        player.position.x += 0.02 ;
                        break;

                };

            };

        };

        //

        function setClimbingState( isClimbing ) {

            if ( isClimbing ) {

                hasDoubledJumped = false ;

                state.isClimbing = true ;
                state.isFlying = false ;

                // Reset timestamp on contact
                flyingStartTimestamp = null;
                hasJumped = false;

                if ( state.isSlipping ) {
                    slipRecovering = SLIPRECOVERTIME ;
                };

            } else {

                state.isClimbing = false ;

            };

        };

        //////////////////////////////
        ///  CALLS FOR ANIMATIONS
        //////////////////////////////

        // Here we check states and call animations accordingly
        if ( !state.chargingDash &&
             !state.isClimbing &&
             !state.isDashing &&
             !state.isFlying &&
             !state.isGliding &&
             !state.isSlipping ) {

            if ( input.moveKeys.length > 0 ) {

                charaAnim.run();

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

            switch ( contactDirection ) {

                case 'right' :
                    charaAnim.setCharaRot( Math.PI / 2 );
                    break;

                case 'left' :
                    charaAnim.setCharaRot( -Math.PI / 2 );
                    break;

                case 'up' :
                    charaAnim.setCharaRot( Math.PI );
                    break;

                case 'down' :
                    charaAnim.setCharaRot( 0 );
                    break;

            };

            charaAnim.slip();

        } else if ( state.isFlying && speedUp <= 0 ) {

            charaAnim.fall();

        };

    };


    ///////////////////////////
    ///    GENERAL FUNCTIONS
    ///////////////////////////

    function pressAction() {

        if ( interactiveTag ) {
            interaction.interactWith( interactiveTag );
            return
        };

        // JUMP
        
        if ( (( !state.isFlying || state.isSlipping ) ||
              (state.isFlying && !state.isSlipping &&
              (Date.now() - flyingStartTimestamp < JUMP_WHILE_FLYING_THRESHOLD) &&
              !hasJumped )) &&
             hitGroundRecovering <= 0 &&
             stamina.params.stamina > 0 &&
             !state.isClimbing ) {

            // Reset timestamp
            flyingStartTimestamp = null ;
            hasJumped = true;
 
            input.blockPressAction();

            // Animate the jump
            charaAnim.jump();

            // Take the price in stamina
            stamina.reduceStamina( JUMPPRICE, true );

            player.position.y += 0.1 ;

            if ( !state.isSlipping ) {

                speedUp = 1.25 ;

            } else {

                jumpOutWall( WALLJUMPINERTIA, WALLJUMPSPEEDUP );

            };

        };

    };

    // Sent here by input module when the user released space bar

    function releaseAction() {

        if ( cancelSpace ) {
            cancelSpace = false ;
            return
        };

        if ( state.chargingDash &&
             input.moveKeys.length > 0 &&
             stamina.params.stamina > 0 ) {

            state.chargingDash = false ;
            state.isDashing = true ;
            state.isClimbing = false ;
            state.isSlipping = false ;

            // Take dash price to the stamina level
            stamina.reduceStamina( DASHPRICE, true );

            return

        } else if ( state.chargingDash &&
                    ( input.moveKeys.length == 0 ||
                      stamina.params.stamina <= 0 ) ) {

            state.chargingDash = false ;
            state.isClimbing = true ;

            return

        };

        // JUMP

        // Here we check that the player can jump because they are on a wall
        if ( ( ( permission.infinityJump && state.isFlying && !hasDoubledJumped ) ||
               state.isClimbing ) &&
              hitGroundRecovering <= 0 &&
              stamina.params.stamina > 0 ) {

            if ( state.isFlying ) {
                hasDoubledJumped = true ;
            };

            // Animate the jump
            charaAnim.jump();

            // Take the price in stamina
            stamina.reduceStamina( JUMPPRICE, true );

            player.position.y += 0.1 ;

            jumpOutWall( WALLJUMPINERTIA, WALLJUMPSPEEDUP );

        // FALL FROM THE WALL BECAUSE OF LACK OF STAMINA
        } else if ( ( state.isClimbing || state.isSlipping ) &&
                    stamina.params.stamina <= 0 ) {

            jumpOutWall( WALLJUMPINERTIA / 3, WALLJUMPSPEEDUP / 3 );

        };

    };

    //

    function jumpOutWall( jumpSpeed, jumpGravity ) {

        switch ( contactDirection ) {

            case 'right' :
                currentDirection = -Math.PI / 2 ;
                charaAnim.setCharaRot( -Math.PI / 2 );
                HORIZMOVEVECT.set( -SPEED, 0, 0 );
                setJump( jumpSpeed, jumpGravity );
                break;

            case 'left' :
                currentDirection = Math.PI / 2 ;
                charaAnim.setCharaRot( Math.PI / 2 );
                HORIZMOVEVECT.set( SPEED, 0, 0 );
                setJump( jumpSpeed, jumpGravity );
                break;

            case 'up' :
                currentDirection = 0 ;
                charaAnim.setCharaRot( 0 );
                HORIZMOVEVECT.set( 0, 0, SPEED );
                setJump( jumpSpeed, jumpGravity );
                break;

            case 'down' :
                currentDirection = Math.PI ;
                charaAnim.setCharaRot( Math.PI );
                HORIZMOVEVECT.set( 0, 0, -SPEED );
                setJump( jumpSpeed, jumpGravity );
                break;

            default :
                speedUp = 1.25 ;
                break;

        };

    };

    //

    function setJump( jumpSpeed, jumpGravity ) {

        charaAnim.jump();
        state.isClimbing = false ;
        state.isSlipping = false ;
        state.isFlying = true ;
        inertia = jumpSpeed ;
        speedUp = jumpGravity ;

    };

    //

    function setMoveAngle( requestMove, requestedDir ) {

        requestedMove = requestMove ;

        if ( typeof requestedDir != 'undefined' ) {

            requestedDirection = requestedDir ;

        };

    };

    //

    function setSpeedUp( speed ) {

        speedUp = speed ;

    };

    //

    function upgradeAcceleration() {

        accelerationLevel = ( accelerationLevel + 1 ) % 5 ;

        climbAcceleration = 1 + ( 0.15 * accelerationLevel );

    };

    //

    function upgradeSpeedDeath() {

        speedDeathLevel = ( speedDeathLevel + 1 ) % 5 ;

        fallSpeedDeath = 0.5 + ( 0.375 * speedDeathLevel );

    };

    //

    return {
        permission,
        update,
        pressAction,
        releaseAction,
        setMoveAngle,
        setSpeedUp,
        upgradeAcceleration,
        upgradeSpeedDeath,
        dashVec
    };

};
