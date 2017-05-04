var maxNumber =  10;


module.exports = {

		ifEnabled : function(db,index){
				return db[index].enabledNotification ;
		},

		dispatcher : function(db,index){

				if (db.length == 0)
					return db;

				if(db[index].messageList.isEmpty())
					return db;

				var date = new Date();
				if (date.getHours() == 23 && db[index].messageNumbers >= maxNumber){

						//schedule it for later
						temp = [];
						while(!db[index].messageList.isEmpty()){
							temp.push(db[index].messageList.poll());
						}
						for(var i = 0; i < temp.length ;i++)
						{
							temp[i].delay[0] = 1;
							temp[i].delay[1] = (10*(i+1))/60;
							temp[i].delay[2] = (10*(i+1))%60;
							db[index].messageList.add(temp[i]);
						}
				}
				else {
						if(db[index].messageNumbers == 10){
							db[index].messageNumbers = 0;
						}
						var _msg = db[index].messageList.peek();
						if (_msg.time.getHours() + _msg.delay[1] <= date.getHours() && _msg.time.getMinutes() + _msg.delay[2] <= date.getMinutes()){

								db[index].toShow = true;
								db[index].recentmsg = _msg;
								db[index].messageList.poll();
								db[index].messageNumbers += 1;
								db[index].revealedmsgs.push(_msg);
						}
					}
				return db;
		},

		checkTime : function(message){

		}


}
