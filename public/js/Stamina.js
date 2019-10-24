

function Stamina() {

    const domBar = document.getElementById('stamina-bar');

    const STARTSTAMINA = 3 ;

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

            ///////////////////////////
            // DOM STAMINA BAR UPDATE
            ///////////////////////////

            // console.log( params.stamina );

            gauges.forEach( ( domGauge, i )=> {

                let a = params.stamina - i // for 2.5 => 2.5, 1.5, 0.5

                let b = Math.max( Math.min( a, 1 ), 0 );

                domGauge.style.height = `${ b * 100 }%` ;

            });

        };

    };






    // Called by the controler module when player make movements
    function reduceStamina( factor ) {

        params.stamina -= factor ;

        if ( params.stamina < 0 ) {
            params.stamina = 0 ;
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
        update
    };

};