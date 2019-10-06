
function Controler( player ) {


    var speedUp = 0 ;


    function update( delta ) {

        //////////////////////////////////////
        ///  GRAVITY AND GROUND COLLISION
        //////////////////////////////////////

        if ( atlas.collidePlayerGround() ) {

            speedUp = 0 ;

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