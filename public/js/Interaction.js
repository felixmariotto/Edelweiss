


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






	function interactWith( agentName ) {

		switch ( agentName ) {




			/// FAMILY

			case 'char-dad' :

				switch ( dialogueStates.dad ) {

					case 'init' :
						startDialogue( 'init-dad' );
						break ;

					case 'waiting-thread' :
						startDialogue( 'dad-wait-thread' );
						break ;

					case 'give-permission' :
						startDialogue( 'dad-give-permission' );
						break ;

					case 'general' :
						startDialogue( 'dad-general' );
						break ;

				};

				break;


			case 'char-brother' :
				
				switch ( dialogueStates.brother ) {

					case 'init' :
						startDialogue( 'init-brother' );
						break ;

				};

				break;




			/// TRADE

			case 'char-herbalist' :
				
				switch ( dialogueStates.herbalist ) {

					case 'init' :
						startDialogue( 'init-herbalist' );
						break ;

					case 'waiting-sage' :
						startDialogue( 'herbalist-wait-sage' );
						break ;

				};

				break;


			case 'char-herbalist-friend' :
				startDialogue( 'herbalist-friend-info' );
				break;


			case 'char-merchant' :
				
				switch( dialogueStates.merchant ) {

					case 'init' :
						startDialogue( 'init-merchant' );
						break;

					case 'wait-key' :
						startDialogue( 'wait-key-merchant' );
						break;

					case 'give-thread' :
						startDialogue( 'give-thread-merchant' );
						break;

					case 'general' :
						startDialogue( 'general-merchant' );
						break;

				};

				break;


			case 'char-miner' :
				
				switch( dialogueStates.miner ) {

					case 'init' :
						startDialogue( 'init-miner' );
						break;

					case 'give-key' :
						startDialogue( 'give-key-miner' );
						break;

					case 'general' :
						startDialogue( 'general-miner' );
						break;

				};

				break;

			case 'char-miner-boy' :

				if ( dialogueStates.minerBoy == 'general' ) {
					startDialogue( 'general-miner-boy' );
				};

				break;




			/// VILLAGE - MISC

			case 'char-gatekeeper' :
				
				switch( dialogueStates.gatekeeper ) {

					case 'init' :
						startDialogue( 'init-gatekeeper' );
						break;

					case 'warning' :
						startDialogue( 'warning-gatekeeper' );
						break;

				};

				break;





			/// CABLE-CARS

			case 'cable-1' :
				
				switch( dialogueStates.cable1 ) {

					case 'init' :
						startDialogue( 'station-activation' );
						dialogueStates.cable1 = 'use';
						break;

					case 'use' :
						startDialogue( 'station-use' );
						break;

				};

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

				setTimeout( ()=> {
					startDialogue( 'herbalist-friend-init' );
				}, 1100 );
			},

			message : 'You found an edelWeiss !<br>+ 1 Stamina'
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

		// Clean all the answer of the blinking class
		for ( domAnswer of domAnswersContainer.children ) {
			domAnswer.classList.remove( 'selected-answer' );
		};

		// assign the blinking class to the answer newly chosen
		let newDomChoice = questionTree.answers[ questionTree.currentChoice ].dom ;
		newDomChoice.classList.add( 'selected-answer' );

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


		//////////////
		///   DAD
		//////////////

		'init-dad' : {
			char: dialogueChars.dad,
			story: [
				{ m: "Can't you leave me alone while I'm working ?" },
				{ m: "Instead of hanging around, go fetch me some thread in the market.", onCall: ()=> {
					dialogueStates.dad = 'waiting-thread'
					dynamicItems.deleteCube( 'barrier-dad' );
					dynamicItems.actuateCube( 'char-dad', 'move-from-wall' );
				} }
			]
		},


		'dad-wait-thread' : {
			char: dialogueChars.dad,
			story: [
				{ m: "What's hard with fetching some thread, girl ?" },
				{ question: 'Do you want me to explain how to get to the market ?', answers: [
					{ m: 'Yes', next: 'help_yes' },
					{ m: 'No', next: 'help_no' }
				] },
				{ label: 'help_yes', m: "Alright... You climb this wall beside me, then you cross the little bridge, then you climb the herbalist wall and it's on your right" },
				{ label: 'help_no', m: 'Hurry up !' }
			]
		},


		'dad-give-permission' : {
			char: dialogueChars.dad,
			story: [
				{ m: "Ah at last you got this thread..." },
				{ m: "Do you have my permission to leave the village to activate the cable-car stations ?" },
				{ m: "Yes, now go away !", onCall: ()=> {
					dialogueStates.dad = "general" ;
					dialogueStates.gatekeeper = "warning" ;
					dynamicItems.deleteCube( 'village-gate' );
				} }
			]
		},

		'dad-general' : {
			char: dialogueChars.dad,
			story: [
				{ m: "Go play elsewhere !" }
			]
		},



		///////////////
		///  BROTHER
		///////////////

		'init-brother' : {
			char: dialogueChars.brother,
			story: [
				{ m: "I can't believe you cannot climb a wall like this yet, whereas you're two years older than me..."  },
				{ m: 'Cross the bridge on your right, there is a smaller wall to get to the market.' },
			]
		},



		/////////////////
		///  HERBALIST
		/////////////////

		'init-herbalist' : {
			char: dialogueChars.herbalist,
			story: [
				{ m: "My dear little daisy, Sorry to interrupt you... I just need a word !"  },
				{ m: "If you find time between two of your Dad's commands, can you give me a hand up ?" },
				{ m: "I need sage, but I'm getting old and I cannot climb the mountain anymore..."  },
				{ question: 'If you find some sage, can you bring it to me ?', answers: [
					{ m: 'Yes', next: 'help_yes' },
					{ m: 'No', next: 'help_no' }
				] },
				{ label: 'help_yes', m: "Great ! In exchange I will give you my climbing gears, as I no longer need it. Bring me 5 to get the first gear !", onCall: ()=> {
					dialogueStates.herbalist = "waiting-sage" ;
					dynamicItems.deleteCube( 'barrier-herbalist' );
					dynamicItems.actuateCube( 'char-herbalist', 'move-from-wall' );
				} },
				{ label: 'help_no', m: "Mh... Well, let's see if you can find another wall to climb to get to the market then !" }
			]
		},


		'herbalist-wait-sage' : {
			char: dialogueChars.herbalist,
			story: [
				{ m: "Are you bringing me sage ??"  }
			]
		},




		///// HERBALIST'S HUSBAND

		'herbalist-friend-init' : {
			char: dialogueChars.herbalistFriend,
			story: [
				{ m: 'Congrats ! You found your first edelweiss !' },
				{ m: 'You can climb taller walls now, look at the stamina bar at the top of your screen.' },
				{ question: 'Do you want to know more about these flowers ?', answers: [
					{ m: 'Yes', next: 'help_yes' },
					{ m: 'No', next: 'help_no' }
				] },
				{ label: 'help_yes', m: 'These flowers are very rare, and can only be found in altitude.' },
				{ label: 'help_no', m: "Fine ! Hurry to the market then, or your dad will get angry again...", end: true },
				{ m: 'My wife used to climb up the mountain, and she found a lot ! She even reached the peak once...' },
				{ m: "She say that she couldn't have make it without the power of the edelweiss."  },
				{ m: "I heard somebody at the pub saying that he saw one in the plains up the village."  },
				{ m: "It's probably a lie though..."  }
			]
		},


		'herbalist-friend-info' : {
			char: dialogueChars.herbalistFriend,
			story: [
				{ question: 'Do you want to know more about the edelweiss ?', answers: [
					{ m: 'Yes', next: 'help_yes' },
					{ m: 'No', next: 'help_no' }
				] },
				{ label: 'help_yes', m: 'These flowers are very rare, and can only be found in altitude.' },
				{ label: 'help_no', m: "Fine ! See you next time.", end: true },
				{ m: 'My wife used to climb up the mountain, and she found a lot ! She even reached the peak once...' },
				{ m: "She say that she couldn't have make it without the power of the edelweiss."  },
				{ m: "I heard somebody at the pub saying that he saw one in the plains up the village."  },
				{ m: "It's probably a lie though..."  }
			]
		},





		///////// MERCHANT

		'init-merchant' : {
			char: dialogueChars.merchant,
			story: [
				{ question: 'Hi sweetie, what do you want ?', answers: [
					{ m: 'I need some thread for my dad.', next: 'thread' },
					{ m: 'I want the flower on the shelf behind you.', next: 'flower' },
					{ m: 'Nothing' }
				] },
				{ label: 'thread', m: 'I have thread, but in the stockroom, and I lended the keys to the miner. Can you take him and bring it back please ?', onCall: ()=> {
					dialogueStates.merchant = 'wait-key' ;
					dialogueStates.miner = 'give-key' ;
				} },
				{ label: 'flower', m: "Hahaha sweetie, this is for sale ! I don't think you have money yet, come back later." },
				{ m: 'See you soon !' }
			]
		},


		'wait-key-merchant' : {
			char: dialogueChars.merchant,
			story: [
				{ m: "I see that you don't have the stockroom's keys yet..." },
				{ question: 'Do you need anything ?', answers: [
					{ m: "I can't find the miner to fetch de key.", next: 'miner' },
					{ m: 'I want the flower on the shelf behind you.', next: 'flower' },
					{ m: 'Nothing' }
				] },
				{ label: 'miner', m: 'The miner usually stands beside his cable-car, at the bottom right end of the village.' },
				{ label: 'flower', m: "Hahaha sweetie, this is for sale ! I don't think you have money yet, come back later." },
				{ m: 'See you soon !' }
			]
		},


		'give-thread-merchant' : {
			char: dialogueChars.merchant,
			story: [
				{ m: "You got the key of the stockroom, perfect !" },
				{ m: "Here is your thread, hurry to bring it back to your dad.", onCall: ()=> {
					dialogueStates.merchant = 'general' ;
					dialogueStates.dad = 'give-permission' ;
				} }
			]
		},


		'general-merchant' : {
			char: dialogueChars.merchant,
			story: [
				{ question: 'Hi sweetie, what do you want ?', answers: [
					{ m: "How goes the business ?", next: 'info' },
					{ m: 'I want the flower on the shelf behind you.', next: 'flower' },
					{ m: 'Nothing' }
				] },
				{ label: 'info', m: "Not so well I must say... " },
				{ label: 'flower', m: "Hahaha sweetie, this is for sale ! I don't think you have money yet, come back later." },
				{ m: 'See you soon !' }
			]
		},




		///// MINER

		'init-miner' : {
			char: dialogueChars.miner,
			story: [
				{ m: "Is it not a nice cable-car that we have here ?" },
				{ m: "It's my pride to have setup this new system for the mine. I'm gonna bring industrial age to this remote village, willy-nilly !" }
			]
		},


		'give-key-miner' : {
			char: dialogueChars.miner,
			story: [
				{ m: "You want the stockroom's key ?" },
				{ m: "Sure I will give it to you, but first let me ask you something..." },
				{ m: "You see my cable-car ? We use it for transporting the ore down from the mountain." },
				{ m: "During winter we cannot use the mine, so we stop the cable-car." },
				{ m: "But now it's spring, we will set back to work and we need to reactivate it." },
				{ m: "Somebody must climb the mountain and reactivate the stations one by one." },
				{ m: "However, I'm getting old and I don't think I can do it again this year..." },
				{ question: 'Would you mind doing it for me please ?', answers: [
					{ m: 'Yes', next: 'yes' },
					{ m: 'No', next: 'no' }
				] },
				{ label: 'yes', m: "You're such a nice girl ! I'm sure you will like the journey. Here is the key of the stockroom, you can go back to the merchant.", onCall: ()=> {
					dialogueStates.merchant = 'give-thread' ;
					dialogueStates.miner = 'general' ;
				}, end: true },
				{ label: 'no', m: "Oh... Never mind. I don't have time for the stockroom's key though, sorry.", end: true },
			]
		},


		'general-miner' : {
			char: dialogueChars.miner,
			story: [
				{ m: "Thank you for accepting to reactivate the cable-car stations !" },
				{ m: "There is still 5 cable-car stations to activate." }
			]
		},




		///// GATEKEEPER

		'init-gatekeeper' : {
			char: dialogueChars.gatekeeper,
			story: [
				{ m: "You want to go out ?" },
				{ m: "You can't leave the village without your Dad's permission, for what it's worth." }
			]
		},


		'warning-gatekeeper' : {
			char: dialogueChars.gatekeeper,
			story: [
				{ m: "Be careful out there. Come back to the village if you need climbing gears." },
			]
		},




		///// MINER BOY

		'cable-info-miner-boy' : {
			char: dialogueChars.minerBoy,
			story: [
				{ m: "So it's you who will activate the cable stations ?" },
				{ m: "When I'm grown up it's me who will do it !" },
				{ m: "The first station is here, on the right. Walk in front of the control panel and press SPACE like you want to talk to somebody." }
			]
		},


		'general-miner-boy' : {
			char: dialogueChars.minerBoy,
			story: [
				{ m: "The first station is here, on the right. To activate it go to the control panel and press SPACE like you want to talk to somebody." }
			]
		},




		///// CABLE STATION

		'station-activation' : {
			char: dialogueChars.lever,
			story: [
				{ m: 'Station activated !' },
				{ question: 'Do you want to go somewhere ?', answers: [
					{ m: 'Yes', next: 'yes' },
					{ m: 'No', next: 'no' }
				] },
				{ label: 'no', m: '...', end: true },
				{ label: 'yes', m: 'Select a destination' },
				{ question: 'Where do you want to go ?', answers: [
					{ m: 'Village', next: 'village' },
					{ m: 'Forest', next: 'forest' },
					{ m: 'Ridges', next: 'ridges' }
				] },
				{ label: 'village', m: 'Here we go.. Village !' },
				{ label: 'forest', m: 'Here we go.. Forest !' },
				{ label: 'ridges', m: 'Here we go.. Ridges !' },
			]
		},


		'station-use' : {
			char: dialogueChars.lever,
			story: [
				{ question: 'Where do you want to go ?', answers: [
					{ m: 'Village', next: 'village' },
					{ m: 'Forest', next: 'forest' },
					{ m: 'Ridges', next: 'ridges' }
				] },
				{ label: 'village', m: 'Here we go.. Village !' },
				{ label: 'forest', m: 'Here we go.. Forest !' },
				{ label: 'ridges', m: 'Here we go.. Ridges !' },
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
		hideMessage,
		requestNextLine,
		chooseAnswer
	};

};