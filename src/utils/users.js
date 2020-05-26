const users = [];

const addUser = ({ id, name, room }) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();
    if (!name || !room) {
        return {
            error: 'username and room required'
        }
    }
    let userExists = users.find(user => user.name === name && user.room === room);
    if (userExists) {
        return {
            error: 'name already in use!'
        }
    }
    let user = { id, name, room }
    users.push(user);
    return { user };
}

const removeUser = (id) => {
    let index = users.findIndex(user => user.id === id);
    if (index != -1) {
        let user = users.splice(index, 1)[0];
        return user;
    }
    return {
        error: 'user does not exist'
    }
}
const getUser = (id) => {
    let user = users.find(user => user.id === id);
    if (user.length != 0) {
        return user;
    }
    return {
        error: 'User not found'
    }
}

const getUsersInRoom = (room) => {
    let localUsers = users.filter(user => user.room === room);
    if (localUsers.length != 0) {
        return localUsers;
    }
    return {
        error: 'Users not found'
    }
}

module.exports = {
    getUser,
    getUsersInRoom,
    addUser,
    removeUser
}