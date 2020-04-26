
function Interaction() {

	const domTalkContainer = document.getElementById('talk-container');
	var isInAnim = false ;

	const domTextContainer = document.getElementById( 'text-container' );

	const domAnswersContainer = document.getElementById('answers-container');

	const domCharName = document.getElementById('talker-name-container');

	const domChar = document.getElementById('char-container');
	const domCharImgCont = document.getElementById('char-img-cont');

	const domOverlay = document.getElementById('overlay');

	const domMessage = document.getElementById('message-box');

	var currentDialogue ;
	var currentLine ;
	var lastDialogueDate = Date.now();

	var hasTalkedToDev = false ;

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

			/// STAMINA

			// cave
			case 'bonus-stamina-1' :
				getBonus( 'stamina-1' );
				break;

			// cow field
			case 'bonus-stamina-0' :
				getBonus( 'stamina-0' );
				break;

			// start forest
			case 'bonus-stamina-2' :
				getBonus( 'stamina-2' );
				break;

			// forest heart
			case 'bonus-stamina-3' :
				getBonus( 'stamina-3' );
				break;

			// ridge left
			case 'bonus-stamina-4' :
				getBonus( 'stamina-4' );
				break;

			// canyon
			case 'bonus-stamina-5' :
				getBonus( 'stamina-5' );
				break;

			// peak
			case 'bonus-stamina-6' :
				getBonus( 'stamina-6' );
				break;


			/// FALL

			case 'bonus-fall-0' :
				getBonus( 'fall-0' );
				break;

			// before waterfall in forest
			case 'bonus-fall-1' :
				getBonus( 'fall-1' );
				break;

			// middle of canyon
			case 'bonus-fall-2' :
				getBonus( 'fall-2' );
				break;


			/// CLIMB

			case 'bonus-climb-0' :
				getBonus( 'climb-0' );
				break;

			case 'bonus-climb-1' :
				getBonus( 'climb-1' );
				break;

			case 'bonus-climb-2' :
				getBonus( 'climb-2' );
				break;

			
			/// ITEMS

			case 'bonus-dash' :
				getBonus( 'bonus-dash' );
				break;

			case 'bonus-glider' :
				getBonus( 'bonus-glider' );
				break;

			case 'bonus-boots' :
				getBonus( 'bonus-boots' );
				break;


			/// CAVES

			// village
			case 'cave-0' :
				gameState.switchMapGraph( 'cave-0' );
				break;

			// cow field
			case 'cave-1' :
				gameState.switchMapGraph( 'cave-1' );
				break;

			// gauntlet
			case 'cave-2' :
				gameState.switchMapGraph( 'cave-2' );
				break;

			// forest
			case 'cave-3' :
				gameState.switchMapGraph( 'cave-3' );
				break;

			// end forest
			case 'cave-4' :
				gameState.switchMapGraph( 'cave-4' );
				break;

			// checkpoint bottom cliff
			case 'cave-5' :
				gameState.switchMapGraph( 'cave-5' );
				break;

			// behind pillar in the cliff
			case 'cave-6' :
				gameState.switchMapGraph( 'cave-6' );
				break;

			// middle of the cliff bottom
			case 'cave-7' :
				gameState.switchMapGraph( 'cave-7' );
				break;

			// middle of the cliff top (lead to other side)
			case 'cave-8' :
				gameState.switchMapGraph( 'cave-8' );
				break;

			// other side cliff
			case 'cave-9' :
				gameState.switchMapGraph( 'cave-9' );
				break;

			// checkpoint peak
			case 'cave-10' :
				gameState.switchMapGraph( 'cave-10' );
				break;

			// dev home
			case 'cave-11' :
				gameState.switchMapGraph( 'cave-11' );
				break;


			///// MISC

			case 'water' :
                gameState.die();
				break;

		};

	};

	////////////////////
	///  INTERACTIONS
	////////////////////

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

			case 'npc-fall' :
				startDialogue( 'npc-fall' );
				break;

			case 'npc-jump-slip' :
				startDialogue( 'npc-jump-slip' );
				break;

			case 'npc-wall-medium' :
				startDialogue( 'npc-wall-medium' );
				break;

			case 'npc-dash' :
				startDialogue( 'npc-dash' );
				break;

			case 'npc-glide' :
				startDialogue( 'npc-glide' );
				break;

			case 'npc-wall-hard' :
				startDialogue( 'npc-wall-hard' );
				break;

			case 'npc-double-jump' :
				startDialogue( 'npc-double-jump' );
				break;

			///// NPC RESPAWN

			case 'npc-respawn-0' :
				startDialogue( 'npc-respawn-0' );
				break;

			case 'npc-respawn-1' :
				startDialogue( 'npc-respawn-1' );
				break;

			// gauntlet
			case 'npc-respawn-2' :
				startDialogue( 'npc-respawn-2' );
				break;

			// river down
			case 'npc-respawn-3' :
				startDialogue( 'npc-respawn-3' );
				break;

			// river middle
			case 'npc-respawn-4' :
				startDialogue( 'npc-respawn-4' );
				break;

			// river top
			case 'npc-respawn-5' :
				startDialogue( 'npc-respawn-5' );
				break;

			// canyon top
			case 'npc-respawn-6' :
				startDialogue( 'npc-respawn-6' );
				break;

			// ridge
			case 'npc-respawn-7' :
				startDialogue( 'npc-respawn-7' );
				break;

			// peak middle
			case 'npc-respawn-8' :
				startDialogue( 'npc-respawn-8' );
				break;

			// peak top
			case 'npc-respawn-9' :
				startDialogue( 'npc-respawn-9' );
				break;

			///// MISC

			case 'npc-dev' :

				if ( !hasTalkedToDev ) {

					hasTalkedToDev = true ;

					if ( stamina.params.stamina == 9 ) {

						startDialogue( 'dev-greeting-finish' );

					} else {

						startDialogue( 'dev-greeting' );

					};

				} else {

					if ( stamina.params.stamina == 9 ) {

						startDialogue( 'dev-main-finish' );

					} else {

						startDialogue( 'dev-main' );

					};

				};

				break;

			case 'npc-dev-end' :
				startDialogue( 'dev-end' );
				break;


			case 'npc-river' :
				startDialogue( 'npc-river' );
				break;

		};

	};

	/////////////////////////////
	///    BONUSES MANAGEMENT
	/////////////////////////////

	var bonuses = {

		/// STAMINA

		// grotte
		'stamina-1' : {

			isFound: false,

			onGet : function() {

				stamina.incrementMaxStamina();

				assetManager.deleteBonus( 'bonus-stamina-1' );

			},

			message : '+ 1 Stamina'
		},

		'stamina-0' : {

			isFound: false,

			onGet : function() {

				stamina.incrementMaxStamina();

				assetManager.deleteBonus( 'bonus-stamina-0' );

			},

			message : '+ 1 Stamina'
		},

		'stamina-2' : {

			isFound: false,

			onGet : function() {

				stamina.incrementMaxStamina();

				assetManager.deleteBonus( 'bonus-stamina-2' );

			},

			message : '+ 1 Stamina'
		},

		'stamina-3' : {

			isFound: false,

			onGet : function() {

				stamina.incrementMaxStamina();

				assetManager.deleteBonus( 'bonus-stamina-3' );

			},

			message : '+ 1 Stamina'
		},

		'stamina-4' : {

			isFound: false,

			onGet : function() {

				stamina.incrementMaxStamina();

				assetManager.deleteBonus( 'bonus-stamina-4' );

			},

			message : '+ 1 Stamina'
		},

		'stamina-5' : {

			isFound: false,

			onGet : function() {

				stamina.incrementMaxStamina();

				assetManager.deleteBonus( 'bonus-stamina-5' );

			},

			message : '+ 1 Stamina'
		},

		'stamina-6' : {

			isFound: false,

			onGet : function() {

				stamina.incrementMaxStamina();

				assetManager.deleteBonus( 'bonus-stamina-6' );

			},

			message : '+ 1 Stamina'
		},

		////// FALL BONUS (increase speed to death)

		'fall-0' : {

			isFound: false,

			onGet : function() {

				controler.upgradeSpeedDeath();

				assetManager.deleteBonus( 'bonus-fall-0' );

			},

			message : '+ 15% resistance to fall'
		},

		'fall-1' : {

			isFound: false,

			onGet : function() {

				controler.upgradeSpeedDeath();

				assetManager.deleteBonus( 'bonus-fall-1' );

			},

			message : '+ 15% resistance to fall'
		},

		'fall-2' : {

			isFound: false,

			onGet : function() {

				controler.upgradeSpeedDeath();

				assetManager.deleteBonus( 'bonus-fall-2' );

			},

			message : '+ 15% resistance to fall'
		},

		////// CLIMB BONUS (climb faster)

		'climb-0' : {

			isFound: false,

			onGet : function() {

				controler.upgradeAcceleration();

				assetManager.deleteBonus( 'bonus-climb-0' );
				
			},

			message : '+ 15% climbing speed'
		},

		'climb-1' : {

			isFound: false,

			onGet : function() {

				controler.upgradeAcceleration();

				assetManager.deleteBonus( 'bonus-climb-1' );
				
			},

			message : '+ 15% climbing speed'
		},

		'climb-2' : {

			isFound: false,

			onGet : function() {

				controler.upgradeAcceleration();

				assetManager.deleteBonus( 'bonus-climb-2' );
				
			},

			message : '+ 15% climbing speed'
		},

		/////// ITEMS

		'bonus-dash' : {

			isFound: false,

			onGet : function() {

				controler.permission.dash = true ;

				assetManager.deleteBonus( 'bonus-dash' );

			},

			message : 'You found the Dash Ability ! <br>You can now dash while climbing !'

		},

		'bonus-glider' : {

			isFound: false,

			onGet : function() {

				controler.permission.gliding = true ;

				assetManager.deleteBonus( 'bonus-glider' );

			},

			message : 'You found the Gliding Ability ! <br>You can now glide in the air !'

		},

		'bonus-boots' : {

			isFound: false,

			onGet : function() {

				controler.permission.infinityJump = true ;

				assetManager.deleteBonus( 'bonus-boots' );

			},

			message : 'You found the Double-Jump Ability ! <br>You can now jump once in the air !'

		}

	};

	//

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

	//

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
		if ( input.params.isTouchScreen ) {
			document.getElementById('action-button').style.display = 'inherit' ;
		};

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

	// SHOW THE DISCUSSION UI
	function showDialogueUI( dialogueName ) {

		let dialogueChar = dialogues[ dialogueName ].char ;

		if ( isInAnim ) return

		isInAnim = true ;

		// Hide joystick div

		document.getElementById('joystick-container').style.display = 'none' ;
		document.getElementById('action-button').style.display = 'none' ;


		//// Dialogue UI animations 

		// hide all character pictures, then show the talking character picture
		document.getElementById( "img-camper" ).style.display = "none" ;
		document.getElementById( "img-lady" ).style.display = "none" ;
		document.getElementById( "img-dev" ).style.display = "none" ;
		document.getElementById( dialogueChar.domID ).style.display = "inherit" ;

		domOverlay.style.display = 'inherit' ;

		domCharName.innerHTML = dialogueChar.name ;

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

		if ( lastDialogueDate < Date.now() - DIALOGUEBREAKTIME &&
			 !isInDialogue() ) {

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

		if ( isInAnim ) return

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

	//

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

	////////////////////////////
	///  DIALOGUES CHARACTERS
	////////////////////////////

	var dialogueChars = {

		alpinist : {
			name: 'Camper',
			domID: 'img-camper'
		},

		lady : {
			name: 'Old Granny',
			domID: 'img-lady'
		},

		dev : {
			name: 'dev Felix Mariotto',
			domID: 'img-dev'
		}

	};

	///////////////////////////
	///    DIALOGUES TREES
	///////////////////////////

	var dialogues = {

		///// TUTORIALS

		'npc-jump' : {
			char: dialogueChars.lady,
			story: [
				{ m: `Press on space or the action button to jump.` }
			]
		},

		'npc-climb' : {
			char: dialogueChars.lady,
			story: [
				{ m: `Some walls can be climbed, walk toward the wall on your right to climb it.` }
			]
		},

		'npc-stamina' : {
			char: dialogueChars.lady,
			story: [
				{ m: `You may be too weak to climb some walls... Try to find some edelweiss, they will increase your stamina and make you stronger !` },
				{ m: `Have a look into the mine.` }
			]
		},

		'npc-climb-jump' : {
			char: dialogueChars.lady,
			story: [
				{ m: `Did you know you can jump while climbing ? Just press space or the action button while climbing.` }
			]
		},

		'npc-fall' : {
			char: dialogueChars.lady,
			story: [
				{ m: `This cliff looks very high... If we fell, we would probably die.` }
			]
		},

		'npc-jump-slip' : {
			char: dialogueChars.lady,
			story: [
				{ m: `You can also jump while slipping along a wall, it's super useful when there is nowhere to climb.` }
			]
		},

		'npc-dash' : {
			char: dialogueChars.lady,
			story: [
				{ m: `Did you find the Dash Ability ?` },
				{ m: `You can dash on a wall by holding space or the action button while climbing.` },
				{ m: `When you gathered enough energy, point in the direction you want to dash, then release space or the action button.` },
			]
		},

		'npc-wall-medium' : {
			char: dialogueChars.lady,
			story: [
				{ m: `Some rock walls can be climbed, like the one on your left.` },
				{ m: `However, climbing them takes more stamina than climbing roots and branches.` },
				{ m: `If you don't have enough stamina, consider going back to find another edelweiss, to have at least 4 stamina bars.` }
			]
		},

		'npc-glide' : {
			char: dialogueChars.lady,
			story: [
				{ m: `Do you have a the Gliding Ability ?` },
				{ m: `You can glide in the air by holding space or the action button while in the air, after a jump for instance.` },
			]
		},

		'npc-double-jump' : {
			char: dialogueChars.lady,
			story: [
				{ m: `Do you have the Double-Jump ability ?` },
				{ m: `With it you can jump in the air once, by pressing space or the action button while in the air.` },
			]
		},

		'npc-wall-hard' : {
			char: dialogueChars.lady,
			story: [
				{ m: `This wall of ice can be climbed.` },
				{ m: `However, climbing it takes a lot of stamina.` },
				{ m: `If you don't have enough stamina, consider going back to find an edelweiss.` }
			]
		},

		////// NPC RESPAWN

		'npc-respawn-0' : {
			char: dialogueChars.alpinist,
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
			char: dialogueChars.alpinist,
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
			char: dialogueChars.alpinist,
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

		'npc-respawn-3' : {
			char: dialogueChars.alpinist,
			story: [
				{ question: 'Hi ! Do you want to save your progression ?', answers: [
					{ m: 'Yes', next: 'yes' },
					{ m: 'No', next: 'no' }
				] },
				{ label: 'yes', m: 'Your progression is saved, see you soon !', onCall: ()=> {
					gameState.setSavedPosition( 3 );
				}, end: true },
				{ label: 'no', m: 'Ho ? OK...', end: true  }
			]
		},

		'npc-respawn-4' : {
			char: dialogueChars.alpinist,
			story: [
				{ question: 'Hi ! Do you want to save your progression ?', answers: [
					{ m: 'Yes', next: 'yes' },
					{ m: 'No', next: 'no' }
				] },
				{ label: 'yes', m: 'Your progression is saved, see you soon !', onCall: ()=> {
					gameState.setSavedPosition( 4 );
				}, end: true },
				{ label: 'no', m: 'Ho ? OK...', end: true  }
			]
		},

		'npc-respawn-5' : {
			char: dialogueChars.alpinist,
			story: [
				{ question: 'Hi ! Do you want to save your progression ?', answers: [
					{ m: 'Yes', next: 'yes' },
					{ m: 'No', next: 'no' }
				] },
				{ label: 'yes', m: 'Your progression is saved, see you soon !', onCall: ()=> {
					gameState.setSavedPosition( 5 );
				}, end: true },
				{ label: 'no', m: 'Ho ? OK...', end: true  }
			]
		},

		'npc-respawn-6' : {
			char: dialogueChars.alpinist,
			story: [
				{ question: 'Hi ! Do you want to save your progression ?', answers: [
					{ m: 'Yes', next: 'yes' },
					{ m: 'No', next: 'no' }
				] },
				{ label: 'yes', m: 'Your progression is saved, see you soon !', onCall: ()=> {
					gameState.setSavedPosition( 6 );
				}, end: true },
				{ label: 'no', m: 'Ho ? OK...', end: true  }
			]
		},

		'npc-respawn-7' : {
			char: dialogueChars.alpinist,
			story: [
				{ question: 'Hi ! Do you want to save your progression ?', answers: [
					{ m: 'Yes', next: 'yes' },
					{ m: 'No', next: 'no' }
				] },
				{ label: 'yes', m: 'Your progression is saved, see you soon !', onCall: ()=> {
					gameState.setSavedPosition( 7 );
				}, end: true },
				{ label: 'no', m: 'Ho ? OK...', end: true  }
			]
		},

		'npc-respawn-8' : {
			char: dialogueChars.alpinist,
			story: [
				{ question: 'Hi ! Do you want to save your progression ?', answers: [
					{ m: 'Yes', next: 'yes' },
					{ m: 'No', next: 'no' }
				] },
				{ label: 'yes', m: 'Your progression is saved, see you soon !', onCall: ()=> {
					gameState.setSavedPosition( 8 );
				}, end: true },
				{ label: 'no', m: 'Ho ? OK...', end: true  }
			]
		},

		'npc-respawn-9' : {
			char: dialogueChars.alpinist,
			story: [
				{ question: 'Hi ! Do you want to save your progression ?', answers: [
					{ m: 'Yes', next: 'yes' },
					{ m: 'No', next: 'no' }
				] },
				{ label: 'yes', m: 'Your progression is saved, see you soon !', onCall: ()=> {
					gameState.setSavedPosition( 9 );
				}, end: true },
				{ label: 'no', m: 'Ho ? OK...', end: true  }
			]
		},

		///// MISC

		'dev-greeting' : {
			char: dialogueChars.dev,
			story: [
				{ m: 'Ho ! A player !' },
				{ m: 'Congratulations, you reached the top of the mountain !' },
				{ m: `Let me check your stamina... It seems that you still have some edelweiss yet to find.` },
				{ question: 'Do you want to save your progression ?', answers: [
					{ m: 'Yes', next: 'yes' },
					{ m: 'No', next: 'no' }
				] },
				{ label: 'yes', m: 'Your progression is saved, see you soon !', onCall: ()=> {
					gameState.setSavedPosition( 10 );
				}, end: true },
				{ label: 'no', m: 'Ho ? OK...', end: true  }
			]
		},

		'dev-greeting-finish' : {
			char: dialogueChars.dev,
			story: [
				{ m: 'Ho ! A player !' },
				{ m: 'Congratulations, you reached the top of the mountain !' },
				{ m: `Let me check your stamina... Waw ! You found all the edelweiss !` },
				{ m: "As it looks like you appreciate my games, be sure to stay tuned for the next release on <a target='_blank' href='https://twitter.com/felix_mariotto'>https://twitter.com/felix_mariotto</a>" },
				{ question: `Do you want to save your progression ?`, answers: [
					{ m: 'Yes', next: 'yes' },
					{ m: 'No', next: 'no' }
				] },
				{ label: 'yes', m: 'Your progression is saved, see you soon !', onCall: ()=> {
					gameState.setSavedPosition( 10 );
				}, end: true },
				{ label: 'no', m: 'Ho ? OK...', end: true  }
			]
		},

		'dev-main' : {
			char: dialogueChars.dev,
			story: [
				{ m: "Thank you for you commitment in the game, that's encouraging for me." },
				{ m: `Let me check your stamina... It seems that you still have some edelweiss yet to find.` },
				{ question: 'Do you want to save your progression ?', answers: [
					{ m: 'Yes', next: 'yes' },
					{ m: 'No', next: 'no' }
				] },
				{ label: 'yes', m: 'Your progression is saved, see you soon !', onCall: ()=> {
					gameState.setSavedPosition( 10 );
				}, end: true },
				{ label: 'no', m: 'Ho ? OK...', end: true  }
			]
		},

		'dev-main-finish' : {
			char: dialogueChars.dev,
			story: [
				{ m: "Thank you for you commitment in the game, that's encouraging for me." },
				{ m: `Let me check your stamina... Well, you found all the edelweiss !` },
				{ m: "As it looks like you appreciate my games, be sure to stay tuned for the next release on <a target='_blank' href='https://twitter.com/felix_mariotto'>https://twitter.com/felix_mariotto</a>" },
				{ question: 'Do you want to save your progression ?', answers: [
					{ m: 'Yes', next: 'yes' },
					{ m: 'No', next: 'no' }
				] },
				{ label: 'yes', m: 'Your progression is saved, see you soon !', onCall: ()=> {
					gameState.setSavedPosition( 10 );
				}, end: true },
				{ label: 'no', m: 'Ho ? OK...', end: true  }
			]
		},

		'npc-river' : {
			char: dialogueChars.lady,
			story: [
				{ m: "Are you wondering how to get down this cliff ?" },
				{ m: "You just have to climb down the roots just in front of me." },
				{ m: "I did that a lot, back in the days..." }
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

	//

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
