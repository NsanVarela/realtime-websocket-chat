const shortid = require('shortid')
const ent = require('ent')

class Channel {
    constructor(io, title) {
        this.id = shortid.generate() // Génère un short ID unique pour ce channel
        this.io = io
        this.title = title // Nom du channel
        this.users = [] // Chaque channel va gérer sa propre liste d'utilisateurs
        this.messages = [] // Chaque channel a sa liste de messages
    }

    addUser(user) {
        /*
            Changement de la room socket.io de ce socket.
            Pour éviter des conflits de noms de rooms sur le serveur,
            on utiliser le "short id" comme nom de room, plutôt que le title du channel
        */
        user.socket.join(this.id)
        // user.socket.emit('channel:join', this.id)

        // Changement de l'identifiant channel de l'utilisateur
        user.channelId = this.id

        // Ajout à la liste d'utilisateurs gérée par cet objet Channel
        this.users.push(user)

        // Envoi de la nouvelle liste d'utilisateurs à tous les sockets de ce channel
        this.io.to(this.id).emit('user:list', this.getUsernamesList())

        // Envoi de la liste des messages du channel à ce nouvel utilisateur
        user.socket.emit('message:list', this.messages.slice(-20))
    }

    removeUser(user) {
        let index = this.users.indexOf(user)
        if (index > -1) {
            // Le socket de l'utilisateur quitte le channel
            user.socket.leave(this.id)

            this.users.splice(index, 1)

            // La liste des utilisateurs de ce channel est mise à jour
            this.io.to(this.id).emit('user:list', this.getUsernamesList())
        }
    }

    addMessage(user, message) {
        // Sécurisation du message 
        message = ent.encode(message);

        const newMessageObj = {
            nickname: user.nickname,
            photoUrl: user.photoUrl,
            message,
            date: Date.now()
        }

        // Sauvegarde du message (et de l'utilisateur) dans le tableau de messages de ce channel
        this.messages.push(newMessageObj)

        // Envoi à tous les sockets de ce channel uniquement (y compris l'émetteur)
        this.io.to(this.id).emit('message:new', newMessageObj)
    }

    getUsernamesList() {
        return this.users.map(user => user.nickname)
    }

    destroy() {}
}

module.exports = Channel