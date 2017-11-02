//PACKAGES
var express = require('express');
// on stocke l'app express dans une variable app : initialisation
var app = express();
// permet de charger des fichiers statiques (css, images, fichiers js externes), ils doivent etre placés dans le dossier "public"
app.use(express.static('public'));

app.set('view engine', 'ejs');
// Request is designed to make http calls. It supports HTTPS and follows redirects by default.
var request = require('request');


// BASE DE DONNEES
var mongoose = require('mongoose');
// pour empêcher erreur si base de donnees met trop longtemps a repondre
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
    position: Number,
    icone: String,
    description: String,
    tempMax: String,
    tempMin: String,
});


var CityModel = mongoose.model('cities', citySchema);

var cityList = [];

////// RECUPERER UNE COLLECTION DANS BASE DE DONNEES (pour la mettre dans cityList)
CityModel.find(function(err, cities) {
    var cityDB;
    for (var i = 0; i < cities.length; i++) {
        cityDB = cities[i];
        cityList.push(cityDB);
    }

})


// ROUTES
app.get('/', function(req, res) {
    CityModel.find().sort({ position: 1 }).exec(function(error, cities) {
        res.render('home', { cityList: cities });
    });
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
                var newCity = new CityModel({
                    name: body.name,
                    position: 0,
                    icone: "http://openweathermap.org/img/w/" + body.weather[0].icon + ".png",
                    description: body.weather[0].description,
                    tempMax: body.main.temp_max + " °C",
                    tempMin: body.main.temp_min + " °C",
                });

                // on insere dans la base de donnees
                newCity.save(function(error, city) {
                    //console.log(error);

                    CityModel.find(function(error, cities) {
                        for (var i = 0; i < cities.length; i++) {
                            cities[i].set({ position: i });
                            //console.log(cities[i]);
                            cities[i].save(function(error, cityUpdate) {
                                //console.log(error);
                            });
                        }
                        res.render('home', { cityList: cities });
                    });
                });


            } else {
                console.log('statusCode:', response && response.statusCode);
            }

        });
    }
});

app.get('/delete', function(req, res) {
    if (req.query.uniqueID && req.query.uniqueID != "") {
        // recupere ID unique envoyé en requête et supprime entrée correspondante dans la base de données
        CityModel.remove({ _id: req.query.uniqueID }, function(error, ville) {
            //console.log(error);
            CityModel.find(function(error, cities) {
                // la collection retournée est utilisée pour le render
                res.render('home', { cityList: cities });
            });
        });

    }
});


app.get('/move', function(req, res) {
    //récupère nouvel ordre envoyé en requete sous forme de tableau
    var newOrder = req.query.sort; // newOrder = [ '2', '0', '1' ]

    // retourne collection de villes triées par ordre de position dans base de données
    var query = CityModel.find();
    query.sort({ position: 1 });

    query.exec(function(error, cities) {
        // chaque entrée de newOrder est lue dans l'ordre
        for (var i = 0; i < newOrder.length; i++) {
            // la ville dont la position correspond à "i" dans newOrder prend la posistion du "i" de la boucle
            cities[newOrder[i]].set({ position: i });
            cities[newOrder[i]].save(function(error, updatedCity) {});
        }
    });
});




//LISTEN

var port = (process.env.PORT || 8080);

app.listen(port, function() {
    console.log("server listening on port 8080");
});