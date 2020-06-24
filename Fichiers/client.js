var connection = new WebSocket('ws://localhost:9090');
var name = "";

var loginInput = document.querySelector('#loginInput');
var loginBtn = document.querySelector('#loginBtn');

var otherUsernameInput = document.querySelector('#otherUsernameInput');
var connectToOtherUsernameBtn = document.querySelector('#connectToOtherUsernameBtn');
var msgInput = document.querySelector('#msgInput');
var sendMsgBtn = document.querySelector('#sendMsgBtn');
var connectedUser, myConnection, dataChannel;
var chatArea = document.querySelector('#chatarea');

//when a user clicks the login button
loginBtn.addEventListener("click", function(event) {
   name = loginInput.value;
    
   if(name.length > 0) {
      send({
         type: "login",
         name: name
      });
   }
});
 

// create the data base to save send messages
function errorHandler(tx, error){

   console.log('Oops error was '+error.message+'(code '+error.code+')');
   return true;
}
var db= openDatabase('send_message', '1.0', 'Send message to another peer', 5*1024*1024 );

   db.transaction(function(tx){
      var sql='CREATE TABLE IF NOT EXISTS Document (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,message text)';
      tx.executeSql(sql,undefined,function(){
         alert("Table is created successfully");
      },function(){
         alert("Table is already being created");
      })
     
   });


/*
   db.transaction(function (tx) { 
      tx.executeSql('CREATE TABLE IF NOT EXISTS LOGS (id unique, log)'); 
      tx.executeSql('INSERT INTO LOGS (id, log) VALUES (1, "foobar")'); 
      tx.executeSql('INSERT INTO LOGS (id, log) VALUES (2, "logmsg")'); 
   }); 
   */
   
   function Insert() {  
         
   db.transaction(function (tx) {
   tx.executeSql('CREATE TABLE IF NOT EXISTS Document (message)');
   var message=document.getElementById("chatarea").value;
   tx.executeSql('INSERT INTO Document VALUES ("'+message+'")');
     
         });
                 
       }
//End of database


//handle messages from the server
connection.onmessage = function (message) {
   console.log("Got message", message.data);
   var data = JSON.parse(message.data);
    
   switch(data.type) {
      case "login":
         onLogin(data.success);
         break;
      case "offer":
         onOffer(data.offer, data.name);
         break;
      case "answer":
         onAnswer(data.answer);
         break;
      case "candidate":
         onCandidate(data.candidate);
         break;
      default:
         break;
   }
};
 
//when a user logs in
function onLogin(success) {

   if (success === false) {
      alert("oops...try a different username");
      
   } else if (success === true) {
      alert("You logged now under the name of:"+ name);
      //creating our RTCPeerConnection object
      var configuration = {
         "iceServers": [{ "url": "stun:stun.1.google.com:19302" }]
      };
        
      myConnection = new webkitRTCPeerConnection(configuration, {
         optional: [{RtpDataChannels: true}]
      });
        
      console.log("RTCPeerConnection object was created");
      console.log(myConnection);
 
      //setup ice handling
      //when the browser finds an ice candidate we send it to another peer
      myConnection.onicecandidate = function (event) {
        
         if (event.candidate) {
            send({
               type: "candidate",
               candidate: event.candidate
            });
         }
      };
      
      openDataChannel();
        
   }

    //when we receive a message from the other peer, display it on the screen
    dataChannel.onmessage = function (event) {
      chatArea.innerHTML += connectedUser + ": " + event.data + "<br />";
   };
};
 
connection.onopen = function () {
   console.log("Connected");
};
 
connection.onerror = function (err) {
   console.log("Got error", err);
};
 
// Alias for sending messages in JSON format
function send(message) {
   if (connectedUser) {
      message.name = connectedUser;
   }
    
   connection.send(JSON.stringify(message));
};
//setup a peer connection with another user
connectToOtherUsernameBtn.addEventListener("click", function () {
 
   var otherUsername = otherUsernameInput.value;
   connectedUser = otherUsername;
    
   if (otherUsername.length > 0) {
      //make an offer
      myConnection.createOffer(function (offer) {
         console.log();
            
         send({
            type: "offer",
            offer: offer
         });
            
         myConnection.setLocalDescription(offer);
      }, function (error) {
         alert("An error has occurred.");
      });
   }
});
 
//when somebody wants to call us
function onOffer(offer, name) {
   connectedUser = name;
   myConnection.setRemoteDescription(new RTCSessionDescription(offer));
    
   myConnection.createAnswer(function (answer) {
      myConnection.setLocalDescription(answer);
        
      send({
         type: "answer",
         answer: answer
      });
        
   }, function (error) {
      alert("oops...error");
   });
}

//when another user answers to our offer
function onAnswer(answer) {
   myConnection.setRemoteDescription(new RTCSessionDescription(answer));
}
 
//when we got ice candidate from another user
function onCandidate(candidate) {
   myConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

//creating data channel
function openDataChannel() {

   var dataChannelOptions = {
      reliable:true
   };
    
   dataChannel = myConnection.createDataChannel("myDataChannel", dataChannelOptions);
    
   dataChannel.onerror = function (error) {
      console.log("Error:", error);
   };
    
   dataChannel.onmessage = function (event) {
      console.log("Got message:", event.data);
   };  
}
  //when a user clicks the send message button

 // (si on veux que le sender voit son message aussi on peut mettre ce bout de code au dessous apres la variable (var))
 //= chatArea.innerHTML += name + ": " + val + "<br />";
sendMsgBtn.addEventListener("click", function (event) {
   console.log("send message");
   var val = msgInput.value;
   dataChannel.send(val);
   msgInput.value = "";
});
