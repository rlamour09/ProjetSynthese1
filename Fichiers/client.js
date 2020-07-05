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
var partager = document.querySelector('#partager');
var displayData = document.querySelector('#displayData');


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
 
/////////// Test test test test test test  test test test /////////////////////////////////////////////////////////////////////////

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

// Display data from the database 

function alldetails()  
{  
    db.transaction(function (tx) {  
        tx.executeSql('SELECT * FROM testNote', [], function (tx, results) {  
            var len = results.rows.length, i;  
            // document.getElementById("tblGrid").innerHTML = '';  
            //$("#tblGrid").find("tr:gt(0)").remove();  
            var str = '';  
            for (i = 0; i < len; i++) {  
                str += "<tr>";  
                str += "<td>" + results.rows.item(i).id + "</td>";  
                str += "<td>" + results.rows.item(i).auteur + "</td>";  
                str += "<td>" + results.rows.item(i).paragraphe + "</td>";  
                str += "<td>" + results.rows.item(i).date + "</td>";  
                str += "</tr>";  
                document.getElementById("displayData").innerHTML += str;  
                str = '';  
            }  
        }, null);  
    });  

}  


// Button adopter to save receive notes 

function adopter (){ 

   // db.transaction(function (tx) { 
       
    //tx.executeSql('DROP TABLE IF EXISTS SendUserNote');
    //tx.executeSql('CREATE TABLE IF NOT EXISTS SendUserNote (Id_Note INTEGER, auteur, paragraphe,date,PRIMARY KEY(Id_Note,Auteur))'); 
        
        //var txt1=document.getElementById("loginInput").value;
        //var txt2=document.getElementById("msgInput").value;
        var b = document.getElementById('chatarea').innerText;
        document.getElementById('partager').innerHTML += b + "<br/>";
       // dataChannel.send(val);
       // tx.executeSql('INSERT INTO  SendUserNote VALUES ("'+idParagraphe+'","'+txt1+'", "'+txt2+'","'+d+'")'); 
     
         //    })
    
                    
             }

/*
function displayResults(transaction, results) {
   for (var i = 0; i < results.rows.length; i++) {
     var item = results.rows.items(i);
     $('#displayData').append('<li>' + item.firstName + ' ' + item.lastName + '</li>');
   }
 }
 
 var db = openDatabase('library', '2.0', 'My library', 5 * 1024 * 1024);
 db.transaction(function(tx) {
     tx.executeSql("SELECT * FROM authors", [], displayResults)
 });
 */
  
/////////////////////////////////test test test test ///////////////////////////////////////////

// create the database to save send messages
/*
var db = openDatabase('TextColab', '1.0', 'Test DB', 2 * 1024 * 1024); 
  
function insertData (){ 

db.transaction(function (tx) { 
tx.executeSql('CREATE TABLE IF NOT EXISTS SendUserNote (Id_Note INTEGER, auteur, paragraphe,date,PRIMARY KEY(Id_Note,Auteur))'); 
    idParagraphe++;
    var txt1=document.getElementById("loginInput").value;
    var txt2=document.getElementById("msgInput").value;
    var d =Date();
    tx.executeSql('INSERT INTO  SendUserNote VALUES ("'+idParagraphe+'","'+txt1+'", "'+txt2+'","'+d+'")'); 
 
         })

                
         }
*/

   
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
   console.log("connection is established");
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
     // console.log("Got message:", event.data);

       //when we receive a message from the other peer, display it on the screen
 
      chatArea.innerHTML += connectedUser + ": " + event.data + "<button type='button' onclick='adopter()'>Adopter</button><br/>";
        
  
  
          
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
   dataChannel.send(val);
  // dataChannel.send(val1);
  
});