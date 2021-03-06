var express = require('express');
var request = require('request');
var async = require('async');
var cache = require('memory-cache');
var app = express();
var mongo = require('mongodb').MongoClient;

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'html');
app.set('layout', 'layout');
app.engine('html', require('hogan-express'));
app.use(express.bodyParser());

var Socialcast = require('./socialcast');
var Ansattliste = require('./ansattliste');
var CarService = require('./car');
var Stats = require('./stats');

var socialcasturl = process.env.URL;
var socialcastusername = process.env.USERNAME;
var socialcastpassword = process.env.PASSWORD;
var mongolaburl = process.env.MONGOLAB_URI; 

var ansatte = {};
var messageCollection;
var carCollection;

var getAllMessages = function(callback){
  Socialcast.getMessages(function(messages) {
    async.each(messages, function(message, done) {
      var name = message.user.name;
      Ansattliste.SetPropertiesFromAnsattliste(ansatte, message, name);
      done();
    }, function(error) {
      if(error){
        console.log("Oops");
      }
      callback(messages);
    });
  });
}

app.get('/', function(req, res){
  getAllMessages(function(messages){
    res.render('index', { messages: messages, title: "Flodes hjemmeside - 1994" });
  });
});

app.get('/messages', function(req, res){
  getAllMessages(function(messages){
    res.json(messages);
  });
});


app.get('/message/:id', function(req, res){
  messageCollection.findOne({ "id": parseInt(req.params.id, 10) }, function(err, item) {
    if(item) {
      res.json(item);
    } else {
      Socialcast.getMessage(req.params.id, function(message){
        if(message){
          var name = message.user.name;
          Ansattliste.SetPropertiesFromAnsattliste(ansatte, message, name);
        }
        res.json(message);
      });
    }
  });
});

app.get('/cars', function(req, res){
  carCollection.find().toArray(function(err, items) {
    res.json(items);
  });
});

app.get('/cars/:registry', function(req, res){
  var cars = CarService.getAllCarNumbers(ansatte);
  res.json(cars);
});

app.post('/push', function(req, res){
  var message = req.body;
  messageCollection.update({ id: message.id }, message, { upsert: true}, function(err, result) {
    if(err){
      console.log("Error inserting message: "+message.id);
    } else {
      messageCollection.findOne({ id: message.id }, function(err, item) {
        console.log(item);
      })
    }

    res.send("Success", 200);
  });
});

app.get('/stats', function(req, res){
  getAllMessages(function(messages){
    var messagesPerSeniority = Stats.MessagesPerSeniority(messages);

    res.render('stats', {
      stats: messagesPerSeniority,
      pie: Stats.VisualizeThatShit(messagesPerSeniority),
      title: "Sykt freshe stats" 
    });
  });
});

app.get('/ansatt/:name', function(req, res){
  Ansattliste.getByName(req.params.name, function(data){
    res.json(data);
  });
});

app.get('/ansatt/id/:id', function(req, res){
  Ansattliste.getById(req.params.id, function(data){
    res.json(data);
  });
});

app.get('/ansatt/alternative/:name', function(req, res){
  Ansattliste.fuzzySearch(req.params.name, function(data){
    res.json(data);
  });
});


//Sette opp databasen
mongo.connect(mongolaburl, function(error, db) {
    if (error) throw error;
    messageCollection = db.collection('messages');
    carCollection = db.collection('cars');
});


//Hente ut alle ansatte og cache
Ansattliste.getAll(function(result){
  var employees = {};
  async.each(result, function(employee, done){
    var name = employee.Name;
    Ansattliste.getByName(name, function (ansatt) {
      if(ansatt){
        employees[name] = ansatt;
        CarService.getCarsForEmployee(ansatt, function(cars){
          async.each(cars, function(car, carDone){
            var carToSave = {};
            car.forEach(function(entry) {
              if (entry.name === 'Registreringsnummer') {
                carToSave.id = entry.value;
              } else if (entry.name === 'Merke og modell') {
                carToSave.brand = entry.value;
              } else if (entry.name === 'Drivstoff') {
                carToSave.fuel = entry.value;
              }
              carToSave.owner = ansatt.Name;
            });

            carCollection.update({ id: carToSave.id }, carToSave, { upsert: true}, function(err, result) {
              carDone();
            });
          }, function(){
            done();
          })
        });
      }
      else{
        done();  
      }
    });
  },
  function(){
    ansatte = employees;
   
    // if on heroku use heroku port.
    var port = process.env.PORT || 1339;
    app.listen(port);
    console.log("App started");
  });
});
