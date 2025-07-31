// Carrega main-content.js automaticamente ao abrir o site
window.addEventListener('DOMContentLoaded', function() {
    if (!window.renderMainContent) {
        var oldScript = document.querySelector('script[src="main-content.js"]');
        if (oldScript) oldScript.remove();
        var script = document.createElement('script');
        script.src = 'main-content.js';
        script.onload = function() {
            if (window.renderMainContent) window.renderMainContent('.main-content');
        };
        document.body.appendChild(script);
    } else {
        window.renderMainContent('.main-content');
    }

    // Adiciona event listener para o botão Criar Postagem
    var criarBtn = document.getElementById('criarPostagemBtn');
    if (criarBtn) {
        criarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Limpa a área main-content
            var mainContentArea = document.querySelector('.main-content');
            if (mainContentArea) {
                while (mainContentArea.firstChild) {
                    mainContentArea.removeChild(mainContentArea.firstChild);
                }
            }
            // Carrega criar-postagem.js se necessário
            if (!window.renderCriarPostagem) {
                var oldScript = document.querySelector('script[src="criar-postagem.js"]');
                if (oldScript) oldScript.remove();
                var script = document.createElement('script');
                script.src = 'criar-postagem.js';
                script.onload = function() {
                    if (window.renderCriarPostagem) window.renderCriarPostagem('.main-content');
                };
                document.body.appendChild(script);
            } else {
                window.renderCriarPostagem('.main-content');
            }
        });
    }
});

// ...existing code...