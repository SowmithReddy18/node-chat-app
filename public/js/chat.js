const socket = io();

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });
console.log(username, room);

socket.on('message', ({ username, message, createdAt }) => {
    const html = Mustache.render(messageTemplate$, {
        username,
        message,
        createdAt: moment(createdAt).format('h:mm a')
    });
    messages$.insertAdjacentHTML('beforeend', html);
    scrollToLatest();
})
socket.on('locationMessage', ({ username, message, createdAt }) => {
    const html = Mustache.render(locationTemplate$, {
        message,
        username,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    messages$.insertAdjacentHTML('beforeend', html);
    scrollToLatest();
})
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sideBarTemplate$, {
        room,
        users
    });
    sideBar$.innerHTML = html;
})

const messageForm$ = document.querySelector('#messageForm');
const locationBtn$ = document.querySelector('#sendLoc');
const messages$ = document.querySelector('#messages');
const sideBar$ = document.querySelector('#sideBar');

//templates
const messageTemplate$ = document.querySelector('#message-template').innerHTML;
const locationTemplate$ = document.querySelector('#location-template').innerHTML;
const sideBarTemplate$ = document.querySelector('#sideBar-template').innerHTML;

messageForm$.addEventListener('submit', (e) => {
    e.preventDefault();
    messageForm$.send.setAttribute('disabled', true);
    socket.emit('clientMessage', messageForm$.messageBox.value, (message) => {
        messageForm$.messageBox.value = '';
        messageForm$.messageBox.focus();
        messageForm$.send.removeAttribute('disabled');
    });
})
locationBtn$.addEventListener('click', () => {
    locationBtn$.setAttribute('disabled', true);
    navigator.geolocation.getCurrentPosition((location) => {
        socket.emit('clientLocation', `https://google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`, (message) => {
            console.log(message);
            locationBtn$.removeAttribute('disabled');
        });
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        console.log(error);
    }
});

//scrolling handler
const scrollToLatest = () => {
    if ($('#messageForm').offset().top - $('#messages').children().last().offset().top > 0)
        $("#messages").animate({
            scrollTop: $('#messages')[0].scrollHeight
        })
}