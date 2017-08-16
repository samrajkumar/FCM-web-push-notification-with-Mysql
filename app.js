'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var webpush = require('web-push');
var path = require('path');
var http = require('http');
var server = express();
var client = express();

var mysql = require('mysql');
var connection = mysql.createConnection({
				host: "192.168.1.123",
				user: "root",
				password: "",
				database: "sam"
            });

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;
server.use(bodyParser.json());

server.post('/api/send', (req, res) => {
  const options = {
    vapidDetails: {
      subject: 'http://samraj.online/',
      publicKey: req.body.applicationKeys.public,
      privateKey: req.body.applicationKeys.private
    },
    TTL: 60 * 60
  };

  webpush.sendNotification(
    req.body.subscription,
    req.body.data,
    options
  )
    .then(() => {
      res.status(200).send({ success: true });
    })
    .catch((err) => {
      if (err.statusCode) {
        res.status(err.statusCode).send(err.body);
      } else {
        res.status(400).send(err.message);
      }
    });
});

server.use('/', express.static('server'));
client.use('/', express.static('client'));

http.createServer(server).listen(3001, function () {
  console.log('Server application listening on port 3001');
});

http.createServer(client).listen(3002, function () {
  console.log('Client application listening on port 3002');
});

client.use(bodyParser.json())

client.get('/', function(req, res) {
  res.sendFile(path.join(__dirname+ '/client/index.html'));
});

client.post('/', function(req, res) {

var jsondata = req.body;
var values = [];

for(var i=0; i< jsondata.length; i++)
  values.push([jsondata[i].key,jsondata[i].exp,jsondata[i].pdh,jsondata[i].auth]);

//Bulk insert using nested array [ [a,b],[c,d] ] will be flattened to (a,b),(c,d)
connection.query('INSERT INTO push (endpoint, expiration, pdh, auth) VALUES ?', [values], function(err,result) {
  if(err) {
     res.send('Error');
  }
 else {
     res.send('Success');
  }
});
});

server.post('/', function(req, res) {


//Bulk insert using nested array [ [a,b],[c,d] ] will be flattened to (a,b),(c,d)
connection.query('SELECT * FROM sam.push where id = (select max(id) from sam.push) and id is not null',function(err,result) {
  if(err) {
     res.send('Error');
  }
 else {
     res.send(result);
  }
});
});