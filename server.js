//PACKAGES
var express = require('express');
// on stocke l'app express dans une variable app : initialisation
var app = express();
// permet de charger des fichiers statiques (css, images, fichiers js externes), ils doivent etre placés dans le dossier "public"
app.use(express.static('public'));

app.set('view engine', 'ejs');
// Request is designed to make http calls. It supports HTTPS and follows redirects by default.
var request = require('request');

var cityList = [];

var villesHome = ["San Francisco", "Tokyo", "Kinshasa"];

for (var i = 0; i < villesHome.length; i++) {
    //la ville demandée en url via le formulaire à openweathermap est stockée dans une variable
    var villeHomeUrl = "http://api.openweathermap.org/data/2.5/weather?q=" + villesHome[i] + "&appid=06aea259ff3cfc440c58bc8e256393c6&lang=fr&units=metric&type=accurate&mode=json";
    request(villeHomeUrl, function(error, response, body) {
        // la requête nous renvoie les infos qui seront stockées au format JSON dans une variable "body":
        var body = JSON.parse(body);
        // on récupère les infos de body(retournées âr le webservice) pour assigner une nouvelle variable newCity
        var ville = {
            name: body.name,
            icone: "http://openweathermap.org/img/w/" + body.weather[0].icon + ".png",
            description: body.weather[0].description,
            tempMax: body.main.temp_max + " °C",
            tempMin: body.main.temp_min + " °C"
        };
        // on pushe cette variable dans le tableau cityList qui est lu par le front
        cityList.push(ville);
    });
}


// ROUTES
app.get('/', function(req, res) {
    res.render('home', { cityList: cityList });

});

app.get('/add', function(req, res) {
    if (req.query.city && req.query.city != "") {

        var apiKey = "06aea259ff3cfc440c58bc8e256393c6";
        var city = req.query.city;
        //la ville demandée en url via le formulaire à openweathermap est stockée dans une variable
        var meteoUrl = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey + "&lang=fr&units=metric&type=accurate&mode=json";

        request(meteoUrl, function(error, response, body) {
            // seulement si la réponse n'est pas 404 ()
            if (response.statusCode !== 404) {

                // la requête nous renvoie les infos qui seront stockées au format JSON dans une variable "body":
                var body = JSON.parse(body);
                // on récupère les infos de body pour assigner une nouvelle variable newCity
                var newCity = {
                    name: body.name,
                    icone: "http://openweathermap.org/img/w/" + body.weather[0].icon + ".png",
                    description: body.weather[0].description,
                    tempMax: body.main.temp_max + " °C",
                    tempMin: body.main.temp_min + " °C"
                };

                // on insere cette variable dans le tableau cityList qui est lu par le front
                cityList.push(newCity);
            } else {
                console.log('statusCode:', response && response.statusCode);
            }

            // on affiche la home
            res.render('home', { cityList: cityList });

        });
    }
});

app.get('/delete', function(req, res) {
    if (req.query.position && req.query.position != "") {
        cityList.splice(req.query.position, 1);

    }
    res.render('home', { cityList: cityList });
});



app.get('/move', function(req, res) {
    console.log("ordre modifié");
    console.log(req.query.sort);
    var newOrder = [];
    // returns [ '1', '2', '0' ]
    for (var i = 0; i < req.query.sort.length; i++) {
        newOrder.push(cityList[req.query.sort[i]]);
    }
    cityList = newOrder;
    newOrder = [];
});


//LISTEN

var port = (process.env.PORT || 8080);

app.listen(port, function() {
    console.log("server listening on port 8080");
});
