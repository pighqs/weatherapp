//PACKAGES
var express = require('express');
// on stocke l'app express dans une variable app : initialisation
var app = express();
// permet de charger des fichiers statiques (css, images, fichiers js externes), ils doivent etre placés dans le dossier "public"
app.use(express.static('public'));

app.set('view engine', 'ejs');
// module request permet d'interroger webservice
var request = require('request');

// ROUTES

//       chemin      fonction
app.get('/', function(req, res) {
    res.render('home', );
});







//LISTEN

var port = (process.env.PORT || 8080);

app.listen(port, function() {
    console.log("server.js chargé");
});