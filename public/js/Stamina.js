

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
        incrementStamina();
    };


    function incrementStamina() {

        let divSection = document.createElement('DIV');
        divSection.classList.add('stamina-section');
        domBar.append( divSection );

        let divGauge = document.createElement('DIV');
        divGauge.classList.add('stamina-gauge');
        divSection.append( divGauge );

        gauges.push( divGauge );

        params.stamina = gauges.length ;
        params.maxStamina = gauges.length ; 

    };





    return {
        params
    };

};