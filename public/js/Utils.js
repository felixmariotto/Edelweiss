
function Utils() {

    // This function takes any number,
    // and returns a angle value in the range -PI to PI.
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

    // Returns the value between 0 and 1 representing
    // the interpolant point between vStart and vEnd on v.
    function interp( vStart, v, vEnd ) {
        return ( v - vStart ) / ( vEnd - vStart );
    };

    // Get the minimal difference (delta) between two radians
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

    function vecEquals( vec1, vec2 ) {

        return (

            vec1.x == vec2.x &&
            vec1.y == vec2.y &&
            vec1.z == vec2.z

        );

    };

    /* MAKC */

    // This function returns placeholder display name from https://www.youtube.com/watch?v=gzBZFArR4mc list.

    const names = [
        'DragonKiller75', 'DragonDeesNuts', 'Sug_Madic',
        'Phil_Mcrackin', 'Ice_Wallow_Come', 'Come_Stayin', 'Pen15'
    ];

    var nameIndex = Math.floor( names.length * Math.random() );

    function randomDisplayName() {

        return names[ nameIndex++ % names.length ];

    };

    // This function returns short random string.

    const bytes = new Uint8Array( 15 );

    function randomString() {

        crypto.getRandomValues( bytes );

        return Array.prototype.map.call( bytes, function (x) {

            return x.toString( 36 )

        } ).join( '' ).substr( 0, 15 );

    };

    // This function returns certain numeric hash of the string (we want the
    // result % 4 to be evenly distributed when passed randomString output).
    function stringHash( s ) {

        return s.charCodeAt( 0 ) + s.charCodeAt( 1 );

    };

    //

    return {
        randomDisplayName,
        randomString,
        stringHash,
        toPiRange,
        lerpAngles,
        minDiffRadians,
        distanceVecs,
        interp,
        lerp,
        vecEquals
    };

};