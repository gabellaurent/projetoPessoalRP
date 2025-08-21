// profile.js - SPA para exibir perfil de usuário
// Chame: renderizarPerfilUsuario(author_id)

function formatarData(dataStr) {
  if (!dataStr) return '';
  const d = new Date(dataStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatarTexto(texto) {
  if (!texto) return '';
  texto = texto.replace(/(https?:\/\/\S+\.(?:png|jpg|jpeg|gif))/gi, '<img src="$1" style="max-width:100%;margin:12px 0;border-radius:8px;" />');
  texto = texto.replace(/https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]{11})/gi, '<div class="youtube-embed"><iframe src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe></div>');
  texto = texto.replace(/https?:\/\/youtu\.be\/([\w-]{11})/gi, '<div class="youtube-embed"><iframe src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe></div>');
  texto = texto.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  texto = texto.replace(/\*(?!\*)([^*]+)\*/g, '<em>$1</em>');
  texto = texto.replace(/\n/g, '<br>');
  return texto;
}

function renderizarPerfilUsuario(author_id) {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;
  mainContent.innerHTML = '<div id="perfil-loading" style="text-align:center;padding:32px;">Carregando perfil...</div>';

  window.supabaseClient.load(async function(client) {
    // Buscar dados do usuário
    const { data: userData, error: userError } = await client
      .from('base_users')
      .select('id, username, email, bio, created_at')
      .eq('id', author_id)
      .single();

    // Buscar postagens do usuário
    const { data: postsData, error: postsError } = await client
      .from('posts')
      .select('id, titulo, post_content, created_at')
      .eq('author_id', author_id)
      .order('created_at', { ascending: false });

    const numPosts = Array.isArray(postsData) ? postsData.length : 0;
    // Montar HTML do perfil
    let html = '<div class="perfil-area" style="max-width:700px;margin:0 auto;padding:24px;">';
    if (userError || !userData) {
      html += '<h2>Usuário não encontrado</h2>';
      html += '<p>O perfil solicitado não existe.</p>';
      mainContent.innerHTML = html + '</div>';
      return;
    }
  html += `<h1 style="font-size:2rem;font-weight:bold;">${userData.username || (userData.email ? userData.email.split('@')[0] : '')}</h1>`;
  // Calcular dias desde a criação da conta
  const dataCriacao = new Date(userData.created_at);
  const hoje = new Date();
  const diffMs = hoje - dataCriacao;
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  html += `<div style="color:#888;font-size:1rem;margin-bottom:12px;">Conta criada em: ${formatarData(userData.created_at)} &bull; <span title='Dias desde a criação'>${diffDias} dias</span></div>`;
    html += `<div style="margin-bottom:18px;color:white;"><strong>Bio:</strong><br><span style="color:white;">${formatarTexto(userData.bio || 'Nenhuma bio definida.')}</span></div>`;
  html += `<button type="button" id="btn-publicacoes-usuario" style="margin-bottom:18px;display:block;background:#6366f1;color:#fff;border:none;padding:8px 18px;border-radius:6px;font-size:1rem;cursor:pointer;"><strong>Publicações:</strong> <span style="font-weight:bold;">${numPosts}</span></button>`;
    html += '<hr style="margin:24px 0;">';
    html += '<div><h2 style="font-size:1.3rem;margin-bottom:12px;">Publicações do usuário</h2>';
    if (numPosts === 0) {
      html += '<p>Este usuário ainda não fez nenhuma publicação.</p>';
    } else {
      postsData.forEach(post => {
    html += `<div class="post-item" style="margin-bottom:32px;padding:18px 12px;border-radius:8px;box-shadow:0 2px 8px #0001;">`;
    html += `<h3 style="font-size:1.1rem;font-weight:bold;margin-bottom:6px;color:#5865F2;">${post.titulo || 'Sem título'}</h3>`;
        html += `<div style="color:#888;font-size:0.95rem;margin-bottom:8px;">${formatarData(post.created_at)}</div>`;
        html += `<div class="post-content">${formatarTexto(post.post_content || '')}</div>`;
        html += '</div>';
      });
    }
    html += '</div></div>';
    mainContent.innerHTML = html;
  });
}

// SPA: Adiciona evento global para links de usuário
if (!window._profileUserLinkHandler) {
  window._profileUserLinkHandler = true;
  document.addEventListener('click', function(e) {
    const el = e.target.closest('.user-link');
    if (el && el.dataset.userid) {
      e.preventDefault();
      renderizarPerfilUsuario(el.dataset.userid);
    }
  });
}


// SPA: Ao clicar em 'Postagens Feed', remove perfil e carrega feed
document.addEventListener('DOMContentLoaded', function() {
  const menuFeed = document.getElementById('menu-feed');
  if (menuFeed) {
    menuFeed.addEventListener('click', function(e) {
      e.preventDefault();
      const mainContent = document.getElementById('main-content');
      if (mainContent) mainContent.innerHTML = '';
      if (window.renderPostagensFeed) {
        window.renderPostagensFeed();
      } else if (typeof renderPostagensFeed === 'function') {
        renderPostagensFeed();
      }
    });
  }
});
