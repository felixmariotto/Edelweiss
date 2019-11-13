

function Stamina() {

    const domBar = document.getElementById('stamina-bar');

    const STARTSTAMINA = 4 ;

    var params = {
        stamina: 0,
        maxStamina: 0
    };

    var gauges = [];




    //// INIT

    // Create a stamina section for each level
    for ( let i=0 ; i < STARTSTAMINA ; i++ ) {
        incrementMaxStamina();
    };


    function incrementMaxStamina() {

        let divSection = document.createElement('DIV');
        divSection.classList.add('stamina-section');
        domBar.append( divSection );

        let divGauge = document.createElement('DIV');
        divGauge.classList.add('stamina-gauge');
        divSection.append( divGauge );

        gauges.unshift( divGauge );

        params.stamina = gauges.length ;
        params.maxStamina = gauges.length ; 

    };








    function update( mustUpdateDom ) {

        if ( mustUpdateDom ) {

            updateDom();

        };

    };






    ///////////////////////////
    // DOM STAMINA BAR UPDATE
    ///////////////////////////

    function updateDom() {

        gauges.forEach( ( domGauge, i )=> {

            /*
            let a = params.stamina - i
            let b = Math.max( Math.min( a, 1 ), 0 );
            domGauge.style.height = `${ b * 100 }%` ;
            */

            domGauge.style.width = `${ Math.max( Math.min( params.stamina - i, 1 ), 0 ) * 100 }%` ;

        });

    };







    /////////////////////////////////
    ///  STAMINA LEVEL OPERATIONS
    /////////////////////////////////


    // Called by the controler module when player make movements
    function reduceStamina( factor, update ) {

        params.stamina -= factor ;

        if ( params.stamina < 0 ) {
            params.stamina = 0 ;
        };

        if ( update ) {
            updateDom();
        };

    };




    // Called by Controler when the user is on the ground,
    // so the user regain all their stamina and can start
    // climbing again
    function resetStamina() {

        params.stamina = params.maxStamina ;

    };







    return {
        params,
        reduceStamina,
        resetStamina,
        incrementMaxStamina,
        update
    };

};