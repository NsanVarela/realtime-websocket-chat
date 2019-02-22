'use strict';

// Initialize Firebase
var config = {
    apiKey: "AIzaSyDgJ8p5w8Wxer1X8YWjOUJpZmTZ2v5FJA4",
    authDomain: "realtime-tchat.firebaseapp.com",
    databaseURL: "https://realtime-tchat.firebaseio.com",
    projectId: "realtime-tchat",
    storageBucket: "realtime-tchat.appspot.com",
    messagingSenderId: "1003266369910"
};
firebase.initializeApp(config);

$('#loginGoogle').on('click', (event) => {
    event.preventDefault()
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        
        console.log('Logged!', token, user);

        $('.row#login').addClass('d-none'); 
        $('.row#chat').removeClass('d-none');

        // Instanciation d'un nouvel objet Client
        const client = new Client(user.displayName, user.photoURL);
        
        client.init();
        
    }).catch((error) => alert(error.message));
});

