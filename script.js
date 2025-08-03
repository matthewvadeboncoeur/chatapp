// script.js
document.addEventListener("DOMContentLoaded", function () {

    const addFriendButton = document.getElementById('add-friend-button');
    const addFriendInput = document.getElementById('add-friend-input');

    addFriendButton.addEventListener('click', addFriend);


    function addFriend() {
        const addFriendInput = document.getElementById('add-friend-input');
        const friendsList = document.getElementById('friends-list');
        const newFriendLi = document.createElement('li');
        newFriendLi.textContent = addFriendInput.value;
        friendsList.appendChild(newFriendLi);
        addFriendInput.value = '';

    }






















});