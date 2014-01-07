var express = require('express');
var request = require('request');
var async = require('async');
var cache = require('memory-cache');
var app = express();
var mongo = require('mongodb').MongoClient;

app.set('view engine', 'html');
app.set('layout', 'layout');
app.engine('html', require('hogan-express'));
app.use(express.bodyParser());

var Socialcast = require('./socialcast');
var Ansattliste = require('./ansattliste');

var socialcasturl = process.env.URL;
var socialcastusername = process.env.USERNAME;
var socialcastpassword = process.env.PASSWORD;
var mongolaburl = process.env.MONGOLAB_URI; 

var ansatte = {};
var messageCollection;

var getAllMessages = function(callback){
  Socialcast.getMessages(function(messages) {
    async.each(messages, function(message, done) {
      var name = message.user.name;

      if(ansatte[name]){
        message.user.senioritet = ansatte[name].Seniority;
        message.user.avdeling = ansatte[name].Department;  
      }
      else{
        var ansatt = Ansattliste.fuzzySearch(name, ansatte);
        if(ansatt){
          message.user.senioritet = ansatt.Seniority;
          message.user.avdeling = ansatt.Department;  
        }
      }

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
          if(ansatte[name]){
            message.user.senioritet = ansatte[name].Seniority;
            message.user.avdeling = ansatte[name].Department;  
          }
          else{
            var ansatt = Ansattliste.fuzzySearch(name, ansatte);
            if(ansatt){
              message.user.senioritet = ansatt.Seniority;
              message.user.avdeling = ansatt.Department;  
            }
          }
        }
        res.json(message);
      });
    }
  });
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

app.get('/seniority', function(req, res){
  getAllMessages(function(messages){
    var messageSeniorityMap = {};
    for(var i = 0; i<messages.length; i++){
      var seniority = messages[i].user.senioritet;

      if(messageSeniorityMap[seniority]){
        messageSeniorityMap[seniority]++;
      }
      else{
        messageSeniorityMap[seniority] = 1;
      }
    }

    var seniorityStatisticsArray = [];
    for(var key in messageSeniorityMap){
      var s = key;
      var a = messageSeniorityMap[key];

      seniorityStatisticsArray.push({senioritet: s, prosent: (a/messages.length*100), antall: a});
    }

    res.json(seniorityStatisticsArray);
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

mongo.connect(mongolaburl, function(error, db) {
    if (error) throw error;
    messageCollection = db.collection('messages');
});

Ansattliste.getAll(function(result){
  var employees = {};
  async.each(result, function(employee, done){
    var name = employee.Name;
    Ansattliste.getByName(name, function (ansatt) {
      if(ansatt){
        employees[name] = ansatt;
      }
      done();
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
