

function CharaAnim( player ) {


    const group = player.charaGroup ;

    var state = 'idleGround' ;
    /*

    idleGround
    idleClimb

    runningSlow
	runningFast

	climbUp

    */





    function setCharaRot( angle ) {

        player.charaGroup.rotation.y = angle ;

    };



    function setState( stateName ) {

    	if ( state != stateName ) {

    		state = stateName ;

    		console.log( stateName );
    		// actions.run.play();

    	};

    };



    ///////////////////////////
    ///  ACTIONS SETTING
    ///////////////////////////


    function runSlow() {
    	setState( 'runningSlow' ); // could use inertia value to apply weight ?
    };


    function runFast() {
    	setState( 'runningFast' );
    };


    function idleClimb() {
    	setState( 'idleClimb' );
    };


    function idleGround() {
    	setState( 'idleGround' );
    };


    function climbUp() {
    	setState( 'climbUp' );
    };


    return {
        setCharaRot,
        group,
        runSlow,
        runFast,
        idleClimb,
        idleGround,
        climbUp
    };

};