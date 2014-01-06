var request = require('request');
var url = process.env.URL_ANSATT;
var username = process.env.USERNAME;
var password = process.env.PASSWORD;

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

exports.getByName = function(name, callback){
	request.get(requestOptions("search?q="+name), function(error, response, body) {
		if(error) {
			console.log("an error has occured. keep calm and carry on.");
		}
		callback(body);
	});
};

exports.getById = function(id, callback){
  request.get(requestOptions("employee/"+id), function(error, response, body) {
    if(error) {
      console.log("an error has occured. keep calm and carry on.");
    }
    callback(body);
  });
};

exports.fuzzySearch = function(name, callback){
  request.get(requestOptions("all"), function(error, response, body) {
    if(error) {
      console.log("an error has occured. keep calm and carry on.");
    }
    var splitName = name.split(" ");
    var personId;
    var match = false;
    body.forEach(function(person) {
      var nameArray = person.Name.split(" ");
      var matchCounter = 0;
      splitName.forEach(function(namePart){
        if(nameArray.indexOf(namePart) !== -1 ){
          matchCounter++;
        }
      });

      if(matchCounter >= 2) {
        personId = person.Id;
        callback(personId);
        match = true;
        return;
      }
    });
    if(!match){
      callback(-1);  
    } 
  });
}