var request = require('request');
var async = require('async');
var url = process.env.URL_CARS;

var requestOptions = function(path){
	return {
      auth: {
        'user': process.env.USERNAME,
        'pass': process.env.PASSWORD
      },
      url: url + path,
      json: true,
      headers: {
        'User-Agent': 'request',
        'accept': 'application/json'
      }
    }
};

exports.getCarsForEmployee = function(employee, callback){
	var employeeCars = [];
	if(employee.Cars){
		var cars = employee.Cars.split(",");
		async.each(cars, function(car, carDone){
			lookupCar(car.trim(), function(carObject){
				employeeCars.push(carObject);
				carDone();
			});
		}, function(){
			callback(employeeCars);
		});
	}
	else{
		callback(employeeCars);
	}
}

exports.getAllCarNumbers = function(employees, callback){
	console.log(employees);
	async.each(employees, function(employee, done){
		var employeeCars = [];
		if(employee.Cars){
			var cars = employee.Cars.split(",");
			async.each(cars, function(car, carDone){
				lookupCar(car.trim(), function(carObject){
					employeeCars.push(carObject);
					carDone();
				});
			}, function(){
				employee.Cars = employeeCars;
				done();
			});
		}
		else{
			employee.Cars = employeeCars;
			done();
		}
	}, function(){
		callback(employees);
	});
};

var lookupCar = function(registryNumber, callback){
	request.get(requestOptions("api/"+registryNumber), function(error, response, car) {
    	if(error) {
      		console.log("an error has occured. keep calm and carry on.");
    	}
    	callback(car);
  	});
};