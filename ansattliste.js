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

    var nameLength = name.length;
    var nameStart = name.substring(0, 3);
    var nameEnd = name.substring(nameLength-3, nameLength);
    var personNameLength;
    var personId;

    body.forEach(function(person) {
      personNameLength = person.Name.length;
      if(person.Name.substring(0, 3).toLowerCase() === nameStart && person.Name.substring(personNameLength-3, personNameLength).toLowerCase() === nameEnd) {
        personId = person.Id;
        return callback(personId);;
      }
    });    
  });
}
