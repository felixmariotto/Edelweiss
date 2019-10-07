
function Utils() {

    function toPiRange( rad ) {
        rad = rad % (Math.PI * 2) ;
        if ( rad > Math.PI || rad < -Math.PI ) {
            return ( ( - Math.PI ) - ( Math.PI - Math.abs(rad) ) ) * Math.sign( rad ) ;
        } else {
            return rad ;
        };
    };

    return {
        toPiRange
    };

};