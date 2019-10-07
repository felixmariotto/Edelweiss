
function Controler( player ) {

    // vert movements
    var speedUp = 0 ;
    var YCollisionHeight;

    // horiz movements
    var HORIZMOVEVECT = new THREE.Vector3( 0, 0, 0.04 );
    var AXISHORIZMOVEROT = new THREE.Vector3( 0, 1, 0 );
    var mustMove ;
    var currentAngle = 0 ;
    var angleToApply = 0 ;



    function update( delta ) {


        ////////////////////////
        ////   MOVEMENT ANGLE
        ////////////////////////

        if ( angleToApply != 0 ) {

            HORIZMOVEVECT.applyAxisAngle( AXISHORIZMOVEROT, angleToApply );

            angleToApply = 0 ;

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

            speedUp -= 0.038 ;
            speedUp = Math.max( Math.min( speedUp, 1 ), -1 );

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



    function setMoveAngle( requestMove, requestedAngle ) { 
        mustMove = requestMove ;
        if ( typeof requestedAngle != 'undefined' ) {
            // get the difference in radians between the current orientation
            // and the requested one
            angleToApply = utils.toPiRange( requestedAngle - currentAngle ) ;
            currentAngle = requestedAngle ;
        };
    };



    return {
        update,
        setJumpSpeed,
        setMoveAngle
    };

};