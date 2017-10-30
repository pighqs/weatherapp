//PACKAGES
var express = require('express');
// on stocke l'app express dans une variable app : initialisation
var app = express();
// permet de charger des fichiers statiques (css, images, fichiers js externes), ils doivent etre placés dans le dossier "public"
app.use(express.static('public'));

app.set('view engine', 'ejs');
// module request permet d'interroger webservice
var request = require('request');

var cityList = [
    { name: "Paris", icone: "http://openweathermap.org/img/w/01d.png", description: "youpi", tempMax: "18 °C", tempMin: "14 °C" },
    { name: "Lyon", icone: "http://openweathermap.org/img/w/11d.png", description: "caca", tempMax: "10 °C", tempMin: "2 °C" },
    { name: "Marseille", icone: "http://openweathermap.org/img/w/03d.png", description: "bof", tempMax: "20 °C", tempMin: "16 °C" }

];

// var info = {
//     "coord": { "lon": -122.42, "lat": 37.77 },
//     "weather": [{ "id": 701, "main": "Mist", "description": "brume", "icon": "50n" }],
//     "base": "stations",
//     "main": { "temp": 12.5, "pressure": 1012, "humidity": 82, "temp_min": 11, "temp_max": 14 },
//     "visibility": 16093,
//     "wind": { "speed": 3.6, "deg": 250 },
//     "clouds": { "all": 90 },
//     "dt": 1509358020,
//     "sys": { "type": 1, "id": 478, "message": 0.0047, "country": "US", "sunrise": 1509374025, "sunset": 1509412336 },
//     "id": 0,
//     "name": "San Francisco",
//     "cod": 200
// };


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

            // on pushe cette variable dans le tableau cityList qui est lu par le front
            cityList.push(newCity);
            req.query = "";
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




//LISTEN

var port = (process.env.PORT || 8080);

app.listen(port, function() {
    console.log("server.js chargé");
});