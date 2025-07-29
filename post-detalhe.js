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

  // Usa configuração centralizada do Supabase
  let supabase;
  if (!window.supabaseClient) {
    const script = document.createElement('script');
    script.src = 'supabaseClient.js';
    script.onload = function() {
      window.supabaseClient.load(function(client) {
        supabase = client;
        buscarPostagem(uuid);
      });
    };
    document.head.appendChild(script);
  } else {
    window.supabaseClient.load(function(client) {
      supabase = client;
      buscarPostagem(uuid);
    });
  }

  async function buscarPostagem(postId) {
    target.innerHTML = '';
    // Tenta buscar do cache
    let cache = localStorage.getItem('post_cache_' + postId);
    let data;
    if (cache) {
      try {
        data = JSON.parse(cache);
      } catch (e) {
        data = null;
      }
    }
    if (!data) {
      // Se não tem no cache, busca do banco
      const { data: dbData, error } = await supabase
        .from('posts')
        .select('usuario, titulo, conteudo, created_at')
        .eq('id', postId)
        .single();
      if (error || !dbData) {
        target.innerHTML = `<p style='color:#e74c3c;text-align:center;'>Postagem não encontrada.</p>`;
        return;
      }
      data = dbData;
      // Salva no cache
      localStorage.setItem('post_cache_' + postId, JSON.stringify(data));
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
      <div style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;background:#23272f;box-sizing:border-box;margin:0;padding:0;border-radius:0;">
        <div style="width:50%;max-width:50%;min-width:320px;background:#23272f;box-sizing:border-box;margin:32px auto 32px auto;padding:0 24px 0 0;border-radius:0;min-height:90vh;max-height:90vh;overflow:auto;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:38px;height:38px;border-radius:50%;background:#444;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:1.2rem;">${data.usuario ? data.usuario[0].toUpperCase() : 'A'}</div>
            <span style="color:#00b0f4;font-weight:600;font-size:1rem;">${data.usuario || 'anon_user'}</span>
            <span style="color:#aaa;font-size:0.95rem;margin-left:8px;">${new Date(data.created_at).toLocaleString('pt-BR')}</span>
          </div>
          <button id="voltarMainContent" style="background:#00b0f4;color:#fff;border:none;border-radius:6px;padding:8px 20px;font-weight:600;cursor:pointer;">Voltar</button>
        </div>
        <div style="color:#fff;font-size:1.35rem;font-weight:700;margin-bottom:10px;">${data.titulo || ''}</div>
        <div style="color:#dcddde;font-size:1.1rem;margin-bottom:18px;">${conteudoFormatado}</div>
        <div id="comentarios-section" style="margin-top:32px;border-top:1px solid #2d3b49;">
          <div style="display:flex;gap:10px;margin-bottom:16px;">
            <input id="comentarioInput" type="text" placeholder="Escreva seu comentário..." style="flex:1;padding:10px;border-radius:6px;border:1px solid #444;background:#222;color:#fff;">
            <button id="enviarComentarioBtn" style="background:#00b0f4;color:#fff;border:none;border-radius:6px;padding:10px 18px;font-weight:600;cursor:pointer;">Enviar</button>
          </div>
          <h3 style="color:#00b0f4;margin-bottom:10px;">Comentários <span id="comentariosCount" style="color:#fff;font-size:1rem;font-weight:400;margin-left:8px;"></span></h3>
          <div id="listaComentarios"></div>
        </div>
      </div>
    `;
    // Garante que o embed do vídeo seja processado
    if (window.renderizarVideosYoutube) {
      window.renderizarVideosYoutube(targetSelector);
    }
    // Botão voltar para main-content
    const voltarBtn = document.getElementById('voltarMainContent');
    if (voltarBtn) {
      voltarBtn.onclick = function() {
        // Se estiver dentro do modal, apenas fecha o modal
        const modal = document.getElementById('post-detalhe-modal');
        if (modal && modal.style.display === 'flex') {
          modal.style.display = 'none';
          modal.innerHTML = '';
        } else {
          // Se não estiver no modal, recarrega main-content
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
        }
      };
    }
    // Função para buscar e exibir comentários
    async function carregarComentarios() {
      // Tenta buscar comentários do cache
      let comentarios = null;
      let error = null;
      let comentariosCache = localStorage.getItem('comments_cache_' + postId);
      const lista = document.getElementById('listaComentarios');
      const comentariosCountSpan = document.getElementById('comentariosCount');
      if (comentariosCache) {
        try {
          comentarios = JSON.parse(comentariosCache);
        } catch (e) {
          comentarios = null;
        }
        // Renderiza imediatamente os comentários do cache
        if (comentarios && lista) {
          if (!comentarios || comentarios.length === 0) {
            lista.innerHTML = '<p style="color:#aaa;">Nenhum comentário ainda.</p>';
            if (comentariosCountSpan) comentariosCountSpan.textContent = '(0)';
          } else {
            if (comentariosCountSpan) comentariosCountSpan.textContent = `(${comentarios.length})`;
            // Busca os nomes dos usuários em lote
            const usuarioIds = comentarios.map(c => c.usuario_id);
            const { data: usuarios } = await supabase
              .from('base-users')
              .select('id, username')
              .in('id', usuarioIds);
            const idToUsername = {};
            if (usuarios) {
              usuarios.forEach(u => {
                idToUsername[u.id] = u.username;
              });
            }
            lista.innerHTML = comentarios.map(c => {
              const nome = idToUsername[c.usuario_id] || 'Usuário';
              return `
        <div style="background:#23272f;border-radius:8px;padding:12px 16px;margin-bottom:10px;">
                  <span style="color:#00b0f4;font-weight:600;">${nome}</span>
                  <span style="color:#aaa;font-size:0.95rem;margin-left:8px;">${new Date(c.created_at).toLocaleString('pt-BR')}</span>
                  <div style="color:#dcddde;font-size:1.05rem;margin-top:6px;">${c.conteudo}</div>
                </div>
              `;
            }).join('');
          }
        }
      }
      // Se não há cache, busca do banco normalmente
      if (!comentarios) {
        const resp = await supabase
          .from('comments')
          .select('usuario_id, conteudo, created_at')
          .eq('post_id', postId)
          .order('created_at', { ascending: false });
        comentarios = resp.data;
        error = resp.error;
        // Salva no cache se não houver erro
        if (comentarios && !error) {
          localStorage.setItem('comments_cache_' + postId, JSON.stringify(comentarios));
        }
        // Renderiza comentários do banco
        if (lista) {
          if (error) {
            lista.innerHTML = '<p style="color:#e74c3c;">Erro ao carregar comentários.</p>';
            return;
          }
          if (!comentarios || comentarios.length === 0) {
            lista.innerHTML = '<p style="color:#aaa;">Nenhum comentário ainda.</p>';
            if (comentariosCountSpan) comentariosCountSpan.textContent = '(0)';
            return;
          }
          if (comentariosCountSpan) comentariosCountSpan.textContent = `(${comentarios.length})`;
          // Busca os nomes dos usuários em lote
          const usuarioIds = comentarios.map(c => c.usuario_id);
          const { data: usuarios } = await supabase
            .from('base-users')
            .select('id, username')
            .in('id', usuarioIds);
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
      }
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
          // Limpa o cache dos comentários para garantir atualização
          localStorage.removeItem('comments_cache_' + postId);
          carregarComentarios();
        }
      };
    }
  }
}

window.renderPostDetalhe = renderPostDetalhe;
