// post-detalhe.js
// Renderiza a visualização detalhada de uma postagem na área .main-content

function renderPostDetalhe(postId, targetSelector = '.main-content') {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  target.innerHTML = '';

  // Busca o uuid do post no localStorage
  const uuid = postId || localStorage.getItem('post_uuid_clicked');
  if (!uuid) {
    target.innerHTML += '<p style="color:#e74c3c;text-align:center;">UUID da postagem não encontrado.</p>';
    return;
  }

  // Supabase config
  const supabaseUrl = 'https://xhybbhdhjaluqjrtopml.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoeWJiaGRoamFsdXFqcnRvcG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzQ5NjMsImV4cCI6MjA2ODg1MDk2M30.Xb98A6l-duDBO6G8_3SPKwluyAm-v8LH5G22ysmSXck';
  let supabase;
  if (!window.supabase) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js';
    script.onload = () => {
      supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
      buscarPostagem(uuid);
    };
    document.head.appendChild(script);
  } else {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    buscarPostagem(uuid);
  }

  async function buscarPostagem(postId) {
    target.innerHTML = '';
    const { data, error } = await supabase
      .from('posts')
      .select('usuario, titulo, conteudo, created_at')
      .eq('id', postId)
      .single();
    if (error || !data) {
      target.innerHTML = `<p style='color:#e74c3c;text-align:center;'>Postagem não encontrada.</p>`;
      return;
    }
    // Formata o conteúdo para exibir quebra de linha, negrito, itálico e imagens
    let conteudoFormatado = data.conteudo || '';
    conteudoFormatado = conteudoFormatado
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '<i>$1</i>')
      // Detecta links de imagens e renderiza como <img>
      .replace(/(https?:\/\/(?:[\w-]+\.)+[\w-]+\S*?\.(?:jpg|jpeg|png|gif|webp))/gi, '<img src="$1" style="max-width:100%;margin:10px 0;border-radius:8px;">');
    target.innerHTML = `
      <div style="max-width:600px;margin:40px auto;border-radius:12px;padding:32px 32px 24px 32px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div style="width:38px;height:38px;border-radius:50%;background:#444;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:1.2rem;">${data.usuario ? data.usuario[0].toUpperCase() : 'A'}</div>
          <span style="color:#00b0f4;font-weight:600;font-size:1rem;">${data.usuario || 'anon_user'}</span>
          <span style="color:#aaa;font-size:0.95rem;margin-left:8px;">${new Date(data.created_at).toLocaleString('pt-BR')}</span>
        </div>
        <div style="color:#fff;font-size:1.35rem;font-weight:700;margin-bottom:10px;">${data.titulo || ''}</div>
        <div style="color:#dcddde;font-size:1.1rem;margin-bottom:18px;">${conteudoFormatado}</div>
        <div id="comentarios-section" style="margin-top:32px;">
          <h3 style="color:#00b0f4;margin-bottom:10px;">Comentários</h3>
          <div style="display:flex;gap:10px;margin-bottom:16px;">
            <input id="comentarioInput" type="text" placeholder="Escreva seu comentário..." style="flex:1;padding:10px;border-radius:6px;border:1px solid #444;background:#222;color:#fff;">
            <button id="enviarComentarioBtn" style="background:#00b0f4;color:#fff;border:none;border-radius:6px;padding:10px 18px;font-weight:600;cursor:pointer;">Enviar</button>
          </div>
          <div id="listaComentarios"></div>
        </div>
        <div style="margin-top:24px;text-align:center;">
          <button id="voltarMainContent" style="background:#5865f2;color:#fff;border:none;border-radius:6px;padding:12px 32px;font-size:1.1rem;font-weight:600;cursor:pointer;">Voltar</button>
        </div>
      </div>
    `;
    // Botão voltar para main-content
    const voltarBtn = document.getElementById('voltarMainContent');
    if (voltarBtn) {
      voltarBtn.onclick = function() {
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
      };
    }
    // Função para buscar e exibir comentários
    async function carregarComentarios() {
      const { data: comentarios, error } = await supabase
        .from('comments')
        .select('usuario_id, conteudo, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      const lista = document.getElementById('listaComentarios');
      if (!lista) return;
      if (error) {
        lista.innerHTML = '<p style="color:#e74c3c;">Erro ao carregar comentários.</p>';
        return;
      }
      if (!comentarios || comentarios.length === 0) {
        lista.innerHTML = '<p style="color:#aaa;">Nenhum comentário ainda.</p>';
        return;
      }
      // Busca os nomes dos usuários em lote
      const usuarioIds = comentarios.map(c => c.usuario_id);
      const { data: usuarios } = await supabase
        .from('base-users')
        .select('id, username')
        .in('id', usuarioIds);
      // Cria um mapa id -> username
      const idToUsername = {};
      if (usuarios) {
        usuarios.forEach(u => {
          idToUsername[u.id] = u.username;
        });
      }
      lista.innerHTML = comentarios.map(c => {
        const nome = idToUsername[c.usuario_id] || 'Usuário';
        return `
          <div style="background:#222;border-radius:8px;padding:12px 16px;margin-bottom:10px;">
            <span style="color:#00b0f4;font-weight:600;">${nome}</span>
            <span style="color:#aaa;font-size:0.95rem;margin-left:8px;">${new Date(c.created_at).toLocaleString('pt-BR')}</span>
            <div style="color:#dcddde;font-size:1.05rem;margin-top:6px;">${c.conteudo}</div>
          </div>
        `;
      }).join('');
    }
    carregarComentarios();

    // Função para registrar novo comentário
    const enviarBtn = document.getElementById('enviarComentarioBtn');
    if (enviarBtn) {
      enviarBtn.onclick = async function() {
        const input = document.getElementById('comentarioInput');
        const conteudo = input.value.trim();
        if (!conteudo) return;
        // Busca o uuid do usuário autenticado pelo Supabase
        const { data: { user } } = await supabase.auth.getUser();
        const usuario_id = user && user.id ? user.id : 'anon_user';
        const { error } = await supabase
          .from('comments')
          .insert({ post_id: postId, usuario_id, conteudo });
        if (error) {
          alert('Erro ao registrar comentário.');
        } else {
          input.value = '';
          carregarComentarios();
        }
      };
    }
  }
}

window.renderPostDetalhe = renderPostDetalhe;
