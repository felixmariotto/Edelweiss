
function Input() {

    document.getElementById('json-scene').onchange = function (evt) {

        var tgt = evt.target || window.event.srcElement,
            files = tgt.files;
    
        // FileReader support
        if (FileReader && files && files.length) {

            var fr = new FileReader();

            fr.onload = function () {

                atlas = Atlas( JSON.parse( fr.result ) );
            };

            fr.readAsText(files[0]);

        };

    };

};