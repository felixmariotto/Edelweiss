

function CharaAnim( player ) {


	var glider;

    const group = player.charaGroup ;


    // this variable stock the state waiting to be played
    // after ground hitting
    var waitingState ;

    var climbingActions; // this will be an array containing the climbing actions
    var currentClimbAction;

    // This is called when atlas finished loading all the assets.
    // It configures every action.
    function initActions() {

    	climbingActions = [
    		actions.climbUp,
    		actions.climbDown,
    		actions.climbLeft,
    		actions.climbRight,
    		actions.climbLeftUp,
    		actions.climbLeftDown,
    		actions.climbRightUp,
    		actions.climbRightDown
    	];

    	/// TIMESCALE

    	/*
	    actions.run.setEffectiveTimeScale( 3 );
	    actions.climbUp.setEffectiveTimeScale( 3 );
        actions.climbDown.setEffectiveTimeScale( 3 );
        actions.climbLeft.setEffectiveTimeScale( 3 );
        actions.climbRight.setEffectiveTimeScale( 3 );
        actions.hitGround.setEffectiveTimeScale( 3 );
        */

        actions.gliderAction.setEffectiveTimeScale( 1.5 );
        actions.haulDown.setEffectiveTimeScale( 2 );
        actions.haulUp.setEffectiveTimeScale( 2 );
        actions.pullUnder.setEffectiveTimeScale( 2 );
        actions.landOnWall.setEffectiveTimeScale( 1 );


        /// CLAMP WHEN FINISHED

        setLoopOnce( actions.gliderDeploy );

        setLoopOnce( actions.haulDown );
        setLoopOnce( actions.haulUp );
        setLoopOnce( actions.pullUnder );
        setLoopOnce( actions.landOnWall );

        setLoopOnce( actions.jumbRise );
		setLoopOnce( actions.hitGround );
		setLoopOnce( actions.die );

        setLoopOnce( actions.dashUp );
        setLoopOnce( actions.dashDown );
        setLoopOnce( actions.dashLeft );
        setLoopOnce( actions.dashRight );
        setLoopOnce( actions.dashDownLeft );
        setLoopOnce( actions.dashDownRight );

    };


    function setLoopOnce( action ) {
    	action.clampWhenFinished = true ;
    	action.loop = THREE.LoopOnce ;
    };





    // This object stores the weight factor of each
    // climbing animation. It is updated when the user moves
    // while climbing by the function setClimbBalance.
    var climbDirectionPowers = {
        up: 0,
        down: 0,
        left: 0,
        right: 0
    };


    var dashDirectionPowers = {
        up: 0,
        down: 0,
        left: 0,
        right: 0
    };


    var currentState = 'idleGround' ;
    /*

    idleGround
    idleClimb

    runningSlow

    climbing
    slipping
    landingOnWall
    
    gliding
    jumping
    falling
	hittingGround
	dying

    dashing
    chargingDash

    haulingDown
    haulingUp
    switchInward
    switchOutward
    pullingUnder

    */



    
    /*
    actionsToFadeIn and actionsToFadeOut store
    objects like this :
	{
	actionName,
	targetWeight,
	fadeSpeed (between 0 and 1)
	}
	This is used in the update function to tween the
	weight of actions
    */
    var actionsToFadeIn = [];
    var actionsToFadeOut = [];


    var moveSpeedRatio ;







    function update( delta ) {


        moveSpeedRatio = delta / ( 1 / 60 ) ;


    	// handle the hittingGround action, that make averything
    	// standby until it's played
    	if ( currentState == 'hittingGround' &&
    		 actions.hitGround.time > ( actions.hitGround._clip.duration * 0.7 ) ) {

    		if ( waitingState ) {
    			setState( waitingState );
    		};

    	};



    	if ( actionsToFadeIn.length > 0 ) {

    		actionsToFadeIn.forEach( (action)=> {

    			actions[ action.actionName ].setEffectiveWeight(
	    			actions[ action.actionName ].weight + ( action.fadeSpeed * moveSpeedRatio )
	    		);

	    		if ( actions[ action.actionName ].weight >=
	    			 action.targetWeight ) {

	    			actions[ action.actionName ].setEffectiveWeight( action.targetWeight );

	    			actionsToFadeIn.splice( actionsToFadeIn.indexOf( action ), 1 );
	    		
	    		};

    		});

    	};


    	if ( actionsToFadeOut.length > 0 ) {

    		actionsToFadeOut.forEach( (action)=> {

    			actions[ action.actionName ].setEffectiveWeight(
	    			actions[ action.actionName ].weight - ( action.fadeSpeed * moveSpeedRatio )
	    		);

	    		if ( actions[ action.actionName ].weight <= 0 ) {

	    			actions[ action.actionName ].setEffectiveWeight( 0 );

	    			actionsToFadeOut.splice( actionsToFadeOut.indexOf( action ), 1 );

	    		};

    		});

		};
		

    };




    function setFadeIn( actionName, targetWeight, fadeSpeed ) {

    	actionsToFadeIn.push({
			actionName,
			targetWeight,
			fadeSpeed
		});

    	// Delete the starting action from the fadeOut list,
    	// or it would fadein and fadeout at the same time.
		actionsToFadeOut.forEach( (action, i)=> {

			if ( action.actionName == actionName ) {
				actionsToFadeOut.splice( i, 1 );
			};

		});

    };



    function setFadeOut( actionName, fadeSpeed ) {

    	actionsToFadeOut.push({
			actionName,
			fadeSpeed
		});

		// Delete the starting action from the fadeIn list,
    	// or it would fadein and fadeout at the same time.
		actionsToFadeIn.forEach( (action, i)=> {

			if ( action.actionName == actionName ) {
				actionsToFadeIn.splice( i, 1 );
			};

		});

    };






    function setCharaRot( angle ) {

        player.charaGroup.rotation.y = angle ;

    };







    function setState( newState ) {


    	if ( currentState == 'hittingGround' &&
    		 actions.hitGround.time <= ( actions.hitGround._clip.duration * 0.7 ) ) {

    		waitingState = newState ;

    		return
		};
		

		if ( currentState == "dying" ) {
			return
		};


    	if ( currentState != newState ) {


    		// FADE IN
    		switch ( newState ) {

    			case 'running' :
    				setFadeIn( 'run', 1, 0.1 );
    				break;

    			case 'idleGround' :
    				actions.idle.reset();
    				setFadeIn( 'idle', 1, 0.1 );
    				break;

    			case 'idleClimb' :
    				actions.climbIdle.reset();
    				setFadeIn( 'climbIdle', 1, 0.1 );
    				break;

    			case 'jumping' :
    				setFadeIn( 'jumbRise', 1, 0.1 );
    				break;

    			case 'haulingDown' :
    				actions.haulDown.reset();
    				setFadeIn( 'haulDown', 1, 0.1 );
    				break;

    			case 'haulingUp' :
    				actions.haulUp.reset();
    				setFadeIn( 'haulUp', 1, 0.1 );
    				break;

    			case 'pullingUnder' :
    				actions.pullUnder.reset();
    				setFadeIn( 'pullUnder', 1, 0.1 );
    				break;

    			case 'falling' :
    				setFadeIn( 'fall', 1, 0.1 );
					break;
					
				case 'dying' :
					setFadeIn( 'die', 1, 1 );
					break;

    			case 'slipping' :
    				setFadeIn( 'slip', 1, 0.1 );
    				break;

    			case 'gliding' :
    				glider.visible = true ;
    				actions.gliderDeploy.reset();
    				actions.gliderAction.setEffectiveWeight( 0 );
    				setFadeIn( 'gliderDeploy', 1, 1 );
    				setFadeIn( 'gliderAction', 1, 0.1 );
    				setFadeIn( 'glide', 1, 0.2 );
    				break;

    			case 'chargingDash' :
    				setFadeIn( 'chargeDash', 1, 0.1 );
    				break;

    			case 'switchingInward' :
    				setFadeIn( 'switchDirection', 1, 0.1 );
    				break;

    			case 'switchingOutward' :
    				setFadeIn( 'switchDirection', 1, 0.1 );
    				break;

    			case 'hittingGround' :
    				actions.hitGround.reset();
    				setFadeIn( 'hitGround', 1, 0.1 );
    				break;

    		};




    		// FADE OUT
    		switch ( currentState ) {

    			case 'idleGround' :
    				setFadeOut( 'idle', 0.1 );
    				break;

    			case 'idleClimb' :
    				setFadeOut( 'climbIdle', 0.1 );
    				break;

    			case 'running' :
    				setFadeOut( 'run', 0.1 );
    				break;

    			case 'jumping' :
    				setFadeOut(
    					'jumbRise',
    					newState == 'landingOnWall' ? 0.5 : 0.1
    				);
    				break;

    			case 'haulingDown' :
    				setFadeOut( 'haulDown', 0.1 );
    				break;

    			case 'haulingUp' :
    				setFadeOut( 'haulUp', 0.1 );
    				break;

    			case 'pullingUnder' :
    				setFadeOut( 'pullUnder', 0.1 );
    				break;

    			case 'slipping' :
    				setFadeOut( 'slip', 0.1 );
					break;
					
				case 'dying' :
					setFadeOut( 'die', 1 );
					break;

    			case 'falling' :
    				setFadeOut(
    					'fall',
    					newState == 'landingOnWall' ? 0.5 : 0.1
    				);
    				break;

    			case 'switchingInward' :
    				setFadeOut( 'switchDirection', 0.1 );
    				break;

    			case 'switchingOutward' :
    				setFadeOut( 'switchDirection', 0.1 );
    				break;

    			case 'gliding' :
    				glider.visible = false ;
    				setFadeOut(
    					'glide',
    					newState == 'landingOnWall' ? 0.5 : 0.1
    				);
    				break;

    			case 'chargingDash' :
    				setFadeOut( 'chargeDash', 0.1 );
    				break;

    			case 'climbing' :
    				setFadeOut( 'climbUp', 0.1 );
    				setFadeOut( 'climbDown', 0.1 );
    				setFadeOut( 'climbLeft', 0.1 );
					setFadeOut( 'climbRight', 0.1 );
					setFadeOut( 'climbLeftUp', 0.1 );
					setFadeOut( 'climbRightUp', 0.1 );
					setFadeOut( 'climbLeftDown', 0.1 );
    				setFadeOut( 'climbRightDown', 0.1 );
    				currentClimbAction = undefined ;
    				break;

    			case 'dashing' :
    				setFadeOut( 'dashUp', 0.1 );
    				setFadeOut( 'dashDown', 0.1 );
    				setFadeOut( 'dashLeft', 0.1 );
    				setFadeOut( 'dashRight', 0.1 );
    				setFadeOut( 'dashDownLeft', 0.1 );
    				setFadeOut( 'dashDownRight', 0.1 );
    				break;

    			case 'hittingGround' :
    				setFadeOut( 'hitGround', 0.1 );
    				break;

    		};



    		currentState = newState ;

    	};

    };




    // This function combute the direction, to call a passed
    // value attribution funcion with the right arguments.
    function callWithDirection( fn, faceDirection ) {


    	switch ( faceDirection ) {

            case 'up' :
                fn( 'up', Math.PI );
                fn( 'down', 0 );
                fn( 'left', -Math.PI / 2 );
                fn( 'right', Math.PI / 2 );
                break;

            case 'down' :
                fn( 'up', Math.PI );
                fn( 'down', 0 );
                fn( 'left', Math.PI / 2 );
                fn( 'right', -Math.PI / 2 );
                break;

            case 'left' : 
                fn( 'up', -Math.PI / 2 );
                fn( 'down', Math.PI / 2 );
                fn( 'left', 0 );
                fn( 'right', Math.PI );
                break;

            case 'right' :
                fn( 'up', Math.PI / 2 );
                fn( 'down', -Math.PI / 2 );
                fn( 'left', Math.PI );
                fn( 'right', 0 );
                break;

        };

    };






    // Here we need to compute the climbing direction from the
    // arguments, to balance climbing-up, climbing-right etc..
    function setClimbBalance( faceDirection, moveDirection, speed ) {


        if ( currentState == 'climbing' ) {

        	callWithDirection( setClimbDirection, faceDirection );

			climbingActions.forEach( (action)=> {
				action.setEffectiveTimeScale( speed + 0.7 );
			});

			actions.climbUp.setEffectiveTimeScale( speed + 0.18 );
			actions.climbDown.setEffectiveTimeScale( speed + 0.18 );


			function switchClimbAction( newAction ) {

				if ( newAction != currentClimbAction ) {

					if ( currentClimbAction ) {

						setFadeOut( currentClimbAction._clip.name, 0.1 );

					};

					setFadeIn( newAction._clip.name, 1, 0.1 );

					currentClimbAction = newAction ;

				};

			};


			if ( climbDirectionPowers.up > 0.65 ) {

				switchClimbAction( actions.climbUp );

			} else if ( climbDirectionPowers.down > 0.65 ) {

				switchClimbAction( actions.climbDown );

			} else if ( climbDirectionPowers.left > 0.65 ) {

				switchClimbAction( actions.climbLeft );

			} else if ( climbDirectionPowers.right > 0.65 ) {

				switchClimbAction( actions.climbRight );

			} else if ( climbDirectionPowers.up > 0 ) {

				if ( climbDirectionPowers.right > 0 ) {

					switchClimbAction( actions.climbRightUp );

				} else {

					switchClimbAction( actions.climbLeftUp );

				};

			} else {

				if ( climbDirectionPowers.right > 0 ) {

					switchClimbAction( actions.climbRightDown );

				} else {

					switchClimbAction( actions.climbLeftDown );

				};

			};


        };


        // Attribute a value between 0 and 1 to a climbing animation according
        // to the difference between the requested angle and the target angle
        // that would make this action 100% played
        function setClimbDirection( directionName, target ) {

            climbDirectionPowers[ directionName ] = Math.max(
                    ( 1 -
                    ( Math.abs( utils.minDiffRadians( target, moveDirection ) ) /
                    (Math.PI / 2) )
                    )
            , 0 );

        };

    };





    function setDashBalance( faceDirection, moveDirection ) {

    	if ( currentState != 'dashing' ) {

        	callWithDirection( setDashDirection, faceDirection );

        	// This part plays the set of upper dash animations
        	if ( dashDirectionPowers.up >= 0 ) {

        		actions.dashUp.reset();
		        actions.dashLeft.reset();
		        actions.dashRight.reset();

        		actions.dashUp.setEffectiveWeight( dashDirectionPowers.up );
		        actions.dashLeft.setEffectiveWeight( dashDirectionPowers.left );
		        actions.dashRight.setEffectiveWeight( dashDirectionPowers.right );

        	// This part plays the bottom dash animations
        	} else {

        		actions.dashUp.reset();
		        actions.dashDownLeft.reset();
		        actions.dashDownRight.reset();

        		actions.dashUp.setEffectiveWeight( dashDirectionPowers.up );
		        actions.dashDownLeft.setEffectiveWeight( dashDirectionPowers.left );
		        actions.dashDownRight.setEffectiveWeight( dashDirectionPowers.right );

        	};

        	

        };


        function setDashDirection( directionName, target ) {

        	dashDirectionPowers[ directionName ] = Math.max(
                    ( 1 -
                    ( Math.abs( utils.minDiffRadians( target, moveDirection ) ) /
                    (Math.PI / 2) )
                    )
            , 0 );

        };

    };








    function setGlider( gliderMesh ) {
    	glider = gliderMesh ;
    	glider.visible = false ;
    };



    ///////////////////////////
    ///  ACTIONS SETTING
    ///////////////////////////


    
    function climb( faceDirection, moveDirection, speed ) {
    	setState( 'climbing' );
        setClimbBalance( faceDirection, moveDirection, speed );
    };


    function dash( faceDirection, moveDirection ) {
        setDashBalance( faceDirection, moveDirection );
        // We set the dashing state after, because we want
        // the dash balance to be set only when the dashing
        // animation is not played
        setState( 'dashing' );
    };


    function runSlow() {
    	actions.run.setEffectiveTimeScale( 1 );
    	setState( 'running' );
    };


    function runFast() {
    	actions.run.setEffectiveTimeScale( 1.5 );
    	setState( 'running' );
    };


    function idleClimb() {
    	setState( 'idleClimb' );
    };


    function idleGround() {
    	setState( 'idleGround' );
    };


    function glide() {
        setState('gliding');
    };


    function chargeDash() {
        setState('chargingDash');
    };


    function jump() {
        setState('jumping');
    };


    function fall() {
        setState('falling');
    };


    function slip() {
        setState('slipping');
    };


    function haulDown() {
        setState('haulingDown');
    };


    function haulUp() {
        setState('haulingUp');
    };


    function switchOutward() {
        setState('switchingOutward');
    };


    function switchInward() {
        setState('switchingInward');
    };


    function pullUnder() {
        setState('pullingUnder');
    };



    function hitGround( power ) {
    	
    	if ( power > 0.2 && power < 1 ) {
			groundHit = false ;
			
			setState('hittingGround');
			
    	} else if ( power == 1 ) {

			setState('dying');
			
    	};

    };


    


    return {
    	setGlider,
    	initActions,
    	update,
        setCharaRot,
        group,
        hitGround,
        runSlow,
        runFast,
        idleClimb,
        climb,
        idleGround,
        glide,
        dash,
        chargeDash,
        jump,
        fall,
        slip,
        haulDown,
        haulUp,
        switchOutward,
        switchInward,
        pullUnder
    };

};