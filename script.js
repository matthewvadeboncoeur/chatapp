// script.js
document.addEventListener("DOMContentLoaded", function () {

    let selectedFriend = null;
    const curUser = localStorage.getItem("curUser");

    const addFriendButton = document.getElementById('add-friend-button');
    addFriendButton.addEventListener('click', addFriend);

    const signUpButton = document.getElementById('signUpButton');
    signUpButton.addEventListener('click', signUp);

    const sendMessageButton = document.getElementById('message-button');
    sendMessageButton.addEventListener('click', sendMessage);





    function sendMessage() {
        const chatInput = document.getElementById('message-input');
        if (chatInput.value == '') return;
        const chatList = document.getElementById('chat-list');
        const newMessage = document.createElement('li');
        newMessage.className = 'sent';
        newMessage.textContent = chatInput.value;
        chatList.appendChild(newMessage);

        fetch('http://localhost:3000/messages', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sender: curUser,
                receiver: selectedFriend,
                text: chatInput.value
            })
        })
        .then(res => res.json())
        .then(loadMessages)
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