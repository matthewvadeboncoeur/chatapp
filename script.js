// script.js
document.addEventListener("DOMContentLoaded", function () {

    const addFriendButton = document.getElementById('add-friend-button');
    addFriendButton.addEventListener('click', addFriend);


    function addFriend() {
        const addFriendInput = document.getElementById('add-friend-input');
        if (addFriendInput.value == '')
            return;
        const friendsList = document.getElementById('friends-list');
        const newFriendLi = document.createElement('li');
        newFriendLi.textContent = addFriendInput.value;
        friendsList.appendChild(newFriendLi);
        addFriendInput.value = '';
    }






















});