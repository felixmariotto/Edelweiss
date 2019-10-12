

function Utils() {




    // This function takes any number, and given that it's an
    // Euler angle, returns a angle value in the range -PI to PI.
    function toPiRange( rad ) {

        rad = rad % (Math.PI * 2) ;

        if ( rad > Math.PI || rad < -Math.PI ) {

            return ( ( - Math.PI ) - ( Math.PI - Math.abs(rad) ) ) * Math.sign( rad ) ;
        
        } else {

            return rad ;

        };

    };





    function lerpAngles( vStart, vEnd, t ) {

        console.log( 'new angle lerp')
        console.log( 'vStart = ' + vStart )
        console.log( 'vEnd = ' + vEnd )

        if ( Math.abs( vStart - vEnd ) > Math.PI / 2 ) {
            console.log('problem')
        };

        return lerp( vStart, vEnd, t );

    };



    // Linear interpolation function
    // It return the value between vStart and vEnd pointed by
    // the floating point t.
    // t = 0 ==> return vStart
    // t = 1 ==> return vEnd
    function lerp( vStart, vEnd, t ) {

        return ( ( vEnd - vStart ) * t ) + vStart ;

    };





    return {
        toPiRange,
        lerpAngles
    };



};