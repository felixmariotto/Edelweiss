
function Controler( player ) {

    // vert movements
    var speedUp = 0 ;
    var YCollisionHeight;

    // horiz movements
    const HORIZMOVESPEED = 0.04 ;
    var HORIZMOVEVECT = new THREE.Vector3();
    var AXISHORIZMOVEROT = new THREE.Vector3( 0, 1, 0 );
    var mustMove ;


    function update( delta ) {

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



    function setMoveAngle( requestMove, angle ) {
        mustMove = requestMove ;
        if ( requestMove ) {
            HORIZMOVEVECT.set( 0, 0, HORIZMOVESPEED );
            HORIZMOVEVECT.applyAxisAngle( AXISHORIZMOVEROT, angle );
        };
    };



    return {
        update,
        setJumpSpeed,
        setMoveAngle
    };

};