// auth.js
document.addEventListener("DOMContentLoaded", () => {

const authButtons = document.getElementById('auth-buttons');

const logInButton = document.getElementById('logIn');
const signUpButton = document.getElementById('signUp');

const logInForm = document.getElementById('logInDiv');
const signUpForm = document.getElementById('signUpDiv');

const nextSign = document.getElementById('nextSign');
if (nextSign) nextSign.addEventListener('click', signUp);

const nextLog = document.getElementById('nextLog');
if (nextLog) nextLog.addEventListener('click', logIn);

if (logInButton) logInButton.addEventListener('click', func1);
if (signUpButton) signUpButton.addEventListener('click', func2);

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
    fetch('https://chatapp-rd3j.onrender.com/login', {
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
            localStorage.setItem("auth", JSON.stringify({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                user: { username: username.value }
            }));
            window.location.href = 'chat.html';
        } else {
            alert(data.message);
        }
    }
    )
}


function signUp() {
    const username = document.getElementById('usernameS');
    const password = document.getElementById('passwordS');
    if (!username.value || !password.value) return;
    fetch('https://chatapp-rd3j.onrender.com/signup', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username.value,
            password: password.value,
            friends: []
        })
    })
    .then(res => {
        return res.json();
    })
    .then(data => {
        if (data.message === 'Sign-up successful!') {
            localStorage.setItem("auth", JSON.stringify({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                user: { username: username.value }
            }));
            window.location.href = 'chat.html';
        } else {
            alert(data.message);
        }
    })
}



})

export async function getToken() {
    const auth = JSON.parse(localStorage.getItem('auth'));
    if (!auth) return null;
    const { accessToken, refreshToken } = auth;
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    if (!isExpired) return auth;
    const res = await fetch('https://chatapp-rd3j.onrender.com/refresh', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify( {token: refreshToken })
    });

    if (!res.ok) {
        localStorage.removeItem('auth');
        window.location.href = 'index.html';
        return;
    }

    const data = await res.json();
    auth.accessToken = data.accessToken;
    localStorage.setItem('auth', JSON.stringify(auth))
    return auth;
}