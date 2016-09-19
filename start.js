'use strict';
var path = require('path');
var express = require('express');
var app = express();
var server = app.listen(1990, function(){
    console.log("Server started on port 1990");
});

let root = __dirname;
let npmPath = path.join(root, './node_modules');
let browserPath = path.join(root, './browser');
let homePath = path.join(root, './app/views/index.html');
console.log(homePath);

app.use(express.static(npmPath));
app.use(express.static(browserPath));
app.use(express.static(homePath));

    
app.get('/*', function(req, res){
     res.sendFile(homePath);
});

app.use(function(err, req, res, next){
    console.error(err);
    res.status(err.status).send(err.message);
});