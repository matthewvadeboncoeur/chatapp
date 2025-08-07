// auth.js

const authButtons = document.getElementById('auth-buttons');

const logInButton = document.getElementById('logIn');
const signUpButton = document.getElementById('signUp');

const logInForm = document.getElementById('logInDiv');
const signUpForm = document.getElementById('signUpDiv');

const nextSign = document.getElementById('nextSign');
nextSign.addEventListener('click', signUn);

const nextLog = document.getElementById('nextLog');
nextLog.addEventListener('click', logIn)

logInButton.addEventListener('click', func1);
signUpButton.addEventListener('click', func2);

function func1() {
    logInForm.classList.remove('hidden');
    signUpForm.classList.add('hidden');
    authButtons.classList.add('hidden');
    logInForm.classList.add('flex')
}

function func2() {
    logInForm.classList.add('hidden');
    signUpForm.classList.remove('hidden');
    signUpForm.classList.add('flex')
    authButtons.classList.add('hidden');
}


function logIn() {
    const username = document.getElementById('usernameL');
    const password = document.getElementById('passwordL');
    if (!username.value || !password.value) return;
    fetch('http://localhost:3000/login', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username.value,
            password: password.value,
        })
    })
    .then(res => {
        return res.json();
    })
    .then(data => {
        if (data.message === 'Log-in successful!') {
            window.location.href = 'chat.html';
            localStorage.setItem("curUser", username.value);
        } else {
            alert(data.message);
        }
    })
}


function signUn() {
    const username = document.getElementById('usernameS');
    const password = document.getElementById('passwordS');
    if (!username.value || !password.value) return;
    fetch('http://localhost:3000/signup', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username.value,
            password: password.value,
        })
    })
    .then(res => {
        return res.json();
    })
    .then(data => {
        if (data.message === 'Sign-up successful!') {
            window.location.href = 'chat.html';
            localStorage.setItem("curUser", username.value);
        } else {
            alert(data.message);
        }
    })
}
