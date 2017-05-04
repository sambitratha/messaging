var express = require('express');
var ejs = require('ejs');
var path = require('path');
var bodyparser = require('body-parser');
var db = [];
var app = express();
var Scheduler = require('./modules/scheduler');
var Dispatcher = require('./modules/dispatcher');
var cutshort = require('./routes/cutshort.js');
var date = new Date();
var loggedin = false;
var loggedUserIndex = null;



app.set('view engine','ejs');
app.use(express.static(path.join(__dirname, 'public')));
var urlencodedParser = bodyparser.urlencoded({ extended: false });
//app.use('/',cutshort);


function dispatch(){
		if(loggedin)
			db = Dispatcher.dispatcher(db,loggedUserIndex);
}

setInterval(dispatch, 1000);

app.get('/',function(req,res){

		if(!loggedin){
			res.render("index.ejs",{user : null});
		}
		else{
			res.render("index.ejs",{user : db[loggedUserIndex]});
		}
});

app.get('/show',function(req,res){
    //res.render("notifications.ejs",{notifications : data[0].notifications,top:top});
		var msg = null;
		if(!loggedin){
			res.render("index.js",{user : null});
		}
		if(db.length != 0)
		{
			if (db[loggedUserIndex].toShow){
				db[loggedUserIndex].toShow = false;
				msg = db[loggedUserIndex].recentmsg;
			}
			console.log(msg);
			res.render("notifications.ejs",{recentmsg: msg , notifications : db[loggedUserIndex].revealedmsgs});
		}
		else {
			res.send("no database");
		}
});

app.get('/login',function(req,res){
		res.render("login.ejs",{status : true});
});

app.post('/login',urlencodedParser,function(req,res){
		if (getUserIndex(db,req.body.username) == -1){
			res.render("login.ejs",{status:false});
		}
		else {
			loggedin = true;
			loggedUserIndex = getUserIndex(db,req.body.username);
			res.render("index.ejs",{user: db[loggedUserIndex]});
		}
});

app.get('/addUser',function(req,res) {
		res.render("addUser.ejs");
});

app.post('/addUser',urlencodedParser,function(req,res){
		db = Scheduler.addUser(req.body.username,db);
		res.render("addUser.ejs");
});

app.get('/displayDB',function(req,res){
		console.log(db);
		console.log(db[loggedUserIndex].messageList.peek());
		res.render("displayDB.ejs",{db :db});
});


app.get('/postNew',function (req,res) {
		res.render("pushNotification.ejs");
});


function getUserIndex(db,username){
	for(var i=0; i< db.length;i++)
	{
		if (db[i].username == username)
			return i;
	}
	return -1;
}

app.post('/pushNotification',urlencodedParser,function(req,res){
		console.log(req.body);
		var index  = getUserIndex(db,req.body.targetUser);
		console.log(index);
		if(index > -1)
		{
			console.log(db);
			Scheduler.scheduler(db,index,req.body);
		}

		res.render("pushNotification.ejs");
});




app.listen(3000);

module.exports = {
		getDb : db
};
