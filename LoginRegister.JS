// LoginRegister.JS

document.addEventListener('DOMContentLoaded', function () {
    // Importação dinâmica do módulo de login
    let autenticarUsuario;
    import('./login-supabase.js').then(mod => {
        autenticarUsuario = mod.autenticarUsuario;
    });
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
            <form class="login-form" id="loginForm">
                <input type="text" id="loginUsername" placeholder="User ID" required>
                <input type="password" id="loginPassword" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
            <div class="register-link">
                Don’t have an account?
                <a href="#register">Register</a>
            </div>
            <div id="loginError" style="color:#e74c3c;margin-top:10px;"></div>
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
        attachLoginSubmit();
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

    // Inicializa o evento do link Register e submit do login
    attachRegisterLink();
    attachLoginSubmit();

    function attachLoginSubmit() {
        const loginForm = loginRight.querySelector('#loginForm');
        if (!loginForm) return;
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const username = loginForm.querySelector('#loginUsername').value.trim();
            const password = loginForm.querySelector('#loginPassword').value;
            const errorDiv = loginRight.querySelector('#loginError');
            if (!autenticarUsuario) {
                errorDiv.textContent = 'Sistema de login não carregado.';
                return;
            }
            const result = await autenticarUsuario(username, password);
            if (result.sucesso) {
                window.location.href = 'home.html';
            } else {
                errorDiv.textContent = result.mensagem;
            }
        });
    }
});
