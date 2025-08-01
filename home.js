window.addEventListener('DOMContentLoaded', function() {
    // Verifica sessão ativa do Supabase antes de carregar o conteúdo
    function checkAuthAndContinue(callback) {
        function proceed(client) {
            client.auth.getUser().then(({ data }) => {
                if (!data.user || !data.user.id) {
                    window.location.href = 'index.html';
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
        // Adiciona funcionalidade ao menu da sidebar
        const btnRoleplays = document.getElementById('menu-roleplays');
        if (btnRoleplays) {
            btnRoleplays.addEventListener('click', function(e) {
                e.preventDefault();
                const feedContent = document.getElementById('feed-content');
                if (feedContent) {
                    feedContent.style.display = 'none';
                    feedAtivo = false;
                }
            });
        }
        const btnFeed = document.getElementById('menu-feed');
        if (btnFeed) {
            btnFeed.addEventListener('click', function(e) {
                e.preventDefault();
                const feedContent = document.getElementById('feed-content');
                if (feedContent && !feedAtivo) {
                    feedContent.style.display = 'block';
                    feedAtivo = true;
                }
            });
        }
    }).catch(() => {
        showMainContentWhenReady();
    });

});

    }); // Fim do checkAuthAndContinue