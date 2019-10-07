
function Controler( player ) {


    var speedUp = 0 ;
    var YCollisionHeight;


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

            speedUp -= 0.03 ;
            speedUp = Math.max( Math.min( speedUp, 1 ), -1 );

        };

        player.position.y += ( speedUp * 0.1 ) ;

    };



    function setJumpSpeed() {
        speedUp = 1 ;
        player.position.y += 0.5 ;
    };



    return {
        update,
        setJumpSpeed
    };

};