# messaging

# over view
  -this app takes notifications generated via server for different users , schedules it and dispatches it at proper time
  - it has 2 services
    1. scheduler
    2. dispatcher
    
#scheduler#
  - this module receives a json of notification
  - a notification consists of following attributes
    1. target user
    2. time
    3. priority
  - then it assigns a new attribute called delay to the received notification
  - delay is 1 minute if the notification has higher priority
  - delay is of 10 minutes if message has lower priority
  - then it adds the message to database with the new delay

#dispatcher
  - this module is a service which keeps on checking at a certain interval (10 seconds in this case)
  - it checks following thing if the user has disabled notification receiving
  - then it checks if 24 hours has passed by . if yes then it updates the database and schedules the messages for next day
  - in each 10 seconds it checks whether it's the right time to send user a message
  - it decides it from the time and delay attribute and then sends the message if it is the correct time to
  
#frontend
  -  you can add any number of users upon going to url /addUser
  -  then you can login annonymously by going to /login
  -  to check the scheduling /postNew provides a form for sending a new message to any of the available user
  -  and finally to check the message you can first login and then go to /show url for seeing the recent message that you have and also all the messages that you have received so far
  
