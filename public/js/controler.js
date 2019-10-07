
function Controler( player ) {

    // vert movements
    var speedUp = 0 ;
    var YCollisionHeight;

    // horiz movements
    var HORIZMOVEVECT = new THREE.Vector3( 0, 0, 0.04 );
    var AXISHORIZMOVEROT = new THREE.Vector3( 0, 1, 0 );
    var mustMove ;
    var currentDirection = 0 ;
    var requestedDirection = 0 ;
    var angleToApply = 0 ;



    function update( delta ) {


        ////////////////////////
        ////   MOVEMENT ANGLE
        ////////////////////////

        if ( currentDirection != requestedDirection ) {

            // get the difference in radians between the current orientation
            // and the requested one
            angleToApply = utils.toPiRange( requestedDirection - currentDirection ) ;

            // No tweening if :
            // - angle is too small
            // - U-turn
            if ( ( angleToApply < 0.01 && angleToApply > -0.01 ) ||
                 ( angleToApply > 2.8 || angleToApply < -2.8 ) ) {

                currentDirection = requestedDirection ;
                HORIZMOVEVECT.applyAxisAngle( AXISHORIZMOVEROT, angleToApply );

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

        if ( YCollisionHeight || YCollisionHeight == 0 ) {

            speedUp = 0 ;
            player.position.y = YCollisionHeight ;

        } else {

            speedUp -= 0.04 ;
            speedUp = Math.max( Math.min( speedUp, 1 ), -2 );

        };

        player.position.y += ( speedUp * 0.1 ) ;


        ///////////////////////////////////////
        ///       HORIZONTAL MOVEMENT
        ///////////////////////////////////////

        if ( mustMove ) {
            player.position.add( HORIZMOVEVECT );
        };

    };



    function setJumpSpeed() {
        speedUp = 1 ;
        player.position.y += 0.1 ;
    };



    function setMoveAngle( requestMove, requestedDir ) { 
        mustMove = requestMove ;
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