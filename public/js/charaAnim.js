

function CharaAnim( player ) {


    function setCharaRot( angle ) {

        player.charaGroup.rotation.y = angle ;

    };


    return {
        setCharaRot
    };

};