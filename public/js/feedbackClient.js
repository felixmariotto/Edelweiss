


function Feedback() {




	var state = 'none' ;











	//////////////////
	///////	  DOM
	/////////////////


	///// BACKGROUND

	var domBackground = document.createElement('DIV');
	document.body.appendChild( domBackground );

	domBackground.style.display = 'none' ;
	domBackground.style.position = 'fixed' ;
	domBackground.style.top = '0px';
	domBackground.style.left = '0px';
	domBackground.style.height = '100vh' ;
	domBackground.style.width = '100vw' ;
	domBackground.style.backgroundColor = 'rgba( 0, 0, 0, 0.5 )' ;


	///// BANANA BUTTON

	var domBananaButton = document.createElement('IMG');
	document.body.appendChild( domBananaButton );

	domBananaButton.src = 'https://felixmariotto.s3.eu-west-3.amazonaws.com/banana.jpg';

	domBananaButton.style.display = 'none';
	domBananaButton.style.position = 'fixed' ;
	domBananaButton.style.top = '20px';
	domBananaButton.style.left = '20px';
	domBananaButton.style.width = '60px';
	domBananaButton.style.borderRadius = '30px';



	///// CONTAINER

	var domContainer = document.createElement('DIV');
	document.body.appendChild( domContainer );

	domContainer.id = 'feedback-container';
	domContainer.style.display = 'none';
	domContainer.style.position = 'fixed';
	domContainer.style.maxHeight = '80vh';
	domContainer.style.maxWidth = 'calc( 100% - 40px )';
	domContainer.style.left = '50%';
	domContainer.style.top = '50%';
	domContainer.style.transform = 'translate( -50%, -50% )'
	domContainer.style.backgroundColor = 'white';
	domContainer.style.padding = '15px';
	domContainer.style.borderRadius = '5px';

	console.log( domContainer )


	///// MESSAGE BOX

	domMessageContainer = document.createElement('DIV');
	domContainer.appendChild( domMessageContainer );

	// domMessageContainer.style.display = 'flex';
	// domMessageContainer.style.flexDirection = window.innerWidth > window.innerHeight ? 'row' : 'column' ;
	domMessageContainer.style.height = '100%';
	domMessageContainer.style.width = '100%';

		/*

		// PICTURE

		domMessagePicture = document.createElement('IMG');
		domMessageContainer.appendChild( domMessagePicture );

		domMessagePicture.src = 'https://felixmariotto.s3.eu-west-3.amazonaws.com/my_picture.jpg';
		domMessagePicture.style.width = '30vw' ;
		domMessagePicture.style.maxWidth = '500px' ;
		domMessagePicture.style.borderRadius = '5px';

		*/

		// MESSAGE CONTENT

		domMessageContent = document.createElement('P');
		domMessageContainer.appendChild( domMessageContent );

		domMessageContent.style.width = '50vw';
		domMessageContent.style.padding = '10px';
		domMessageContent.style.textAlign = 'center';
		domMessageContent.style.fontSize =  window.innerWidth > window.innerHeight ? '1.5em' : '1em' ;
		








		//////////////////
		///  LISTENERS
		/////////////////


		domBackground.addEventListener( 'click', ()=> {

			if ( state == 'message' ) {

				hideMessage();

			};

		});

		domBananaButton.addEventListener( 'click', ()=> {

			if ( state == 'message' ) {

				hideMessage();

			};

		});

		domContainer.addEventListener( 'click', ()=> {

			if ( state == 'message' ) {

				hideMessage();

			};

		});





		

		////////////////////////////
		////    FUNCTIONS
		////////////////////////////



		function setMessage( string ) {

			domMessageContent.innerHTML = string ;

		};


		function showMessage() {

			domContainer.style.display = 'block';
			domBackground.style.display = 'block' ;
			domBananaButton.style.display = 'block' ;

			state = 'message' ;

		};


		function hideMessage() {

			domContainer.style.display = 'none';
			domBackground.style.display = 'none' ;

			state = 'none' ;

		};


		return {
			setMessage,
			showMessage,
			domBananaButton
		};

};