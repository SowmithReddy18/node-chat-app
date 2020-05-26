const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const wordFilter = require('bad-words');
const { getAcknowledgeMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('../src/utils/users')

const rootPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const filter = new wordFilter();

app.use(express.static(rootPath));

io.on('connection', (socket) => {
    console.log('New web socket connection');
    socket.on('join', ({ username, room }, cb) => {
        let { error, user } = addUser({ id: socket.id, name: username, room });
        socket.join(room);
        if (error) {
            return cb(error)
        }
        socket.emit('message', getAcknowledgeMessage('Chat App', 'Welcome to Chat App'));
        socket.broadcast.to(user.room).emit('message', getAcknowledgeMessage('Chat App', `${user.name} has joined!`));
        cb();
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    })
    socket.on('clientMessage', (clientMessage, cb) => {
        if (filter.isProfane(clientMessage)) {
            return cb('message contains Profane language, Failed to deliver');
        }
        let user = getUser(socket.id);
        io.to(user.room).emit('message', getAcknowledgeMessage(user.name, clientMessage));
        cb('message delivered');
    })
    socket.on('clientLocation', (clientLocation, cb) => {
        let user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', getAcknowledgeMessage(user.name, clientLocation));
        cb('location delivered');
    })
    socket.on('disconnect', () => {
        let user = removeUser(socket.id);
        io.to(user.room).emit('message', getAcknowledgeMessage('Chat App', `${user.name} has left the chat room`));
        io.to(user.room).emit('roommData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    })
})

server.listen(port, () => {
    console.log(`app started on port ${3000}`);
})