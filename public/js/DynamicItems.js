

function DynamicItems() {
	


	var signedCube ; // which interactive cube have a sign on it



	function update( delta ) {

		

	};






	////////////////////////
	///  INTERACTION SIGN
	////////////////////////

	function showInteractionSign( tag ) {

		atlas.sceneGraph.cubesGraph.forEach( (stage)=> {

			stage.forEach( (cube)=> {

				console.log( cube)
				
			});

		});

		clearInteractionSign();

	};



	function clearInteractionSign() {

		// TODO : remove sign

		signedCube = undefined ;

	};





	return {
		update,
		showInteractionSign,
		clearInteractionSign
	};
};