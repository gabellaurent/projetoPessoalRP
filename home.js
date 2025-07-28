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

async function ensureUsername() {
    let username = localStorage.getItem("username");
    if (!username || username.trim() === "") {
        // Tenta obter usuário autenticado
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id) {
            // Busca username na base-users
            const { data, error } = await supabase
                .from('base-users')
                .select('username')
                .eq('id', user.id)
                .single();
            if (data && data.username) {
                localStorage.setItem('username', data.username);
                // Recarrega para seguir o fluxo normal
                window.location.reload();
                return;
            }
        }
        // Se não conseguir, redireciona para login
        window.location.href = "https://gabellaurent.github.io/socialproject";
        return;
    }
    // Exibe o body após validação
    document.body.style.display = '';
}

await ensureUsername();

// Exibe/oculta o painel de perfil ao clicar no ícone de usuário
const userIcon = document.getElementById('userIcon');
const profilePanel = document.getElementById('profilePanel');
const bellIcon = document.getElementById('bellIcon');
const notificationPanel = document.getElementById('notificationPanel');

// Busca o username diretamente da tabela base-users usando o id do usuário autenticado
async function exibirNomeUsuarioProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id) {
        const { data, error } = await supabase
            .from('base-users')
            .select('username')
            .eq('id', user.id)
            .single();
        if (data && data.username) {
            document.getElementById("profile-username").textContent = data.username;
            return;
        }
    }
    document.getElementById("profile-username").textContent = "Usuário";
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

// SUPABASE: Listar usuários na sidebar
// ...já importado e criado acima...

let lastSidebarState = '';
async function listarUsuariosSidebar() {
    const sidebarUsers = document.getElementById('sidebar-users');
    // Remove 'Carregando...' se existir
    if (sidebarUsers.innerHTML.trim() === 'Carregando...') {
        sidebarUsers.innerHTML = '';
    }
    const { data, error } = await supabase
        .from('base-users')
        .select('username, lastActive');
    if (error) {
        sidebarUsers.innerHTML = '<div style="color:#e74c3c;">Erro ao carregar usuários.</div>';
        console.error('Erro ao buscar usuários:', error.message);
        return;
    }
    if (!data || data.length === 0) {
        sidebarUsers.innerHTML = '<div style="color:#b8c7d1;">Nenhum usuário encontrado.</div>';
        return;
    }
    const now = Date.now();
    // Cria um mapa do estado atual dos usuários
    const userStates = {};
    data.forEach(u => {
        let online = false;
        if (u.lastActive) {
            const lastActive = new Date(u.lastActive).getTime();
            online = (now - lastActive) < 70000;
        }
        userStates[u.username] = online ? 'online' : 'offline';
    });
    // Atualiza/adiciona/remover elementos do DOM conforme necessário
    // Mantém ordem: online primeiro, depois offline
    const sortedUsers = [
        ...data.filter(u => userStates[u.username] === 'online'),
        ...data.filter(u => userStates[u.username] === 'offline')
    ];
    // Cria um Set dos usernames atuais
    const currentUsernames = new Set(sortedUsers.map(u => u.username));
    // Remove elementos que não existem mais
    Array.from(sidebarUsers.children).forEach(child => {
        if (!currentUsernames.has(child.dataset.username)) {
            sidebarUsers.removeChild(child);
        }
    });
    // Atualiza/adiciona cada usuário
    // Remove todos os elementos antes de adicionar na ordem correta
    Array.from(sidebarUsers.children).forEach(child => {
        sidebarUsers.removeChild(child);
    });
    sortedUsers.forEach(user => {
        let div = document.createElement('div');
        div.className = 'sidebar-user';
        div.dataset.username = user.username;
        div.textContent = user.username;
        div.style.color = userStates[user.username] === 'online' ? '#fff' : '#b8c7d1';
        sidebarUsers.appendChild(div);
    });
}
listarUsuariosSidebar();

// Atualização em tempo real dos usuários registrados
supabase
  .channel('public:base-users')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'base-users' }, payload => {
    listarUsuariosSidebar();
  })
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'base-users' }, payload => {
    listarUsuariosSidebar();
  })
  .subscribe();

// Heartbeat: atualiza lastActive a cada 60s
setInterval(async () => {
    const username = localStorage.getItem('username');
    if (username) {
        // Busca o id do usuário
        const { data } = await supabase
            .from('base-users')
            .select('id')
            .eq('username', username)
            .single();
        if (data && data.id) {
            await supabase
                .from('base-users')
                .update({ lastActive: new Date().toISOString() })
                .eq('id', data.id);
        }
    }
}, 60000);

// Atualiza lastActive ao carregar a página (indica que o usuário entrou)
window.addEventListener('DOMContentLoaded', async () => {
    const username = localStorage.getItem('username');
    if (username) {
        const { data } = await supabase
            .from('base-users')
            .select('id')
            .eq('username', username)
            .single();
        if (data && data.id) {
            await supabase
                .from('base-users')
                .update({ lastActive: new Date().toISOString() })
                .eq('id', data.id);
        }
    }
    // Atualiza a sidebar imediatamente após o heartbeat inicial
    listarUsuariosSidebar();

    // Chama main-content.js para renderizar as postagens na div .main-content
    if (!window.renderMainContent) {
        const script = document.createElement('script');
        script.src = 'main-content.js';
        script.onload = function() {
            window.renderMainContent('.main-content');
        };
        document.body.appendChild(script);
    } else {
        window.renderMainContent('.main-content');
    }
});
