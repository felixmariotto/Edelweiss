


function Interaction() {




	const domTalkContainer = document.getElementById('talk-container');
	var isInAnim = false ;

	const domTextContainer = document.getElementById( 'text-container' );

	const domAnswersContainer = document.getElementById('answers-container');

	const domCharName = document.getElementById('talker-name-container');

	const domChar = document.getElementById('char-container');
	const domCharImg = document.getElementById('char-img');

	const domOverlay = document.getElementById('overlay');

	const domMessage = document.getElementById('message-box');

	var currentDialogue ;
	var currentLine ;
	var lastDialogueDate = Date.now();

	const DIALOGUEBREAKTIME = 1000 ; // time in ms to wait between dialogues



	questionTree = {
		isQuestionAsked: false,
		currentChoice: 0,
		answers: []
	};



	function isInDialogue() {
		return currentDialogue ? true : false ;
	};





	///////////////////////////////
	///	   TRIGGERS  (BONUS, ETC..)
	///////////////////////////////



	function trigger( agentName ) {


		switch ( agentName ) {


			case 'bonus-stamina-1' :
				getBonus( 'stamina-1' );
				break;


			case 'info-cable-car' :

				if ( dialogueStates.minerBoy == 'init' ) {
					setTimeout( ()=> {
						startDialogue( 'cable-info-miner-boy' );
						dialogueStates.minerBoy = 'general' ;
					});
				};

				break;


			case 'cave-0' :

				gameState.switchMapGraph( 'cave-0' );

				break;


			case 'cave-1' :
				
				gameState.switchMapGraph( 'cave-1' );

				break;

		};

	};








	///////////////////////////
	///     INTERACTIONS
	///////////////////////////


	// Hold the current "state of relationship" with each NPC
	// ex : Did the player already talk to Dad about the key ?
	var dialogueStates = {

		dad: 'init',
		// waiting-thread
		// give-permission
		// general

		brother: 'init',

		herbalist: 'init',
		// waiting-sage

		merchant: 'init',
		// wait-key
		// give-thread
		// general

		miner: 'init',
		// give-key
		// general

		gatekeeper : 'init',
		// warning

		minerBoy : 'init',
		// general

		cable1 : 'init',
		// use

	};







	/*
	//// TODO

	respawn-0 => first respawn tile

	npc-jump
	npc-climb
	npc-stamina
	npc-climb-jump
	npc-run
	npc-fall

	npc-respawn-0

	*/


	function interactWith( agentName ) {

		switch ( agentName ) {

			/// TUTORIALS

			case 'npc-jump' :
				startDialogue( 'npc-jump' );
				break;

			case 'npc-climb' :
				startDialogue( 'npc-climb' );
				break;

			case 'npc-stamina' :
				startDialogue( 'npc-stamina' );
				break;

			case 'npc-climb-jump' :
				startDialogue( 'npc-climb-jump' );
				break;

			case 'npc-run' :
				startDialogue( 'npc-run' );
				break;

			case 'npc-fall' :
				startDialogue( 'npc-fall' );
				break;

			case 'npc-jump-slip' :
				startDialogue( 'npc-jump-slip' );
				break;

			case 'npc-wall-medium' :
				startDialogue( 'npc-wall-medium' );
				break;

				



			///// NPC RESPAWN

			case 'npc-respawn-0' :
				startDialogue( 'npc-respawn-0' );
				break;

			case 'npc-respawn-1' :
				startDialogue( 'npc-respawn-1' );
				break;

			case 'npc-respawn-2' :
				startDialogue( 'npc-respawn-2' );
				break;





			///// MISC

			case 'npc-miner' :
				startDialogue( 'npc-miner' );
				break;

		};

	};









	/////////////////////////////
	///    BONUSES MANAGEMENT
	/////////////////////////////


	var bonuses = {



		'stamina-1' : {

			isFound: false,

			onGet : function() {

				stamina.incrementMaxStamina();

				/*
				setTimeout( ()=> {
					startDialogue( 'herbalist-friend-init' );
				}, 1100 );
				*/
			},

			message : '+ 1 Stamina'
		}



	};






	function getBonus( bonusName ) {

		if ( !bonuses[ bonusName ].isFound ) {

			bonuses[ bonusName ].onGet();
			showMessage( bonuses[ bonusName ].message );
			bonuses[ bonusName ].isFound = true ;

		};

	};




	










	///////////////////////////
	///	   MESSAGES UI
	///////////////////////////


	function showMessage( message ) {

		domMessage.style.display = 'inherit';
		domMessage.innerHTML = message ;

		setTimeout( ()=> {

			if ( domMessage.style.display == 'inherit' ) {

				hideMessage();

			};

		}, 2000);

	};


	function hideMessage() {

		domMessage.style.display = 'none';

	};










	///////////////////////
	///    DIALOGUE UI
	///////////////////////




	// HIDE THE TALK UI
	function hideDialogueUI() {

		if ( isInAnim ) return

		isInAnim = true ;

		// Hide joystick div

		document.getElementById('joystick-container').style.display = 'inherit' ;

		// Dialogue UI animations

		domChar.classList.remove( 'show-char' );
		domChar.classList.add( 'hide-char' );

		// Hide the talk container after hiding the characters
		setTimeout( ()=> {

			domOverlay.style.display = 'none' ;

			domTalkContainer.classList.remove( 'show-talk' );
			domTalkContainer.classList.add( 'hide-talk' );

			domCharName.classList.remove( 'show-talker-name' );
			domCharName.classList.add( 'hide-talker-name' );

			isInAnim = false ;

		}, 300);

	};




	// SHOW THE TALK UI
	function showDialogueUI( dialogueName ) {

		let dialogueChar = dialogues[ dialogueName ].char ;

		if ( isInAnim ) return

		isInAnim = true ;

		// Hide joystick div

		document.getElementById('joystick-container').style.display = 'none' ;


		// Dialogue UI animations 

		domOverlay.style.display = 'inherit' ;

		domCharName.innerHTML = dialogueChar.name ;
		domCharImg.src = dialogueChar.url ;

		domTalkContainer.classList.remove( 'hide-talk' );
		domTalkContainer.classList.add( 'show-talk' );

		domCharName.classList.remove( 'hide-talker-name' );
		domCharName.classList.add( 'show-talker-name' );

		// show the characters after showing the talk container
		setTimeout( ()=> {

			domChar.classList.remove( 'hide-char' );
			domChar.classList.add( 'show-char' );

			isInAnim = false ;

		}, 200);

	};






	









	





	///////////////////////////
	///    DIALOGUE FUNCTIONS
	///////////////////////////



	// SHOW DIALOGUE UI
	function startDialogue( dialogueName ) {

		if ( lastDialogueDate < Date.now() - DIALOGUEBREAKTIME ) {

			showDialogueUI( dialogueName );

			currentDialogue = dialogueName ;
			currentLine = 0 ;

			executeDialogue();

		};

	};



	// HIDE DIALOGUE UI
	function endDialogue() {

		hideDialogueUI();

		domTextContainer.innerHTML = '';

		currentDialogue = undefined ;
		currentLine = undefined ;

		lastDialogueDate = Date.now();

	};




	// Called by the input module when user press space.
	// First it check if there was a question asked, then print
	// the next statement according to the answer choice.
	// If there was no question asked, it prints the next statement
	// or end the dialogue.
	function requestNextLine() {

		if ( questionTree.isQuestionAsked ) {

				printAnswerNext();

		} else {

			// Terminate the dialogue before to print a new line,
			// of the current line has the property .end = true
			if ( dialogues[ currentDialogue ].story[ currentLine ].end ) {

				endDialogue();
				return

			};

			// Skip the lines with label, which can only be shown as response
			// after the player's answer choice in the conversation
			while ( dialogues[ currentDialogue ].story[ currentLine + 1 ] &&
					dialogues[ currentDialogue ].story[ currentLine + 1 ].label ) {

				currentLine ++ ;

			};

			currentLine ++ ;

			// End the dialogue if there is no more line in the dialogue
			if ( currentLine >= dialogues[ currentDialogue ].story.length ) {

				endDialogue();
				return

			// Continue the dialogue normally
			} else {

				executeDialogue();

			};

		};

	};




	// print next statement OR question
	function executeDialogue() {

		if ( currentDialogue && currentLine != undefined ) {

			let line = dialogues[ currentDialogue ].story[ currentLine ] ;

			// If the requested line is a question, special
			// behavior is requered for the dialogue.
			if ( line.question ) {

				setupQuestion( line );

				domTextContainer.innerHTML = line.question ;

			} else {

				executeLine( line );

			};

		};

	};





	// Print the line's message and execute any onCall
	// function in the line's parameters
	function executeLine( line ) {

		domTextContainer.innerHTML = line.m ;

		if ( line.onCall ) {

			line.onCall();

		};

	};






	//////////////////
	///   ANSWERS
	//////////////////



	// This is called by the input module,
	// it set which answer is chosen by the player to
	// a given question.
	function chooseAnswer( keyString ) {

		if ( questionTree.isQuestionAsked ) {

			if ( keyString == 'left' ) {

				questionTree.currentChoice -- ;

				if ( questionTree.currentChoice < 0 ) {

					questionTree.currentChoice = 0 ;

				};

				setChosenAnswer();

			} else if ( keyString == 'right' ) {

				questionTree.currentChoice ++ ;

				if ( questionTree.currentChoice > questionTree.answers.length - 1 ) {

					questionTree.currentChoice = questionTree.answers.length - 1 ;

				};

				setChosenAnswer();

			};

		};

	};





	// Add blinking class to the dom element of the chosen
	// answer, so that the user knows which answer they are
	// about to choose.
	function setChosenAnswer() {

		if ( !input.params.isTouchScreen ) {

			// Clean all the answer of the blinking class
			for ( domAnswer of domAnswersContainer.children ) {
				domAnswer.classList.remove( 'selected-answer' );
			};

			// assign the blinking class to the answer newly chosen
			let newDomChoice = questionTree.answers[ questionTree.currentChoice ].dom ;
			newDomChoice.classList.add( 'selected-answer' );

		};

	};





	function printAnswerNext() {

		// Get the line with the label of the chosen answer
		let nextLine = dialogues[ currentDialogue ].story.find( ( line, i )=> {

			if ( line.label &&
				 line.label == questionTree.answers[ questionTree.currentChoice ].next ) {

				// Set current line to the line with the right label
				currentLine = i ;

				return true
			};

		});

		clearQuestion();

		if ( !nextLine ) {

			requestNextLine();

		} else {

			executeLine( nextLine );

		};
		
	};





	// Show the answer container in the dom dialogue UI.
	// Setup the question tree and create one dom element
	// per answer.
	function setupQuestion( line ) {

		/// SETUP QUESTION TREE

		questionTree.isQuestionAsked = true ;
		questionTree.currentChoice = 0 ;

		line.answers.forEach( ( answer )=> {

			questionTree.answers.push( answer );

		});

		/// SETUP DOM ELEMENTS

		domAnswersContainer.style.display = 'flex';

		line.answers.forEach( ( answer, i )=> {

			let div = document.createElement( 'DIV' );
			div.classList.add( 'answer' );
			div.innerHTML = answer.m ;

			domAnswersContainer.append( div );

			questionTree.answers[ i ].dom = div ;

			// Add event to select this answer with a touchscreen
			div.addEventListener( 'touchend', ()=> {

				questionTree.currentChoice = i ;

				setTimeout( ()=> {
					requestNextLine();
				}, 50 );

			});

		});

		setChosenAnswer();

	};




	// Clean and hide the dom answer container
	function clearQuestion() {

		questionTree.isQuestionAsked = false ;

		domAnswersContainer.style.display = 'none';

		for ( let i = domAnswersContainer.children.length ; i != 0 ; i-- ) {

			domAnswersContainer.children[ i - 1 ].remove();

		};

		questionTree.answers = [] ;

	};














	///////////////////////////////
	///		DIALOGUES CHARACTERS
	///////////////////////////////

	var dialogueChars = {

		// FAMILY

		dad : {
			name: 'Dad',
			url: 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/char-pictures/char-picture-dad.png'
		},

		brother : {
			name: 'Brother',
			url: 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/char-pictures/char-picture-brother.jpg'
		},

		// TRADE

		herbalist : {
			name: 'Herbalist',
			url: 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/char-pictures/char-picture-herbalist.jpg'
		},

		herbalistFriend : {
			name: "Herbalist's husband",
			url: 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/char-pictures/char-picture-herbalist-husband.jpg'
		},

		merchant : {
			name: 'Merchant',
			url: 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/char-pictures/char-picture-merchant.jpg'
		},

		miner : {
			name: 'Miner',
			url: 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/char-pictures/char-picture-miner.jpg'
		},

		minerBoy : {
			name: "Miner's son",
			url: 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/char-pictures/char-picture-miner-boy.jpg'
		},

		// VILLAGE - MISC

		gatekeeper : {
			name: "Gatekeeper",
			url: 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/char-pictures/char-picture-gatekeeper.jpg'
		},

		// CABLE- CAR

		lever : {
			name: "Cable-car station",
			url: 'https://edelweiss-game.s3.eu-west-3.amazonaws.com/char-pictures/char-picture-lever.jpg'
		},

	};















	///////////////////////////
	///    DIALOGUES TREES
	///////////////////////////



	var dialogues = {


		///// TUTORIALS


		'npc-jump' : {
			char: dialogueChars.dad,
			story: [
				{ m: `Press on ${ input.params.isTouchScreen ? 'the action button' : 'space' } to jump.` }
			]
		},


		'npc-climb' : {
			char: dialogueChars.dad,
			story: [
				{ m: `Some walls can be climbed, walk toward the wall on your right to climb it.` }
			]
		},


		'npc-stamina' : {
			char: dialogueChars.dad,
			story: [
				{ m: `You may be too weak to climb some walls... Try to find some edelweiss, they will increase your stamina and make you stronger !` },
				{ m: `Have a look in the mine.` }
			]
		},


		'npc-climb-jump' : {
			char: dialogueChars.dad,
			story: [
				{ m: `Did you know you can jump while climbing ? Just press ${ input.params.isTouchScreen ? 'the action button' : 'space' } while climbing.` }
			]
		},


		'npc-run' : {
			char: dialogueChars.dad,
			story: [
				{ m: `Hold ${ input.params.isTouchScreen ? 'the action button' : 'space' } while walking to run, you will then jump way farther.` }
			]
		},


		'npc-fall' : {
			char: dialogueChars.dad,
			story: [
				{ m: `This cliff looks very high... If we fell, we would probably die.` }
			]
		},

		'npc-jump-slip' : {
			char: dialogueChars.dad,
			story: [
				{ m: `You can also jump while slipping along a wall, it's super useful when there is nowhere to climb.` }
			]
		},

		'npc-wall-medium' : {
			char: dialogueChars.dad,
			story: [
				{ m: `Some rock walls can be climbed, like the one on your right.` },
				{ m: `However, climbing them takes more stamina than climbing roots and branches.` }
			]
		},







		////// NPC RESPAWN


		'npc-respawn-0' : {
			char: dialogueChars.dad,
			story: [
				{ question: 'Hi ! Do you want to save your progression ?', answers: [
					{ m: 'Yes', next: 'yes' },
					{ m: 'No', next: 'no' }
				] },
				{ label: 'yes', m: 'Your progression is saved, see you soon !', onCall: ()=> {
					gameState.setSavedPosition( 0 );
				}, end: true },
				{ label: 'no', m: 'Ho ? OK...', end: true  }
			]
		},


		'npc-respawn-1' : {
			char: dialogueChars.dad,
			story: [
				{ question: 'Hi ! Do you want to save your progression ?', answers: [
					{ m: 'Yes', next: 'yes' },
					{ m: 'No', next: 'no' }
				] },
				{ label: 'yes', m: 'Your progression is saved, see you soon !', onCall: ()=> {
					gameState.setSavedPosition( 1 );
				}, end: true },
				{ label: 'no', m: 'Ho ? OK...', end: true  }
			]
		},


		'npc-respawn-2' : {
			char: dialogueChars.dad,
			story: [
				{ question: 'Hi ! Do you want to save your progression ?', answers: [
					{ m: 'Yes', next: 'yes' },
					{ m: 'No', next: 'no' }
				] },
				{ label: 'yes', m: 'Your progression is saved, see you soon !', onCall: ()=> {
					gameState.setSavedPosition( 2 );
				}, end: true },
				{ label: 'no', m: 'Ho ? OK...', end: true  }
			]
		},






		///// MISC

		'npc-miner' : {
			char: dialogueChars.dad,
			story: [
				{ m: `Welcome to the mine !` },
				{ question: 'Did you come here before ?', answers: [
					{ m: 'Yes', next: 'yes' },
					{ m: 'No', next: 'no' }
				] },
				{ label: 'yes', m: 'Enjoy your time here then.', end: true },
				{ label: 'no', m: 'This mine is huge, it goes very far into the mountain.' },
				{ m: `I've never been too far though, and I doubt you will !` }
			]
		},
		





		///// EXAMPLE

		'init-merch' : {
			char: dialogueChars.dad,
			story: [
				{ m: 'What ?' },
				{ m: "Can't you leave me alone while I'm working ?" },
				{ question: 'Can you help me ?', answers: [
					{ m: 'Yes', next: 'help_yes' },
					{ m: 'No', next: 'help_no' }
				] },
				{ label: 'help_yes', m: 'Bring me an apple', onCall: ()=> {
					console.log( 'call onCall function' );
				} },
				{ label: 'help_no', m: 'I never liked you', end: true },
				{ m: 'Goodbye' }
			]
		}

	};




	



	








	return {
		interactWith,
		trigger,
		isInDialogue,
		showMessage,
		hideMessage,
		requestNextLine,
		chooseAnswer,
		questionTree
	};

};