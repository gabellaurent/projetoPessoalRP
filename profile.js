// profile.js
// Renderiza o perfil do usuário dinamicamente na área main-content

window.renderProfilePage = function(username, targetSelector = '.main-content') {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  target.innerHTML = `<div style="color:#aaa;text-align:center;">Carregando perfil...</div>`;

  // Carrega o supabaseClient se necessário
  function loadSupabaseClient(cb) {
    if (window.supabaseClient) {
      window.supabaseClient.load(cb);
    } else {
      var script = document.createElement('script');
      script.src = 'supabaseClient.js';
      script.onload = function() { window.supabaseClient.load(cb); };
      document.head.appendChild(script);
    }
  }

  // Busca dados do usuário e renderiza o perfil
  function buscarUsuarioPorNome(username) {
    loadSupabaseClient(async function(supabase) {
      const { data, error } = await supabase
        .from('base-users')
        .select('*')
        .ilike('username', username)
        .limit(1)
        .single();
      if (error || !data) {
        target.innerHTML = '<div class="not-found">Usuário não encontrado.</div>';
        return;
      }
      renderProfile(data);
    });
  }

  let usuarioAtual = null;
  let postsUsuario = [];
  let comentariosUsuario = [];

  function renderProfile(usuario) {
    usuarioAtual = usuario;
    target.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar">${usuario.username ? usuario.username[0].toUpperCase() : '?'}</div>
        <div class="profile-info">
          <div class="profile-username">${usuario.username || 'Usuário'}</div>
          <div class="profile-email">${usuario.email || ''}</div>
          <div class="profile-bio">${usuario.bio ? usuario.bio : '<span style=\"color:#888;\">Sem bio cadastrada.</span>'}</div>
        </div>
      </div>
      <div class="profile-meta">
        <div><b>ID:</b> ${usuario.id}</div>
        <div><b>Registrado em:</b> ${usuario.created_at ? new Date(usuario.created_at).toLocaleString('pt-BR') : '-'}</div>
      </div>
      <button id="voltarMainContent" style="background:#00b0f4;color:#fff;border:none;border-radius:6px;padding:8px 20px;font-weight:600;cursor:pointer;margin:18px 0 10px 0;">Voltar</button>
      <div class="tabs">
        <button class="tab-btn active" id="tabPosts">Postagens</button>
        <button class="tab-btn" id="tabComentarios">Comentários</button>
      </div>
      <div class="tab-content" id="tabContent"></div>
    `;
    // Botão voltar para main-content
    const voltarBtn = target.querySelector('#voltarMainContent');
    if (voltarBtn) {
      voltarBtn.onclick = function() {
        if (window.renderMainContent) {
          window.renderMainContent('.main-content');
        } else {
          var script = document.createElement('script');
          script.src = 'main-content.js';
          script.onload = function() {
            window.renderMainContent('.main-content');
          };
          document.body.appendChild(script);
        }
      };
    }
    carregarPostsEComentarios(usuario.username, usuario.id);
    ativarTabs();
  }

  function ativarTabs() {
    const tabPosts = target.querySelector('#tabPosts');
    const tabComentarios = target.querySelector('#tabComentarios');
    const tabContent = target.querySelector('#tabContent');
    if (!tabPosts || !tabComentarios || !tabContent) return;
    tabPosts.onclick = function() {
      tabPosts.classList.add('active');
      tabComentarios.classList.remove('active');
      renderPostsTab();
    };
    tabComentarios.onclick = function() {
      tabComentarios.classList.add('active');
      tabPosts.classList.remove('active');
      renderComentariosTab();
    };
    renderPostsTab();
  }

  function renderPostsTab() {
    const tabContent = target.querySelector('#tabContent');
    if (!tabContent) return;
    if (!postsUsuario.length) {
      tabContent.innerHTML = '<div style="color:#aaa;text-align:center;">Nenhuma postagem encontrada.</div>';
      return;
    }
    tabContent.innerHTML = postsUsuario.map(post => `
      <a href="#" class="post-title" style="display:block;margin-bottom:10px;text-decoration:none;cursor:pointer;" data-post-id="${post.id}">${post.titulo || '(Sem título)'}</a>
    `).join('');
    // Adiciona evento para cada link
    Array.from(tabContent.querySelectorAll('.post-title')).forEach(link => {
      link.onclick = function(e) {
        e.preventDefault();
        const postId = this.getAttribute('data-post-id');
        if (window.renderPostDetalhe) {
          window.renderPostDetalhe(postId, '.main-content');
        } else {
          var script = document.createElement('script');
          script.src = 'post-detalhe.js';
          script.onload = function() {
            window.renderPostDetalhe(postId, '.main-content');
          };
          document.body.appendChild(script);
        }
      };
    });
  }

  function renderComentariosTab() {
    const tabContent = target.querySelector('#tabContent');
    if (!tabContent) return;
    if (!comentariosUsuario.length) {
      tabContent.innerHTML = '<div style="color:#aaa;text-align:center;">Nenhum comentário encontrado.</div>';
      return;
    }
    tabContent.innerHTML = comentariosUsuario.map(com => `
      <div class="comment">
        <div class="comment-date">${new Date(com.created_at).toLocaleString('pt-BR')}</div>
        <div class="comment-content">${com.conteudo ? com.conteudo.replace(/\n/g, '<br>') : ''}</div>
        <div class="comment-post-title">Em: ${com.titulo_post || '(Postagem desconhecida)'}</div>
      </div>
    `).join('');
  }

  function carregarPostsEComentarios(username, usuarioId) {
    postsUsuario = [];
    comentariosUsuario = [];
    // Busca posts pelo nome do usuário (coluna 'usuario' na tabela posts)
    loadSupabaseClient(async function(supabase) {
      const { data: posts } = await supabase
        .from('posts')
        .select('id, titulo, created_at')
        .eq('usuario', username)
        .order('created_at', { ascending: false });
      postsUsuario = posts || [];
      renderPostsTab();
    });
    // Busca comentários e títulos dos posts comentados
    loadSupabaseClient(async function(supabase) {
      const { data: comentarios } = await supabase
        .from('comments')
        .select('conteudo, created_at, post_id')
        .eq('usuario_id', usuarioId)
        .order('created_at', { ascending: false });
      if (comentarios && comentarios.length) {
        const postIds = comentarios.map(c => c.post_id);
        const { data: postsComentados } = await supabase
          .from('posts')
          .select('id, titulo')
          .in('id', postIds);
        const idToTitulo = {};
        if (postsComentados) postsComentados.forEach(p => { idToTitulo[p.id] = p.titulo; });
        comentariosUsuario = comentarios.map(c => ({ ...c, titulo_post: idToTitulo[c.post_id] }));
      } else {
        comentariosUsuario = [];
      }
      const tabComentarios = target.querySelector('#tabComentarios');
      if (tabComentarios && tabComentarios.classList.contains('active')) {
        renderComentariosTab();
      }
    });
  }

  function injectProfileCss() {
    if (!document.getElementById('profile-style')) {
      const style = document.createElement('style');
      style.id = 'profile-style';
      style.textContent = `
        .profile-header { display: flex; align-items: center; gap: 18px; margin-bottom: 10px; }
        .profile-avatar { width: 72px; height: 72px; border-radius: 50%; background: #444; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 2.5rem; font-weight: bold; }
        .profile-info { flex: 1; }
        .profile-username { font-size: 1.7rem; font-weight: 700; color: #00b0f4; }
        .profile-email { color: #aaa; font-size: 1.05rem; }
        .profile-bio { color: #dcddde; font-size: 1.1rem; margin: 10px 0 0 0; }
        .profile-meta { margin-top: 10px; color: #ccc; font-size: 1.05rem; }
        .tabs { display: flex; gap: 0; border-bottom: 2px solid #222; margin-top: 24px; }
        .tab-btn { flex: 1; background: none; border: none; color: #aaa; font-size: 1.1rem; padding: 12px 0; cursor: pointer; font-weight: 600; border-bottom: 2px solid transparent; transition: color 0.2s, border 0.2s; }
        .tab-btn.active { color: #00b0f4; border-bottom: 2.5px solid #00b0f4; }
        .tab-content { margin-top: 18px; }
        .post-title { color: #00b0f4; font-size: 1.15rem; font-weight: 600; margin-bottom: 6px; display:block; }
        .comment { background: #222; border-radius: 8px; padding: 14px 18px; margin-bottom: 14px; }
        .comment-date { color: #aaa; font-size: 0.98rem; margin-bottom: 4px; }
        .comment-content { color: #dcddde; font-size: 1.05rem; }
        .comment-post-title { color: #00b0f4; font-size: 1rem; font-weight: 500; }
        .not-found { color: #e74c3c; text-align: center; margin-top: 24px; }
        .search-bar { display: flex; gap: 10px; margin-bottom: 28px; }
        .search-bar input { flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #444; background: #222; color: #fff; }
        .search-bar button { background: #00b0f4; color: #fff; border: none; border-radius: 6px; padding: 10px 18px; font-weight: 600; cursor: pointer; }
      `;
      document.head.appendChild(style);
    }
  }

  // Injeta o CSS do perfil ao iniciar
  injectProfileCss();

  // Inicia busca
  buscarUsuarioPorNome(username);
};
