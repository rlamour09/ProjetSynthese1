var connection = new WebSocket('ws://localhost:9090');
var name = "";
var loginInput = document.querySelector('#loginInput');
var loginBtn = document.querySelector('#loginBtn');
var otherUsernameInput = document.querySelector('#otherUsernameInput');
var connectToOtherUsernameBtn = document.querySelector('#connectToOtherUsernameBtn');
var msgInput = document.querySelector('#msgInput');
var sendMsgBtn = document.querySelector('#sendMsgBtn');
var connectedUser=[];
var myConnection =[]; 
var dataChannel =[];
var chatArea = document.querySelector('#chatarea');
var partager = document.querySelector('#partager');
var displayData = document.querySelector('#displayData');
var i=0;
var otherUsername;


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
 
///////////////////Database/////////////////////////////////////////////////////////////////

var db = openDatabase('TestDB', '1.0', 'Test DB', 2 * 1024 * 1024); 
  
function insertData (){ 

db.transaction(function (tx) { 
//tx.executeSql('DROP TABLE IF EXISTS testNote');
tx.executeSql("CREATE TABLE IF NOT EXISTS testNote(" + 
        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "auteur TEXT, " +
        "paragraphe TEXT, " +
        "date TIMESTAMP DEFAULT(datetime('now', 'localtime')))"
    );
    var txt1=document.getElementById("loginInput").value;
    var txt2=document.getElementById("msgInput").value;
    //var d =Date();
    tx.executeSql("INSERT INTO  testNote (auteur,paragraphe) VALUES(?,?)",[txt1,txt2]);
 
         })

                
         }

// Button adopter to save receive notes 

function adopter (){ 

   db.transaction(function (tx) { 
         //tx.executeSql('DROP TABLE IF EXISTS SendUserNote');
    //tx.executeSql('CREATE TABLE IF NOT EXISTS SendUserNote (Id_Note INTEGER, auteur, paragraphe,date,PRIMARY KEY(Id_Note,Auteur))'); 
        
        //var txt1=document.getElementById("loginInput").value;
        //var txt2=document.getElementById("msgInput").value;
        var b = document.getElementById('chatarea').innerText;
        document.getElementById('partager1').innerText += b ;// bien
       // dataChannel.send(val);
       tx.executeSql("INSERT INTO  testNote (paragraphe) VALUES(?)",[b]);
     
           })
    
                    
             }

//End of database
//////////////////////////////////////////////////////////////////////////

//handle messages from the server
connection.onmessage = function (message) {
   console.log("Got message", message.data);
   var data = JSON.parse(message.data);
    
   switch(data.type) {
      case "login":
         onLogin(data.success);
         // console.log("Oui alllooooooooo");
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
        /*
      myConnection= new webkitRTCPeerConnection(configuration, {
         optional: [{RtpDataChannels: true}]


 
      });
      */
     /*
      myConnection.push( myConnection= new webkitRTCPeerConnection(configuration, {
         optional: [{RtpDataChannels: true}]


 
      }));
     */

/*
    myConnection[0]= new webkitRTCPeerConnection(configuration, {
      optional: [{RtpDataChannels: true}]
   });
   myConnection[1]= new webkitRTCPeerConnection(configuration, {
      optional: [{RtpDataChannels: true}]

   });
*/
   
myConnection[0]= new webkitRTCPeerConnection(configuration, {
   optional: [{RtpDataChannels: true}]

});
   
myConnection[1]= new webkitRTCPeerConnection(configuration, {
   optional: [{RtpDataChannels: true}]

});
   
myConnection[2]= new webkitRTCPeerConnection(configuration, {
   optional: [{RtpDataChannels: true}]

});
   
myConnection[3]= new webkitRTCPeerConnection(configuration, {
   optional: [{RtpDataChannels: true}]

});
   
myConnection[4]= new webkitRTCPeerConnection(configuration, {
   optional: [{RtpDataChannels: true}]

});
   
myConnection[5]= new webkitRTCPeerConnection(configuration, {
   optional: [{RtpDataChannels: true}]

});
   
myConnection[6]= new webkitRTCPeerConnection(configuration, {
   optional: [{RtpDataChannels: true}]

});
   
myConnection[7]= new webkitRTCPeerConnection(configuration, {
   optional: [{RtpDataChannels: true}]

});

     for (let i = 0; i < myConnection.length; i++) {
    
      console.log("RTCPeerConnection object was created");
      console.log(myConnection[0]);
 
      //setup ice handling
      //when the browser finds an ice candidate we send it to another peer
      myConnection[i].onicecandidate = function (event) {
        otherUsername = otherUsernameInput.value;// test
        otherUsername=connectedUser[i]///ok?
         if (event.candidate) {
            send({
              name:otherUsername, //ajout ?
               type: "candidate",
               candidate: event.candidate
            });
         }
      }
  
        
        
     };

        openDataChannel();
        
   }

// user online or connected



};
 
