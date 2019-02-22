const chalk = require('chalk')

const User = require('./User')
const Channel = require('./Channel')

class Chat {
    constructor(io) {
        this.io = io
        this.channels = [] // Le système de chat va gérer un Array de channels
        this.channels.push(
            new Channel(io, 'general'),
            new Channel(io, 'gaming'),
            new Channel(io, 'programming')
        )
    }

    onConnection(socket) {
        console.log(chalk.blue('✅  Client', socket.id, 'is connected via WebSockets'))
        
        socket.once('user:init', ({nickname, photoUrl}) => {
            // Création du nouvel utilisateur
            const user = new User(socket, nickname, photoUrl)
            
            // Ajout de l'utilisateur au channel par défaut : le channel "general"
            let defaultChannel = this.getChannelByTitle('general')
            defaultChannel.addUser(user)
            // Envoi de l'événement "init" à l'utilisateur qui vient de se connecter, avec diverses informations
            socket.emit('init', {
                channelsList: this.getChannelsList(),
                userChannelId: user.channelId
            })

            // Mise en place des écouteurs d'événement sur ce socket
            socket.on('message:new', (message) => this._onNewMessage(user, message))
            socket.on('disconnect', () => this._onUserDisconnect(user))
            socket.on('notify:typing', () => this._onNotifyTyping(user))
            socket.on('channel:change', (channelId) => this._onChangeChannel(user, channelId))
        })
    }

    _onChangeChannel(user, channelId) {
        const oldChannel = this.getChannelById(user.channelId)
        const newChannel = this.getChannelById(channelId)

        if (!(oldChannel instanceof Channel) || !(newChannel instanceof Channel)) {
            return console.warn(chalk.yellow(`_onChangeChannel : Channel(s) invalide(s)`))
        }

        // Vérification si l'user n'est pas déjà dans ce channel
        if (newChannel.users.includes(user)) {
            return console.warn(chalk.yellow(`_onChangeChannel : L'utilisateur ${user.nickname} se trouve déjà dans le channel ${newChannel.title}`))
        }

        oldChannel.removeUser(user)
        newChannel.addUser(user)
    }

    _onNotifyTyping(user) {
        user.socket.broadcast.to(user.channelId).emit('notify:typing', user.nickname)
    }

    _onUserDisconnect(user) {
        // Récupération du channel depuis lequel l'utilisateur s'est déconnecté, pour y mettre à jour la liste
        let userChannel = this.getChannelById(user.channelId)
        userChannel.removeUser(user)
        user.destroy()
    }

    _onNewMessage(user, message) {
        const userChannel = this.getChannelById(user.channelId)
        userChannel.addMessage(user, message)
    }

    // Méthode qui retourne un tableau composé uniquement des titres et IDs uniques des channels
    getChannelsList() {
        return this.channels.map(channel => ({
            id: channel.id,
            title: channel.title
        }))
    }
    // Récupère un objet Channel via son titre
    getChannelByTitle(title) {
        return this.channels.find(channel => channel.title === title)
    }
    // Récupère un objet Channel via son ID
    getChannelById(id) {
        return this.channels.find(channel => channel.id === id)
    }
}

module.exports = Chat
