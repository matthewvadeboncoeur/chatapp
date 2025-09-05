// script.js
import { getToken } from "./auth.js";
document.addEventListener("DOMContentLoaded", async function () {
    const token = await getToken();
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    let curUser = token.user.username;
    console.log(curUser);
    const socket = io('https://chatapp-rd3j.onrender.com', {
        auth: { token: token.accessToken }
    });
    loadFriends();
    socket.on('message', (message) => {
        const chatList = document.getElementById('chat-list');
        const newMessage = document.createElement('li');
        newMessage.textContent = message.text;
        newMessage.className = message.sender === curUser ? 'sent' : 'received';
        chatList.appendChild(newMessage);
        chatList.scrollTop = chatList.scrollHeight;
    })
    let selectedFriend = null;
    let pastEvent = null;

    const addFriendButton = document.getElementById('add-friend-button');
    addFriendButton.addEventListener('click', addFriend);


    const sendMessageButton = document.getElementById('message-button');
    sendMessageButton.addEventListener('click', sendMessage);
    


    async function sendMessage() {
        const token = await getToken();
        const chatInput = document.getElementById('message-input');
        if (chatInput.value == '') return;
        if (selectedFriend === null) return alert("Please select a friend");
        const text = chatInput.value.trim();
        const message = {sender: curUser, receiver: selectedFriend, text};
        socket.emit('send_message', message);
        chatInput.value = '';
    }


    async function loadFriends() {
        const token = await getToken();
        fetch('https://chatapp-rd3j.onrender.com/friends', {
            headers: {
                'Authorization': `Bearer ${token.accessToken}`
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('auth');
                    window.location.href = 'index.html';
                }
            }
            return response.json();
        })
        .then(data => {
            const friendsList = document.getElementById('friends-list');
            friendsList.innerHTML = '';
            for (let i = 0; i < data.length; i++) {
                const newFriendLi = document.createElement('li');
                newFriendLi.textContent = data[i];
                newFriendLi.addEventListener('click', loadFriend);
                friendsList.appendChild(newFriendLi);
            }
        })

    }


    async function addFriend() {
        const token = await getToken();
        const addFriendInput = document.getElementById('add-friend-input');
        if (addFriendInput.value == '')
            return;
        const friendsList = document.getElementById('friends-list');
        const newFriendLi = document.createElement('li');
        newFriendLi.textContent = addFriendInput.value;

        newFriendLi.addEventListener('click', loadFriend);
        addFriendInput.value = '';

        fetch('https://chatapp-rd3j.onrender.com/friends', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.accessToken}`
            },
            body: JSON.stringify({
                friend: newFriendLi.textContent
            })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message !== 'Friend added successfully')
                    alert(data.message);
                else
                    friendsList.appendChild(newFriendLi);
        })
    }

    async function loadFriend(e) {
        const token = await getToken();
        if (pastEvent) {
            pastEvent.target.classList.remove('selected-friend')
        }
        e.target.classList.add('selected-friend');
        pastEvent = e;
        selectedFriend = e.target.textContent;
        socket.emit('join_dm', { me: curUser, friend: selectedFriend });
        loadMessages();
    }


    async function loadMessages() {
        const token = await getToken();
        fetch('https://chatapp-rd3j.onrender.com/messages', {
            headers: {
                'Authorization': `Bearer ${token.accessToken}`
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.log('*');
                    localStorage.removeItem('auth');
                    window.location.href = 'index.html';
                }
            }
            return response.json();
        })
        .then(data => {
            const filtered = data.filter(msg => 
                (msg.sender === curUser && msg.receiver === selectedFriend) ||
                (msg.sender === selectedFriend && msg.receiver === curUser)
            );
            const chatBox = document.getElementById('chat-list');
            chatBox.innerHTML = '';

            filtered.forEach(msg => {
                const li = document.createElement('li');
                li.textContent = msg.text;
                li.className = msg.sender === curUser ? 'sent' : 'received';
                chatBox.appendChild(li);
            }) 
            chatBox.scrollTop = chatBox.scrollHeight;
        })
    }
});