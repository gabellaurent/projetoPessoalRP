// LoginRegister.JS
// Torna a <div class="login-box"> interativa para alternar entre login e registro

document.addEventListener('DOMContentLoaded', function() {
    const loginBox = document.querySelector('.login-box');

    function renderLogin() {
        loginBox.innerHTML = `
            <div class="login-left">
                <div class="login-left-text">
                    Your world,<br>
                    your character,<br>
                    your story.<br>
                    Start RP now.
                </div>
            </div>
            <div class="login-right">
                <div class="login-title">Login</div>
                <form class="login-form">
                    <input type="text" placeholder="User ID" required>
                    <input type="password" placeholder="Password" required>
                    <button type="submit">Login</button>
                </form>
                <div class="register-link">
                    Don’t have an account?
                    <a href="#register" id="register-link">Register</a>
                </div>
            </div>
        `;
        attachRegisterHandler();
    }

    function renderRegister() {
        loginBox.innerHTML = `
            <div class="login-left">
                <div class="login-left-text">
                    Create your account<br>
                    and start your story!
                </div>
            </div>
            <div class="login-right">
                <div class="login-title">Register</div>
                <form class="login-form">
                    <input type="text" placeholder="User ID" required>
                    <input type="email" placeholder="Email" required>
                    <input type="password" placeholder="Password" required>
                    <input type="password" placeholder="Confirm Password" required>
                    <button type="submit">Register</button>
                </form>
                <div class="register-link">
                    Already have an account?
                    <a href="#login" id="login-link">Login</a>
                </div>
            </div>
        `;
        attachLoginHandler();
    }

    function attachRegisterHandler() {
        const registerLink = document.getElementById('register-link');
        if (registerLink) {
            registerLink.addEventListener('click', function(e) {
                e.preventDefault();
                renderRegister();
            });
        }
    }

    function attachLoginHandler() {
        const loginLink = document.getElementById('login-link');
        if (loginLink) {
            loginLink.addEventListener('click', function(e) {
                e.preventDefault();
                renderLogin();
            });
        }
    }

    // Inicializa com o formulário de login
    renderLogin();
});
