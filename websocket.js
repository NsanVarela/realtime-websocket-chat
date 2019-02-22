const Chat = require('./app/Chat')

module.exports = function(app, io) {

    // Création d'un nouvel objet Chat, pour la gestion des sockets
    const chat = new Chat(io);
    io.on('connection', (socket) => {
        chat.onConnection(socket)
    })

}