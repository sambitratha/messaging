var express = require('express');

var app = express();

app.get('/' , function(req,res){
  res.send('hello there');
});

app.listen('3000');
