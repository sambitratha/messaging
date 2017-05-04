var router = require('express').Router();
var b = require('../app.js');
var Scheduler = require('../modules/scheduler.js');
var Dispatcher =require('../modules/dispatcher.js');
var db = b.getDb;
var bodyparser = require('body-parser');
var urlencodedParser = bodyparser.urlencoded({ extended: false });

function getUserIndex(db,username){
	for(var i=0; i< data.length;i++)
	{
		if (db[i].username == username)
			return i;
	}
	return -1;
}

router.get('/',function(req,res){

});

router.get('/addUser',function(req,res) {
		res.render("addUser.ejs");
});

router.post('/addUser',urlencodedParser,function(req,res){
		console.log(db);
		db = Scheduler.addUser(req.body.username,db);
		res.render("addUser.ejs");
});

router.get('/displayDB',function(req,res){

		res.render("displayDB.ejs",{db :db});
});


router.get('/postNew',function (req,res) {
		res.render("pushNotification.ejs");
});

router.post('/pushNotification',urlencodedParser,function(req,res){
		console.log(req.body);
		var index  = getUserIndex(db,req.body.targetUser);
		console.log(index);
		if(index > -1)
		{
			Scheduler.scheduler(db,index,req.body);
		}

		res.render("pushNotification.ejs");
});

module.exports = router;