connection.onopen = function () {
   console.log("Connected");
};
 
connection.onerror = function (err) {
   console.log("Got error", err);
};
 
// Alias for sending messages in JSON format


function send(message) {
   for (let i= 0; i < connectedUser.length; i++) {
     if (otherUsername===connectedUser[i]){
   //if (connectedUser[i]) {
      message.name = connectedUser[i];

   }
}
   connection.send(JSON.stringify(message));
};
//setup a peer connection with another user
connectToOtherUsernameBtn.addEventListener("click", function () {
 
   otherUsername = otherUsernameInput.value;
   connectedUser.push(otherUsername) ;
   
 
   if (otherUsername.length > 0) {
      for (let i = 0; i < myConnection.length; i++) {
         if(otherUsername===connectedUser[i]){ 

      //make an offer
      myConnection[i].createOffer(function (offer) {
         console.log();
            
         send({
            type: "offer",
            offer: offer
         });
            
         myConnection[i].setLocalDescription(offer);
      }, function (error) {
         alert("An error has occurred.");
      });
   }
   console.log("connection is established");
}
}});
 
//when somebody wants to call us
function onOffer(offer, name) {
   for (let i= 0; i <  myConnection.length; i++) {
      if (otherUsername===connectedUser[i]){
   connectedUser[i] = name;

   console.log("On offfer"+name)
   myConnection[i] .setRemoteDescription(new RTCSessionDescription(offer));
    
   myConnection[i].createAnswer(function (answer) {
      myConnection[i].setLocalDescription(answer);
      console.log(" local desc "+answer)
      send({
         type: "answer",
         answer: answer,
         name // ajout ça marche 
      });
        
   }, function (error) {
      alert("oops...error");
   });
      };

};
}



//when another user answers to our offer
function onAnswer(answer) {
   for (let i= 0; i <  myConnection.length; i++) {
     // 
      if (otherUsername===connectedUser[i] ){// ajouter  (message.name!=connectedUser[i])
        console.log("answer to offert" +answer+"quel nom"+otherUsername)
   
   myConnection[i].setRemoteDescription(new RTCSessionDescription(answer));
   console.log("answer to offert" +answer)
   
}}}
 
//when we got ice candidate from another user
function onCandidate(candidate) {
   for (let i= 0; i <  myConnection.length; i++) {
      if (otherUsername===connectedUser[i]){
        // console.log("ice candidate" +answer+"quel nom"+otherUsername)
   
   myConnection[i].addIceCandidate(new RTCIceCandidate(candidate));
   //console.log("conaection name" +candidate+"quel nom"+otherUsername)
   
       

     } 

   }

}

//creating data channel
function openDataChannel() {

   for (let i = 0; i < myConnection.length; i++) {
      
     var dataChannelOptions = {
      reliable:true
   };
    
   dataChannel[i] =  myConnection[i].createDataChannel("myDataChannel", dataChannelOptions);
    
   dataChannel[i].onerror = function (error) {
      console.log("Error:", error);
   };
    
   dataChannel[i].onmessage = function (event) {
     // console.log("Got message:", event.data);

       //when we receive a message from the other peer, display it on the screen
 
      chatArea.innerHTML += event.data + "<button type='button' onclick='adopter()'>Adopter</button><br/>";
        
  
   }

       
   };
}
  //when a user clicks the send message button

 // (si on veux que le sender voit son message aussi on peut mettre ce bout de code au dessous apres la variable (var))
 //= chatArea.innerHTML += name + ": " + val + "<br />";
sendMsgBtn.addEventListener("click", function (event) {
   console.log("send message");
   var val = msgInput.value;
   var val1= msgInput.value;
  //chatArea.innerHTML += name + ": " + val + "<button type='button' onclick='doClose()' > adopter </button><br/>";
   partager.innerHTML += name + ": " + val1+ "<br/>";
   dataChannel[i].send(val);
  // dataChannel.send(val1);
  
});