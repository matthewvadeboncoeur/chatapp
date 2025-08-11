// script.js
document.addEventListener("DOMContentLoaded", function () {
    const socket = io('http://localhost:3000');
    socket.on('message', (message) => {
        const chatList = document.getElementById('chat-list');
        const newMessage = document.createElement('li');
        newMessage.textContent = message.text;
        newMessage.className = message.sender === curUser ? 'sent' : 'received';
        chatList.appendChild(newMessage);
    })
    let selectedFriend = null;
    const curUser = localStorage.getItem("curUser");

    const addFriendButton = document.getElementById('add-friend-button');
    addFriendButton.addEventListener('click', addFriend);


    const sendMessageButton = document.getElementById('message-button');
    sendMessageButton.addEventListener('click', sendMessage);
    
    loadFriends();
    


    function sendMessage() {
        const chatInput = document.getElementById('message-input');
        if (chatInput.value == '') return;
        if (selectedFriend === null) return alert("Please select a friend");
        const chatList = document.getElementById('chat-list');
        const newMessage = document.createElement('li');
        newMessage.className = 'sent';
        newMessage.textContent = chatInput.value;
        // chatList.appendChild(newMessage);
        const text = chatInput.value.trim();
        const message = {sender: curUser, receiver: selectedFriend, text};
        socket.emit('send_message', message);
        chatInput.value = '';
    }


    function loadFriends() {
        fetch(`http://localhost:3000/friends/${curUser}`)
        .then(response => response.json())
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


    function addFriend() {
        const addFriendInput = document.getElementById('add-friend-input');
        if (addFriendInput.value == '')
            return;
        const friendsList = document.getElementById('friends-list');
        const newFriendLi = document.createElement('li');
        newFriendLi.textContent = addFriendInput.value;

        newFriendLi.addEventListener('click', loadFriend);

        friendsList.appendChild(newFriendLi);
        addFriendInput.value = '';

        fetch('http://localhost:3000/friends', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: curUser,
                friend: newFriendLi.textContent
            })
        })
    }

    function loadFriend(e) {
        selectedFriend = e.target.textContent;
        socket.emit('join_dm', { me: curUser, friend: selectedFriend });
        loadMessages();
    }


    function loadMessages() {
        fetch('http://localhost:3000/messages')
        .then(res => res.json())
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
        })
    }
});