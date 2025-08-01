        // Função para remover o editor de postagem do main-content
        const removeCriarPostagem = () => {
            document.querySelector('.criar-postagem-container')?.remove();
        };
    // Garante que o botão 'Carregar mais' fique sempre no final do main-content
    function posicionarBotaoCarregarMais() {
        const mainContent = document.getElementById('main-content');
        const btn = document.getElementById('btn-carregar-mais');
        if (mainContent && btn) {
            mainContent.appendChild(btn);
        }
    }
window.addEventListener('DOMContentLoaded', function() {
    // Verifica sessão ativa do Supabase antes de carregar o conteúdo
    function checkAuthAndContinue(callback) {
        function proceed(client) {
            client.auth.getUser().then(({ data }) => {
                if (!data.user || !data.user.id) {
                    window.location.href = 'https://gabellaurent.github.io/socialproject/index.html';
                } else {
                    callback();
                }
            });
        }
        if (window.supabaseClient && typeof window.supabaseClient.load === 'function') {
            window.supabaseClient.load(proceed);
        } else {
            var script = document.createElement('script');
            script.src = 'supabaseClient.js';
            script.onload = function() {
                window.supabaseClient.load(proceed);
            };
            document.head.appendChild(script);
        }
    }

    checkAuthAndContinue(function() {
    // Mostrar/ocultar painel de perfil ao clicar no ícone de usuário
    var userIcon = document.getElementById('userIcon');
    var profilePanel = document.getElementById('profilePanel');
    if (userIcon && profilePanel) {
        userIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            if (profilePanel.style.display === 'none' || profilePanel.style.display === '') {
                profilePanel.style.display = 'block';
            } else {
                profilePanel.style.display = 'none';
            }
        });
        // Oculta o painel se clicar fora dele
        document.addEventListener('click', function(e) {
            if (profilePanel.style.display === 'block' && !profilePanel.contains(e.target) && e.target !== userIcon) {
                profilePanel.style.display = 'none';
            }
        });
    }
    // Função para logout do Supabase
    function setupLogout() {
        var logoutBtn = document.getElementById('logout-btn');
        if (!logoutBtn) return;
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.supabaseClient && typeof window.supabaseClient.load === 'function') {
                window.supabaseClient.load(async function(client) {
                    await client.auth.signOut();
                    window.location.href = 'index.html';
                });
            } else {
                // Se supabaseClient não estiver carregado, injeta o script
                var script = document.createElement('script');
                script.src = 'supabaseClient.js';
                script.onload = function() {
                    window.supabaseClient.load(async function(client) {
                        await client.auth.signOut();
                        window.location.href = 'index.html';
                    });
                };
                document.head.appendChild(script);
            }
        });
    }
    setupLogout();
    var hideLoader = function() {
        var loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
    };
    var showMainContentWhenReady = function() {
        var mainContent = document.querySelector('.main-content');
        var checkReady = function() {
            if (mainContent && mainContent.children.length > 0) {
                hideLoader();
            } else {
                setTimeout(checkReady, 50);
            }
        };
        checkReady();
    };
    // Importa dinamicamente a função renderPostagensFeed do postagensFeed.js
    let feedAtivo = true;
    import('./postagensFeed.js').then(module => {
        module.renderPostagensFeed();
        showMainContentWhenReady();
        posicionarBotaoCarregarMais();
        // Adiciona funcionalidade ao menu da sidebar
        const btnRoleplays = document.getElementById('menu-roleplays');
        if (btnRoleplays) {
            btnRoleplays.addEventListener('click', function(e) {
                e.preventDefault();
                removeCriarPostagem();
                const feedContent = document.getElementById('feed-content');
                if (feedContent) feedContent.style.display = 'none';
                feedAtivo = false;
                document.getElementById('personagens-content')?.remove();
                document.getElementById('plots-content')?.remove();
                import('./meusRoleplays.js').then(module => {
                    module.renderRoleplays();
                    posicionarBotaoCarregarMais();
                });
            });
        }

        // Adiciona funcionalidade ao botão 'Criar Postagem'
        const btnCriarPostagem = document.getElementById('criarPostagemBtn');
        if (btnCriarPostagem) {
            btnCriarPostagem.addEventListener('click', function(e) {
                e.preventDefault();
                removeCriarPostagem();
                const feedContent = document.getElementById('feed-content');
                if (feedContent) feedContent.style.display = 'none';
                feedAtivo = false;
                document.getElementById('roleplays-content')?.remove();
                document.getElementById('personagens-content')?.remove();
                document.getElementById('plots-content')?.remove();
                import('./criarPostagem.js').then(module => {
                    module.criarEditorPostagem('main-content');
                    // Esconde o botão 'Carregar mais' ao abrir o editor de postagem
                    const btnCarregarMais = document.getElementById('btn-carregar-mais');
                    if (btnCarregarMais) btnCarregarMais.style.display = 'none';
                });
            });
        }
        const btnPersonagens = document.getElementById('menu-personagens');
        if (btnPersonagens) {
            btnPersonagens.addEventListener('click', function(e) {
                e.preventDefault();
                removeCriarPostagem();
                const feedContent = document.getElementById('feed-content');
                if (feedContent) feedContent.style.display = 'none';
                feedAtivo = false;
                document.getElementById('roleplays-content')?.remove();
                document.getElementById('plots-content')?.remove();
                import('./Personagens.js').then(module => {
                    module.renderPersonagens();
                    posicionarBotaoCarregarMais();
                });
            });
        }
        const btnPlots = document.getElementById('menu-plots');
        if (btnPlots) {
            btnPlots.addEventListener('click', function(e) {
                e.preventDefault();
                removeCriarPostagem();
                const feedContent = document.getElementById('feed-content');
                if (feedContent) feedContent.style.display = 'none';
                feedAtivo = false;
                document.getElementById('roleplays-content')?.remove();
                document.getElementById('personagens-content')?.remove();
                import('./meusPlots.js').then(module => {
                    module.renderPlots();
                    posicionarBotaoCarregarMais();
                });
            });
        }
        const btnFeed = document.getElementById('menu-feed');
        if (btnFeed) {
            btnFeed.addEventListener('click', function(e) {
                e.preventDefault();
                removeCriarPostagem();
                const feedContent = document.getElementById('feed-content');
                if (feedContent) {
                    feedContent.style.display = 'block';
                    feedAtivo = true;
                }
                posicionarBotaoCarregarMais();
            });
        }
    }).catch(() => {
        showMainContentWhenReady();
    });

});

    }); // Fim do checkAuthAndContinue