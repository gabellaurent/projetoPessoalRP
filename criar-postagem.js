// criar-postagem.js
// Renderiza o formulário de criação de postagem dinamicamente

function renderCriarPostagem(targetSelector = '.main-content') {
  // Adiciona CSS se não estiver presente
  if (!document.getElementById('criar-postagem-style')) {
    const style = document.createElement('style');
    style.id = 'criar-postagem-style';
    style.textContent = `
      .criar-postagem-root .form-container { max-width: 600px; margin: 48px auto; border-radius: 12px; color: #fff; }
      .criar-postagem-root h2 { text-align: center; margin-bottom: 24px; font-size: 1.3rem; }
      .criar-postagem-root label { display: block; margin-bottom: 8px; font-weight: 600; color: #00b0f4; }
      .criar-postagem-root input, .criar-postagem-root textarea { width: 100%; padding: 10px; border-radius: 6px; border: none; background: #40444b; color: #fff; font-size: 1rem; margin-bottom: 18px; box-sizing: border-box; }
      .criar-postagem-root textarea { min-height: 80px; resize: vertical; }
      .criar-postagem-root button { background: #5865f2; color: #fff; border: none; border-radius: 6px; padding: 12px 0; font-size: 1.1rem; font-weight: 600; cursor: pointer; width: 100%; transition: background 0.2s; }
      .criar-postagem-root button:hover { background: #4752c4; }
      .criar-postagem-root .msg { text-align: center; margin-top: 18px; font-size: 1.05rem; }
    `;
    document.head.appendChild(style);
  }

  // Renderiza o formulário
  const target = document.querySelector(targetSelector);
  if (!target) return;
  target.innerHTML = `
    <div class="criar-postagem-root">
      <div class="form-container">
        <h2>Criar Nova Postagem</h2>
        <form id="postForm">
          <label for="titulo">Título</label>
          <input type="text" id="titulo" name="titulo" maxlength="80" required>
          <label style="color:#00b0f4;font-weight:600;margin-bottom:4px;display:block;">Pré-visualização:</label>
          <div id="previewConteudo" style="background:#23272a;border-radius:6px;padding:12px;min-height:80px;color:#fff;font-size:1rem;white-space:pre-wrap;margin-bottom:18px;"></div>
          <label for="conteudo">Conteúdo</label>
          <textarea id="conteudo" name="conteudo" maxlength="5000" required placeholder="Você pode usar *itálico* e **negrito**. Quebra de linha também é permitida."></textarea>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <span id="contadorCaracteres" style="color:#aaa;font-size:0.98em;">0/5000</span>
          </div>
          <div style="display:flex;gap:12px;justify-content:flex-end;align-items:center;margin-top:8px;">
            <button id="voltarMainContent" type="button" style="background:#5865f2;color:#fff;border:none;border-radius:6px;padding:12px 0;font-size:1.1rem;font-weight:600;cursor:pointer;flex:1;display:flex;align-items:center;justify-content:center;transition:background 0.2s;">
              <i class="fa-solid fa-arrow-left" style="margin-right:6px;"></i> Voltar
            </button>
            <button type="submit" style="background:#5865f2;color:#fff;border:none;border-radius:6px;padding:12px 0;font-size:1.1rem;font-weight:600;cursor:pointer;flex:1;display:flex;align-items:center;justify-content:center;transition:background 0.2s;">Publicar</button>
          </div>
        </form>
        <div class="msg" id="msg"></div>
      </div>
    </div>
  `;

  // Adiciona lógica do formulário
  const supabaseUrl = 'https://xhybbhdhjaluqjrtopml.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoeWJiaGRoamFsdXFqcnRvcG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzQ5NjMsImV4cCI6MjA2ODg1MDk2M30.Xb98A6l-duDBO6G8_3SPKwluyAm-v8LH5G22ysmSXck';
  let supabase;
  if (!window.supabase) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js';
    script.onload = () => {
      supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
      bindForm();
    };
    document.head.appendChild(script);
  } else {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    bindForm();
  }

  function bindForm() {
    // Botão voltar
    const voltarBtn = document.getElementById('voltarMainContent');
    if (voltarBtn) {
      voltarBtn.addEventListener('click', function() {
        // Remove criar-postagem.js se necessário (opcional)
        // Carrega main-content.js se necessário
        if (!window.renderMainContent) {
          var script = document.createElement('script');
          script.src = 'main-content.js';
          script.onload = function() {
            window.renderMainContent('.main-content');
          };
          document.body.appendChild(script);
        } else {
          window.renderMainContent('.main-content');
        }
      });
    }
    const form = document.getElementById('postForm');
    const msg = document.getElementById('msg');
    const conteudoInput = document.getElementById('conteudo');
    const contador = document.getElementById('contadorCaracteres');
    const preview = document.getElementById('previewConteudo');
    function renderPreview(text) {
      if (!preview) return;
      let html = text
        // Links de imagem
        .replace(/(https?:\/\/(?:[\w.-]+)\.(?:png|jpg|jpeg|gif|webp)(?:\?[^\s]*)?)/gi, '<img src="$1" alt="imagem" style="max-width:100%;margin:8px 0;border-radius:8px;">')
        // Vídeos do YouTube
        .replace(/(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+))/gi, function(match, url, id) {
          let videoId = id;
          // Para youtube.com/watch?v=...
          if (url.includes('watch?v=')) {
            const params = new URLSearchParams(url.split('watch?v=')[1]);
            videoId = params.get('') || url.split('watch?v=')[1];
            if (videoId && videoId.includes('&')) videoId = videoId.split('&')[0];
          }
          return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="margin:8px 0;border-radius:8px;"></iframe>`;
        })
        // Negrito
        .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
        // Itálico
        .replace(/\*([^*]+)\*/g, '<i>$1</i>')
        // Quebra de linha
        .replace(/\n/g, '<br>');
      preview.innerHTML = html;
    }
    if (conteudoInput && contador && preview) {
      conteudoInput.addEventListener('input', function() {
        contador.textContent = conteudoInput.value.length + '/5000';
        if (conteudoInput.value.length > 5000) {
          contador.style.color = '#e74c3c';
        } else {
          contador.style.color = '#aaa';
        }
        renderPreview(conteudoInput.value);
      });
      // Inicializa contador e preview
      contador.textContent = conteudoInput.value.length + '/5000';
      renderPreview(conteudoInput.value);
    }
    if (!form) return;
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      msg.textContent = '';
      const titulo = form.titulo.value.trim();
      const conteudo = form.conteudo.value.trim();
      if (!titulo || !conteudo) {
        msg.textContent = 'Preencha todos os campos.';
        msg.style.color = '#e74c3c';
        return;
      }
      // Busca usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      let usuario = 'anon_user';
      if (user && user.id) {
        // Busca username na base-users
        const { data, error } = await supabase
          .from('base-users')
          .select('username')
          .eq('id', user.id)
          .single();
        if (data && data.username) {
          usuario = data.username;
        }
      }
      const { error } = await supabase.from('posts').insert([
        { usuario, titulo, conteudo }
      ]);
      if (error) {
        msg.textContent = 'Erro ao publicar: ' + error.message;
        msg.style.color = '#e74c3c';
      } else {
        msg.textContent = 'Postagem publicada com sucesso!';
        msg.style.color = '#2ecc40';
        form.reset();
        // Redireciona para main-content após publicar
        setTimeout(function() {
          if (!window.renderMainContent) {
            var script = document.createElement('script');
            script.src = 'main-content.js';
            script.onload = function() {
              window.renderMainContent('.main-content');
            };
            document.body.appendChild(script);
          } else {
            window.renderMainContent('.main-content');
          }
        }, 800); // pequeno delay para mostrar mensagem
      }
    });
  }
}

window.renderCriarPostagem = renderCriarPostagem;
