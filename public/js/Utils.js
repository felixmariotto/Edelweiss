

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




    // This is a linear interpolation able to interpolate two Euler angles,
    // which values loop from -PI to PI.
    function lerpAngles( vStart, vEnd, t ) {

        // Check if there is a problem of lerp going above PI or bellow -PI
        if ( Math.abs( vStart - vEnd ) > Math.PI / 2 ) {
            
            // The smallest value is added 2 * PI to do the lerp,
            // then reduced to PI range.
            if ( vStart < vEnd ) {

                return toPiRange( lerp( vStart + (Math.PI * 2), vEnd, t ) );

            } else {

                return toPiRange( lerp( vStart, vEnd + (Math.PI * 2), t ) );

            };
        
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



    // Get the minimal difference between two radians
    // ex : -2.5 <--> 2.5 ? => 1.28
    function minDiffRadians( rad1, rad2 ) {
        return Math.atan2( Math.sin( rad1 - rad2), Math.cos( rad1 - rad2) );
    };




    // returns the distance between two vectors 2 or 3
    function distanceVecs( vec1, vec2 ) {

        return Math.sqrt(
            Math.pow( vec1.x - vec2.x, 2 ) +
            Math.pow( vec1.y - vec2.y, 2 ) +
            Math.pow( vec1.z - vec2.z, 2 )
        );

    };





    return {
        toPiRange,
        lerpAngles,
        minDiffRadians,
        distanceVecs
    };



};