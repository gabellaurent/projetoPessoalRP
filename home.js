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

// --- Controle de abertura do chat ---
window.chatIsOpen = false;
document.addEventListener('DOMContentLoaded', function() {
  var chatIcon = document.getElementById('chatIcon');

  chatIcon.addEventListener('click', function() {
    var chatRoot = document.getElementById('chat-root');
    // Se não existe ou foi removido, recarrega o script
    if (!chatRoot || !document.body.contains(chatRoot)) {
      var oldScript = document.querySelector('script[src="chat-embed.js"]');
      if (oldScript) oldScript.remove();
      var script = document.createElement('script');
      script.src = 'chat-embed.js';
      document.body.appendChild(script);
      return;
    }
    // Se existe mas está oculto, mostra
    if (chatRoot.style.display === 'none') {
      chatRoot.style.display = '';
      return;
    }
    // Se já está aberto, não faz nada
  });
});



function waitForSupabaseClient(callback) {
    if (window.supabaseClient && window.supabaseClient.load) {
        callback();
    } else {
        setTimeout(() => waitForSupabaseClient(callback), 50);
    }
}

waitForSupabaseClient(() => {
    window.supabaseClient.load(async (supabase) => {
        // Exibe o body após garantir que o usuário está autenticado
        async function garantirUsuarioAutenticado() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !user.id) {
                window.location.href = "https://gabellaurent.github.io/socialproject";
                return;
            }
            document.body.style.display = '';
        }
        await garantirUsuarioAutenticado();

        // Exibe/oculta o painel de perfil ao clicar no ícone de usuário
        const userIcon = document.getElementById('userIcon');
        const profilePanel = document.getElementById('profilePanel');
        const bellIcon = document.getElementById('bellIcon');
        const notificationPanel = document.getElementById('notificationPanel');

        // Busca o username SEMPRE pelo id do usuário autenticado (ignora localStorage)
        async function exibirNomeUsuarioProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user && user.id) {
                    const { data, error } = await supabase
                        .from('base-users')
                        .select('username')
                        .eq('id', user.id)
                        .single();
                    if (data && data.username) {
                        document.getElementById("profile-username").textContent = data.username;
                        // Atualiza localStorage para manter sincronizado
                        localStorage.setItem('username', data.username);
                        return;
                    }
                }
                document.getElementById("profile-username").textContent = "Usuário";
            } catch (e) {
                document.getElementById("profile-username").textContent = "Usuário";
            }
        }
        exibirNomeUsuarioProfile();

        userIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            // Fecha painel de notificações se aberto
            notificationPanel.style.display = 'none';
            profilePanel.style.display = profilePanel.style.display === 'none' ? 'block' : 'none';
        });

        bellIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            // Fecha painel de perfil se aberto
            profilePanel.style.display = 'none';
            notificationPanel.style.display = notificationPanel.style.display === 'none' ? 'block' : 'none';
        });

        // Oculta ambos os painéis se clicar fora deles
        document.addEventListener('click', function(e) {
            if (profilePanel.style.display === 'block' && !profilePanel.contains(e.target) && e.target !== userIcon && !userIcon.contains(e.target)) {
                profilePanel.style.display = 'none';
            }
            if (notificationPanel.style.display === 'block' && !notificationPanel.contains(e.target) && e.target !== bellIcon && !bellIcon.contains(e.target)) {
                notificationPanel.style.display = 'none';
            }
        });

        // Botão de logout
        document.getElementById('logout-btn').addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('username');
            // Encerra a sessão do Supabase
            supabase.auth.signOut().then(() => {
                window.location.href = 'https://gabellaurent.github.io/socialproject';
            });
        });
    });
});