//require our websocket library 
var WebSocketServer = require('ws').Server;
 
//creating a websocket server at port 9090 
var wss = new WebSocketServer({port: 9090}); 
console.log("Server runing on localhost:9090");
//all connected to the server users 
var users = [];

// for broadcasting Events like users
wss.broadcast = function(data) {
   wss.clients.forEach(client => {
      client.send(data);
   })
 };

//when a user connects to our sever 
wss.on('connection', function(connection) {
  
   console.log("Browser of the User connected with success");
	
   //when server gets a message from a connected user
   connection.on('message', function(message) { 
	
      var data; 
      //accepting only JSON messages 
      try {
         data = JSON.parse(message); 
      } catch (e) { 
         console.log("Invalid JSON"); 
         data = {}; 
      } 
		
      //switching type of the user message 
      switch (data.type) { 
         //when a user tries to login 
			
         case "login": 
            console.log("User logged as:", data.name); 
				
            //if anyone is logged in with this username then refuse 
            if(users.includes(data.name)) { 
               // always send users, so we can have updated users list
               sendTo(connection, { 
                  type: "login", 
                  success: false
               }); 
            } else {
               // set the connection name
               connection.id = data.name 
               //save user connection on the server by pushing to array
               users.push(data.name)
					// always send users, so we can have updated users list
               sendTo(connection, { 
                  type: "login", 
                  success: true
               }); 
            } 
            wss.broadcast(JSON.stringify({
               type: "usersList",
               users
            }))
            break; 
         case "RTCsignal": 
            let con;
            wss.clients.forEach(client => {
               if(client.id == data.to){
                  con = client;
               }
            })
            if(con){
               sendTo(con, data); 
            }else{
               console.log("could not find client connected")
            }
            break;
				
         default: 
            console.log()
            sendTo(connection, { 
               type: "error", 
               message: "Command not found: " + data.type 
            }); 
				
            break; 
      }  


   });  
	
   //when user exits, for example closes a browser window 
   //this may help if we are still in "offer","answer" or "candidate" state 
   connection.on("close", function() { 

      // user has left, delete user
      const index = users.indexOf(connection.id);
      if (index > -1) {
         users.splice(index, 1);
      }
      
      // rebroadcast users list
      wss.broadcast(JSON.stringify({
         type: "usersList",
         users
      }))

   });  
	
   connection.send(JSON.stringify({message: "Hello world"})); 
	
});  

function sendTo(connection, message) { 
   connection.send(JSON.stringify(message)); 
}