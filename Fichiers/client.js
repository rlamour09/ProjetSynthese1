var connection = new WebSocket('ws://localhost:9090');
var name = "";
var loginInput = document.querySelector('#loginInput');
var loginBtn = document.querySelector('#loginBtn');
var msgInput = document.querySelector('#msgInput');
var sendMsgBtn = document.querySelector('#sendMsgBtn');
var connectedUsers = {};
var onlineUsers; 
var chatArea = document.querySelector('#chatarea');
var partager = document.querySelector('#partager');

// connection class is a helper class around simplePeer.js and it's exposed methods 
class Connection {
   constructor(remoteClient, initiator) {
       console.log(`Opening connection to ${remoteClient}`);
       this._remoteClient = remoteClient;
       this.isConnected = false;
       this._p2pConnection = new SimplePeer({
           initiator: initiator,
           trickle: false,
       });
       this._p2pConnection.on('signal', this._onSignal.bind(this));
       this._p2pConnection.on('error', this._onError.bind(this));
       this._p2pConnection.on('connect', this._onConnect.bind(this));
       this._p2pConnection.on('close', this._onClose.bind(this));
       this._p2pConnection.on('data', this._onData.bind(this));
   }


   // method callls the peers destroy method to destroy the connectopn
   destroy(){
      this._p2pConnection.destroy();
   }

   // methiod that handles the signal -> offer, answer, ice
   handleSignal(signal) {
       this._p2pConnection.signal(signal);
   }

   // send message over datachannel
   send(msg) {
       this._p2pConnection.send(msg);
   }

   // function called when it wants to send a signal
   // bind to your signalling method here. Websocket, socket.io e.t.c
   _onSignal(signal) {

      const signalData = {
         from: name,
         signal: signal,
         to: this._remoteClient,
         type: "RTCsignal"
      }
      connection.send(JSON.stringify(signalData))
   }

   _onConnect() {
       this.isConnected = true;
       console.log('connected to ' + this._remoteClient);
   }

   // when connection is closed
   // call the renderusers list, so we can see the update
   _onClose() {
       console.log(`connection to ${this._remoteClient} closed`);
       delete connectedUsers[this._remoteClient];
       renderUsers();
   }

   // when this peer recieves a message via dataChannel
   _onData(data) {
       receiveMessage(this._remoteClient, data)
   }

   _onError(error) {
       console.log(`an error occurred ${error.toString()}`);
   }
}

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

var db = openDatabase('CollaboP2PDB', '1.0', 'Application P2P Collaborative_DB', 2 * 1024 * 1024);
function insertData (user, message){ 
if(message == undefined) return false;
db.transaction(function (tx) { 
//tx.executeSql('DROP TABLE IF EXISTS testNote');
tx.executeSql("CREATE TABLE IF NOT EXISTS textNote(" + 
        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "auteur TEXT, " +
        "paragraphe TEXT, " +
        "date TIMESTAMP DEFAULT(datetime('now', 'localtime')))"
    );
   tx.executeSql("INSERT INTO  textNote (auteur,paragraphe) VALUES(?,?)",[user,message]);
 
         })

                
         }

// Button adopter to save receive notes 

function adopter (owner, message){ 

   document.getElementById('partager1').innerHTML += "<span style='color: red;'>" + message + "</span><br/>"; ;// bien
   insertData(owner, message)

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
      case "usersList":
         onlineUsers = data.users;
         // render the list of users to the UI
         renderUsers();
         // always set current users list
         break;
      case "RTCsignal":
         // data.from = sender
         // data.to = receiver
         // if intended recipient
         // if incoming user dosent have a connection details yet, must be the first attempt to create
         // create a new record before passing on the signal
         if(data.to == name){
            if (!connectedUsers[data.from]) {
               connectedUsers[data.from] = new Connection(data.from, false)
            }
            connectedUsers[data.from].handleSignal(data.signal)
            // render users, so status, connected or disconnected can be updated
            renderUsers();
         }
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
   }
   
}

// render users 

function renderUsers(){
   var list = document.getElementById('users');
   var connectedUsersKey = Object.keys(connectedUsers);
   // if it's one, I'm the only one logged in 
   // if it's 0, I'm yet to set a name
   var html = '';
   if (onlineUsers.length === 0 || onlineUsers.length === 1) {
      html += '<li> No member online </li>'
      list.innerHTML = html
      // reset to empty just in case we have dead users that were not accurately destroyed
      connectedUsers = {};
      return
  }else{
   // check all connected users. If the user just logged off, connection might not be around.
   // loop through connected users and clear dead users. 
   // so on using the same name, system dosen't wrongly label them connected.
   
   connectedUsersKey.forEach(u => {
      var index = onlineUsers.indexOf(u);
      // user was not found, must have been disconnected 
      if(index < 0){
         delete connectedUsers[u];
      }
   })
   

   // loop over all users
   for (var index = 0; index < onlineUsers.length; index++) {
      var element = onlineUsers[index]
      // verify the user isn't the logged in user
      if (element !== name) {
          var connectOrDisconnect = 'disconnected';
          var connectOrDisconnectButton = `<button onclick="initiateOrCancel('${element}')">Connect</button>`;
          // check if there is already a connection object for the user and render accordingly
          if(connectedUsers[element]){
             connectOrDisconnect = 'connected';
             connectOrDisconnectButton = `<button onclick="initiateOrCancel('${element}', true)">Disconnect</button>`;
          }
          html += `<li>${element} (${connectOrDisconnect}) ${connectOrDisconnectButton}</li>`;
      }
   }
   list.innerHTML = html
  }
}

function initiateOrCancel(clientId, disconnect){
   if(disconnect){
      // we're disconnectiong
      connectedUsers[clientId].destroy();
   }else{
      connectedUsers[clientId] = new Connection(clientId, true)
   }

}

 
connection.onopen = function () {
   console.log("Connected");
};
 
connection.onerror = function (err) {
   console.log("Got error", err);
};
 
// Alias for sending messages in JSON format


function send(message) {
   connection.send(JSON.stringify(message));
};

function receiveMessage(user, message){
   chatArea.innerHTML += user + ": " + message+ `<button onclick="adopter('${user}','${message}')">adopt</button><br/>`;
}
 
 //when a user clicks the send message button

 sendMsgBtn.addEventListener("click", function (event) {
   console.log("send message");
   var val1= msgInput.value;
   if(val1){
      partager.innerHTML += val1+ "<br/>";
      insertData(name, val1);
      // get the keys of all users currently connected to
      var usersTosend = Object.keys(connectedUsers);
      // loop over the connections and send them a message via datachannels
      usersTosend.forEach(u => {
         connectedUsers[u].send(val1);
      })
   }
   msgInput.value = '';
});