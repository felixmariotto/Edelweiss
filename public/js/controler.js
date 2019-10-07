
function Controler( player ) {


    var speedUp = 0 ;
    var groundCollisionHeight;


    function update( delta ) {

        //////////////////////////////////////
        ///  GRAVITY AND GROUND COLLISION
        //////////////////////////////////////

        groundCollisionHeight = atlas.collidePlayerGround() ;

        if ( groundCollisionHeight || groundCollisionHeight == 0 ) {

            speedUp = 0 ;
            player.position.y = groundCollisionHeight ;

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