//var app = require('app.js');
var FastPriorityQueue = require("fastpriorityqueue");

module.exports = {
		scheduler : function (db,_id,newmessage){
					//var _id = getIndex(newmessage.targetUser);
					newmessage.time = new Date();
					if (newmessage.priority == 1)
					{
							newmessage.delay = [0,0,1];
					}
					else
					{
							if(newmessage.time.getMinutes() < 50)
								newmessage.delay = [0,0,10];
							else {
								var x = 60 - newmessage.time.getMinutes();
								newmessage.delay = [0,1,x];
							}
					}
					
					newmessage.discovered = false;
					db[_id].messageList.add(newmessage);
					return db;
		},

		pushnew : function (db,index,message,time){
				db[index].messageList.add(message);					//user.messagelist is a fastpriorityqueue , add the new data to pqueue with priority being time
				if (message.priority == 2){
						db[index].MaxTime = time;								//if priority is 2 then update the maxtime of the user which gives an idea about when the next message will be displayed
				}
				return db;
		},

		/*
			adduser is called whenever an user signs up
			in this case just to initialize database/objectarray inorder to check api
		*/

		addUser : function (Username,db){
				var newmessagelist = new FastPriorityQueue(function(a,b){return a.time > b.time});
				var newObj = {username : Username , revealedmsgs : [] ,messageList : newmessagelist, recentmsg : null ,toShow : false, MaxTime : 0, enabledNotification : true, messageNumbers : 0};
				db.push(newObj);

				/*

				//the code given below is the code if a mongodb database is used

				var MongoClient = require('mongodb').MongoClient, assert = require('assert');
				var url = 'mongodb://localhost:3000/cutshort';
				MongoClient.connect(url, function(err, db) {
					assert.equal(null, err);
					console.log("Connected correctly to server");
					db.collection('inserts').insertOne(newObj)
				}

				*/
				return db;
		}
}
