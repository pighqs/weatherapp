window.onload = function() {

    console.log("mains js chargé");

    const autocomplete = document.getElementById("city");

    const listePredict = document.createElement("ul");
    $("#bidon").append(listePredict);

    inputCity.addEventListener('input', function(e) {
        console.log("entree input:", e.target.value);
        var requete = e.target.value;
        var urlMapsApi = "https://maps.googleapis.com/maps/api/place/autocomplete/json?language=fr&types=(cities)&key=AIzaSyAsWvsTD9g30mCesT4BroqaRIVc_GzW4wA&input=";
        var previousListItems = listePredict.getElementsByTagName("li");
        $(previousListItems).remove();

        /// REQUETE AJAX

        $.getJSON(urlMapsApi + requete, function(data) {
            console.log(data);
            var prediction_item;
            var predictions = data.predictions;
            for (var i = 0; i < predictions.length; i++) {
                prediction_item = document.createElement("li");
                prediction_item.addEventListener('click', function(e) {
                    inputCity.value = e.target.textContent;
                }, false);
                prediction_item.textContent = predictions[i].description;
                $(listePredict).append(prediction_item);
            }
        });
    }, false);



}