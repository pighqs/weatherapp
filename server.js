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

// BASE DE DONNEES

var mongoose = require('mongoose');

var options = { server: { socketOptions: { connectTimeoutMS: 30000 } } };



mongoose.connect('mongodb://toto:tata@ds141351.mlab.com:41351/weatherapp', options, function(err) {
    if (err) {
        console.log("erreur : " + err);
    } else {
        console.log("connection data base OK");
    }
});

var citySchema = mongoose.Schema({
    name: String,
    icone: String,
    description: String,
    tempMax: String,
    tempMin: String,
});


var CityModel = mongoose.model('cities', citySchema);

CityModel.find(function(err, cities) {
    var cityDB;
    for (var i = 0; i < cities.length; i++) {
        cityDB = cities[i];
        cityList.push(cityDB);
    }

})


////// RECUPERER UNE COLLECTION DANS BASE DE DONNEES


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
                    tempMin: body.main.temp_min + " °C",
                };

                var newCityDB = new CityModel(newCity);
                newCity.id = newCityDB._id;

                // on insere cette variable dans le tableau cityList qui est lu par le front
                cityList.push(newCity);
                // on insere dans la base de donnees



                newCityDB.save(function(error, entree) {});

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
        var cityToDel = req.query.uniqueID;
        console.log(req.query.uniqueID);
        CityModel.remove({ _id: cityToDel }, function(error, ville) {});
    }
    res.render('home', { cityList: cityList });
});


app.get('/move', function(req, res) {
    console.log("ordre modifié");
    console.log(req.query);
    // on crée nouveau tableau vide
    // req.query.sort est un tableau avec chaque id envoyé selon son ordre dans le navigateur
    var newOrder = [];
    for (var i = 0; i < req.query.sort.length; i++) {
        // à chaque tour de boucle; l'item ayant pour index dans citylink l'id correspondant dans req.query.sort est inséré dans nveau tableau
        newOrder.push(cityList[req.query.sort[i]]);
    }
    // ce nouveau tableau a bien l'ordre renvoyé par la requete, on ecrase les valeurs de cityLink avec ce tableau
    cityList = newOrder;
    res.send("ok babe");
});


//LISTEN

var port = (process.env.PORT || 8080);

app.listen(port, function() {
    console.log("server listening on port 8080");
});