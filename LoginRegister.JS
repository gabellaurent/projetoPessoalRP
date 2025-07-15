// LoginRegister.JS

document.addEventListener('DOMContentLoaded', function () {
    const loginBox = document.querySelector('.login-box');
    const loginRight = document.querySelector('.login-right');
    const registerLink = document.querySelector('.register-link a');

    function createRegisterForm() {
        return `
            <div class="login-title">Register</div>
            <form class="login-form">
                <input type="text" placeholder="Username" required>
                <input type="email" placeholder="Email" required>
                <input type="password" placeholder="Password" required>
                <input type="password" placeholder="Confirm Password" required>
                <button type="submit">Register</button>
            </form>
            <div class="register-link">
                Already have an account?
                <a href="#login" id="back-to-login">Login</a>
            </div>
        `;
    }

    function createLoginForm() {
        return `
            <div class="login-title">Login</div>
            <form class="login-form">
                <input type="text" placeholder="User ID" required>
                <input type="password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
            <div class="register-link">
                Don’t have an account?
                <a href="#register">Register</a>
            </div>
        `;
    }

    function showRegisterForm(e) {
        if (e) e.preventDefault();
        loginRight.innerHTML = createRegisterForm();
        attachBackToLogin();
    }

    function showLoginForm(e) {
        if (e) e.preventDefault();
        loginRight.innerHTML = createLoginForm();
        attachRegisterLink();
    }

    function attachRegisterLink() {
        const regLink = loginRight.querySelector('.register-link a');
        if (regLink) {
            regLink.addEventListener('click', showRegisterForm);
        }
    }

    function attachBackToLogin() {
        const backLink = loginRight.querySelector('#back-to-login');
        if (backLink) {
            backLink.addEventListener('click', showLoginForm);
        }
    }

    // Inicializa o evento do link Register
    attachRegisterLink();
});
