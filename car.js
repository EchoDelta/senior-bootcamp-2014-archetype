var request = require('request');
var async = require('async');
var url = process.env.URL_CARS;

var requestOptions = function(path){
	return {
      auth: {
        'user': username,
        'pass': password
      },
      url: url + path,
      json: true,
      headers: {
        'User-Agent': 'request',
        'accept': 'application/json'
      }
    }
};

exports.getAllCarNumbers = function(employees, callback){
	var peopleWithCars = [];
	//console.log(employees);
	async.each(employees, function(employee, done){
		var cars = [];

		for (var i = employee.cars.length - 1; i >= 0; i--) {
			employee.cars[i]
		};

		var info = {
			'name': person.Name
		}


		lookupCar(function(){

			done();	
		});
	}, function(){
		callback(peopleWithCars);
	});

	/*
	for(var key in employees){
		var person = employees[key];
		if(person.Cars !== null) {
			var info = {
				'name': person.Name,
				'cars': person.Cars.split(',')
			}

			peopleWithCars.push(info);
			//var cars = 
			//console.log(person.Cars);	
		}
	}
	*/
};

var lookupCar = function(registryNumber, callback){
	request.get(requestOptions("api/"+registryNumber), function(error, response, body) {
    	if(error) {
      		console.log("an error has occured. keep calm and carry on.");
    	}
    	callback(body);
  	});
};