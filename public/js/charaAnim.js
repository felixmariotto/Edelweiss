

function CharaAnim( player ) {

    const group = player.charaGroup ;


    function setCharaRot( angle ) {

        player.charaGroup.rotation.y = angle ;

    };


    return {
        setCharaRot,
        group
    };

};