// Chat Supabase em 1 arquivo JS autossuficiente
// Chat Supabase em 1 arquivo JS autossuficiente
(function() {
  // Monitorar clique no ícone do chat
  document.addEventListener('DOMContentLoaded', function() {
    function initChat() {
      window.supabaseClient.load(function(supabase) {
        mountChat(supabase);
        var chatRoot = document.getElementById('chat-root');
        if (chatRoot) chatRoot.style.display = 'none';
      });
      var chatIcon = document.getElementById('chatIcon');
      if (chatIcon) {
        chatIcon.addEventListener('click', function() {
          var chatRoot = document.getElementById('chat-root');
          if (chatRoot) {
            chatRoot.style.display = '';
            document.body.style.overflow = 'hidden';
          }
        });
      }
    }
    if (window.supabaseClient && typeof window.supabaseClient.load === 'function') {
      initChat();
    } else {
      var script = document.createElement('script');
      script.src = 'supabaseClient.js';
      script.onload = initChat;
      document.head.appendChild(script);
    }
  });
  // Carrega o supabase-js dinamicamente
  function loadSupabase(callback) {
    if (window.supabaseClient) return callback();
    if (window.supabase) return callback();
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js';
    script.onload = callback;
    document.head.appendChild(script);
  }

  // CSS do chat
  var css = `
    /* body removido */
    #chat-root { position:fixed; bottom:0; right:0; width:420px; height:800px; z-index:9999; }
    .resize-handle {
      position: absolute;
      width: 22px;
      height: 22px;
      left: 2px;
      top: 2px;
      cursor: nw-resize;
      z-index: 10000;
      background: linear-gradient(225deg, #23272a 60%, #5865f2 100%);
      border-radius: 4px;
      opacity: 0.7;
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
    }
    .resize-handle:after {
      content: '';
      display: block;
      width: 14px;
      height: 14px;
      border-left: 2px solid #fff;
      border-top: 2px solid #fff;
      margin: 2px 0 0 2px;
      opacity: 0.7;
    }
    .chat-wrapper { width:100%; height:100%; display:flex; align-items:center; justify-content:center; }
    .container { background:#36393f; padding:0; border-radius:12px; width:100%; height:100%; box-shadow:0 2px 24px 0 rgba(0,0,0,0.25); display:flex; flex-direction:column; overflow:hidden; }
    h1 { color: #fff; font-size: 1.4rem; font-weight: 600; background: #10151a; margin: 0; padding: 18px 0 12px 0; border-radius: 12px 12px 0 0; letter-spacing: 1px; width: 100%; box-sizing: border-box; text-align: center; border-bottom: 1px solid #2d3b49; }
    .user-box { background: #23272a; padding: 10px 16px 8px 16px; border-bottom: 1px solid #222; width: 100%; box-sizing: border-box; }
    #usuario { width: 100%; padding: 8px 10px; border-radius: 6px; border: none; background: #40444b; color: #fff; font-size: 1rem; outline: none; box-sizing: border-box; }
    .chat-box { flex: 1 1 0; min-height: 0; overflow-y: auto; background: #10151a; padding: 18px 10px 10px 10px; margin-bottom: 0 !important; }
    .chat-list { list-style: none; padding: 0; margin: 0; }
    .chat-msg { color: #dcddde; margin-bottom: 12px; padding: 10px 14px 8px 14px; border-radius: 8px; text-align: left; position: relative; word-break: break-word; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.08); transition: background 0.2s; }
    .chat-msg:last-child { margin-bottom: 0; }
    .chat-msg .user { color: #00b0f4; font-weight: 600; margin-right: 8px; font-size: 1rem; }
    .chat-msg .hora { color: #72767d; font-size: 0.85rem; float: right; }
    .chat-msg .texto { display: block; margin-top: 2px; font-size: 1.05rem; color: #dcddde; }
    .input-box { display: flex; align-items: flex-end; background: #10151a; padding: 14px 12px 14px 12px; border-radius: 0 0 12px 12px; gap: 8px; }
    #mensagem { flex: 1; min-height: 38px; max-height: 80px; resize: none; border-radius: 6px; border: none; background: #40444b; color: #fff; font-size: 1rem; padding: 8px 10px; outline: none; margin-right: 4px; }
    #enviar { background: #5865f2; color: #fff; border: none; border-radius: 6px; padding: 10px 18px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    #enviar:hover { background: #4752c4; }
    ::-webkit-scrollbar { width: 8px; background: #10151a; }
    ::-webkit-scrollbar-thumb { background: #40444b; border-radius: 4px; }
    .erro-usuario { border: 2px solid #ff5555 !important; box-shadow: 0 0 0 2px #ff555588; background: #3a2323 !important; color: #fff !important; }
    .erro-usuario::placeholder { color: #ff5555 !important; opacity: 1; }

  `;

  function mountChat(supabase) {
    window.chatIsOpen = true;
    // Adiciona o CSS
    var style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    // Permite renderizar dentro de uma div com id="chat-root", se existir
    var root = document.getElementById('chat-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'chat-root';
      document.body.appendChild(root);
    }
    // Só monta o chat se ainda não existe .chat-wrapper (evita recarregar mensagens)
    if (root.querySelector('.chat-wrapper')) {
      // Chat já está montado, só esconde
      root.style.display = 'none';
      return;
    }
    root.innerHTML = '';
    var wrapper = document.createElement('div');
    wrapper.className = 'chat-wrapper';
    // Nova aba de título com botão 'x' e handle de resize
    wrapper.innerHTML = `
      <div class="container" style="position:relative;">
        <div class="chat-tab" style="position:relative;display:flex;align-items:center;justify-content:center;background:#10151a;border-radius:12px 12px 0 0;border-bottom:1px solid #2d3b49;padding:0;">
          <h1 style="color:#fff;font-size:1.4rem;font-weight:600;letter-spacing:1px;margin:0;padding:18px 0 12px 0;width:100%;text-align:center;">World Chat</h1>
          <button id="close-chat" style="position:absolute;top:8px;right:16px;background:none;border:none;color:#fff;font-size:1.3rem;cursor:pointer;padding:0 8px;line-height:1;font-weight:bold;">&times;</button>
        </div>
        <!-- Campo de identificação removido, usuário será pego do localStorage -->
        <div class="chat-box">
          <ul id="chat" class="chat-list"></ul>
        </div>
        <div class="input-box">
          <textarea id="mensagem" placeholder="Digite sua mensagem..." maxlength="500"></textarea>
          <button id="enviar">Enviar</button>
        </div>
        <div class="resize-handle" id="resize-handle"></div>
      </div>
    `;
    root.appendChild(wrapper);
    // Redimensionamento da janela do chat
    (function enableResize() {
      const chatRoot = document.getElementById('chat-root');
      const handle = document.getElementById('resize-handle');
      if (!chatRoot || !handle) return;
      let isResizing = false;
      let startX, startY, startWidth, startHeight;
      const minWidth = 320, minHeight = 400, maxWidth = 900, maxHeight = 1200;
      handle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(chatRoot).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(chatRoot).height, 10);
        document.documentElement.style.userSelect = 'none';
      });
      document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        // Mantém o canto inferior direito fixo (igual Reddit)
        let deltaX = e.clientX - startX;
        let deltaY = e.clientY - startY;
        let newWidth = Math.min(Math.max(startWidth - deltaX, minWidth), maxWidth);
        let newHeight = Math.min(Math.max(startHeight - deltaY, minHeight), maxHeight);
        // Garante que não ultrapasse a viewport
        newWidth = Math.min(newWidth, window.innerWidth);
        newHeight = Math.min(newHeight, window.innerHeight);
        chatRoot.style.width = newWidth + 'px';
        chatRoot.style.height = newHeight + 'px';
        // Mantém sempre ancorado no canto inferior direito
        chatRoot.style.right = '0';
        chatRoot.style.bottom = '0';
        chatRoot.style.left = '';
        chatRoot.style.top = '';
      });
      document.addEventListener('mouseup', function() {
        if (isResizing) {
          isResizing = false;
          document.documentElement.style.userSelect = '';
        }
      });
    })();
    // Botão 'x' para fechar
    var closeBtn = wrapper.querySelector('#close-chat');
    if (closeBtn) {
      closeBtn.onclick = function() {
        if (root) {
          root.style.display = 'none';
        }
        window.chatIsOpen = false;
        document.body.style.overflow = '';
      };
    }
    const chat = document.getElementById('chat');
    const chatBox = document.querySelector('.chat-box');
    // const usuarioInput = document.getElementById('usuario'); // Removido
    const mensagemInput = document.getElementById('mensagem');
    const enviarBtn = document.getElementById('enviar');

    function mostrarMensagem(msg) {
      const li = document.createElement('li');
      li.className = 'chat-msg';
      li.dataset.id = msg.id;
      const data = new Date(msg.created_at);
      const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const hoje = new Date();
      const ontem = new Date();
      ontem.setDate(hoje.getDate() - 1);
      // Zera horas para comparar só o dia
      hoje.setHours(0,0,0,0);
      ontem.setHours(0,0,0,0);
      const dataMsg = new Date(data.getFullYear(), data.getMonth(), data.getDate());
      let diaLabel = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
      if (dataMsg.getTime() === ontem.getTime()) {
        diaLabel = 'ontem';
      }
      li.innerHTML = `<span style="display:inline-block;"><span class="user" style="color:#00b0f4;font-weight:600;">${msg.usuario || 'Anônimo'}</span><span class="hora" style="margin-left:8px;color:#72767d;font-size:0.95em;font-weight:400;">${diaLabel} ${hora}</span></span><br><span class="texto">${msg.texto}</span>`;
      chat.appendChild(li);
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function carregarMensagens() {
      chat.innerHTML = '';
      const { data, error } = await supabase
        .from('meu-chat')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) {
        data.reverse().forEach(mostrarMensagem);
        setTimeout(() => {
          if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
        }, 50);
      }
    }

    async function enviarMensagem() {
      const usuario = localStorage.getItem('username') || 'Usuário';
      const texto = mensagemInput.value.trim();
      if (!texto) return;
      mensagemInput.value = '';
      await supabase.from('meu-chat').insert([{ usuario, texto }]);
      setTimeout(() => {
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
      }, 100);
    }

    enviarBtn.onclick = enviarMensagem;
    mensagemInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        enviarMensagem();
      }
    });

    supabase
      .channel('public:meu-chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'meu-chat' }, payload => {
        const existe = Array.from(chat.children).some(li => li.dataset.id === payload.new.id);
        if (!existe) {
          mostrarMensagem(payload.new);
          while (chat.children.length > 10) {
            chat.removeChild(chat.firstChild);
          }
          setTimeout(() => {
            if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
          }, 50);
        }
      })
      .subscribe();

    carregarMensagens();
  }

  // Não carregar o chat automaticamente ao iniciar a página
  // Se o chat for removido manualmente, também seta flag para false
  window.addEventListener('DOMContentLoaded', function() {
    var root = document.getElementById('chat-root');
    if (root) {
      var observer = new MutationObserver(function() {
        if (!root.querySelector('.chat-wrapper')) {
          window.chatIsOpen = false;
        }
      });
      observer.observe(root, { childList: true, subtree: true });
    }
  });
})();
