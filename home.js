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
  var chatRoot = document.getElementById('chat-root');
  var chatBadge = document.getElementById('chat-badge');
  // Função para resetar badge ao abrir o chat
  function resetChatBadge() {
    if (chatBadge) {
      chatBadge.style.display = 'none';
      chatBadge.textContent = '0';
    }
    // Salva o último id da mensagem lida
    supabase
      .from('meu-chat')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          localStorage.setItem('lastChatMsgId', data[0].id);
        }
      });
  }
  chatIcon.addEventListener('click', function() {
    // Só cria o chat se ele não estiver aberto
    if (window.chatIsOpen === true) {
      // Se o chat-root estiver oculto, mostra
      if (chatRoot && chatRoot.style.display === 'none') {
        chatRoot.style.display = '';
        // Não recarrega mensagens, só mostra o chat já existente
      }
      // Zera badge
      resetChatBadge();
      return;
    }
    // Zera badge imediatamente ao clicar, mesmo antes do chat renderizar
    resetChatBadge();
    if (chatRoot && (chatRoot.innerHTML.trim() === '' || chatRoot.style.display === 'none')) {
      // Remove o script antigo se existir
      var oldScript = document.querySelector('script[src="chat-embed.js"]');
      if (oldScript) oldScript.remove();
      // Cria novo script
      var script = document.createElement('script');
      script.src = 'chat-embed.js';
      document.body.appendChild(script);
      chatRoot.style.display = '';
    }
  });
});

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = 'https://xhybbhdhjaluqjrtopml.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoeWJiaGRoamFsdXFqcnRvcG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzQ5NjMsImV4cCI6MjA2ODg1MDk2M30.Xb98A6l-duDBO6G8_3SPKwluyAm-v8LH5G22ysmSXck';
const supabase = createClient(supabaseUrl, supabaseKey);


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