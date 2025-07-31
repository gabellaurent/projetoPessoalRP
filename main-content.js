// Adiciona CSS das postagens se ainda não estiver presente
  if (!document.getElementById('main-content-style')) {
    const style = document.createElement('style');
    style.id = 'main-content-style';
    style.textContent = `
      #mainContentPosts, .main-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        
      }
      .reddit-post {
        padding: 22px 28px 10px 28px;
        border-bottom: 1px solid #333;
        width: 100%;
        max-width: 60%;
        box-sizing: border-box;
        margin: 0 auto;
      }
      .reddit-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
      .reddit-avatar { width: 38px; height: 38px; border-radius: 50%; background: #444; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold; font-size: 1.2rem; }
      .reddit-username { color: #00b0f4; font-weight: 600; font-size: 1rem; }
      .reddit-time { color: #aaa; font-size: 0.95rem; margin-left: 8px; }
      .reddit-title { color: #fff; font-size: 1.25rem; font-weight: 600; margin-bottom: 6px; }
      .reddit-content { color: #dcddde; font-size: 1.05rem; margin-bottom: 10px; }
      .reddit-actions { display: flex; gap: 18px; margin-top: 8px; }
      .reddit-action { color: #aaa; font-size: 1rem; cursor: pointer; transition: color 0.2s; }
      .reddit-action:hover { color: #fff; }
    `;
    document.head.appendChild(style);
  }

// main-content.js
// Renderiza postagens do Supabase no elemento passado
let supabase;


function renderMainContent(targetSelector = '#mainContentPosts') {
  if (!window.supabaseClient || typeof window.supabaseClient.load !== 'function') {
    // Carrega supabaseClient.js se não existir ou se load não for função
    const script = document.createElement('script');
    script.src = 'supabaseClient.js';
    script.onload = () => {
      if (window.supabaseClient && typeof window.supabaseClient.load === 'function') {
        window.supabaseClient.load(function(client) {
          supabase = client;
          carregarPostagens(targetSelector);
        });
      } else {
        console.error('supabaseClient.load não está disponível após carregar supabaseClient.js');
        // Opcional: exibir mensagem na tela
        const target = document.querySelector(targetSelector);
        if (target) {
          target.innerHTML = '<p style="color:#ff5555;text-align:center;">Erro ao carregar Supabase. Tente recarregar a página.</p>';
        }
      }
    };
    document.head.appendChild(script);
  } else {
    window.supabaseClient.load(function(client) {
      supabase = client;
      carregarPostagens(targetSelector);
    });
  }
}

async function carregarPostagens(targetSelector) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  let page = 0;
  const PAGE_SIZE_INITIAL = 10;
  const PAGE_SIZE_MORE = 5;
  let allLoaded = false;
  let posts = [];
  let comentariosPorPost = {};

  function addLoadMoreButton() {
    let btn = document.getElementById('btnLoadMorePosts');
    if (!btn && !allLoaded) {
      btn = document.createElement('button');
      btn.id = 'btnLoadMorePosts';
      btn.textContent = 'Carregar mais postagens';
      btn.style = 'display:block;margin:24px auto 0 auto;padding:12px 28px;font-size:1.1rem;background:#5865f2;color:#fff;border:none;border-radius:6px;cursor:pointer; margin-bottom: 20px;';
      btn.onclick = function() {
        loadPosts();
      };
      target.appendChild(btn);
    }
    if (btn && allLoaded) {
      btn.remove();
    }
  }

  async function loadPosts() {
    if (allLoaded) return;
    const pageSize = page === 0 ? PAGE_SIZE_INITIAL : PAGE_SIZE_MORE;
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE_INITIAL + (page > 0 ? (PAGE_SIZE_MORE * (page - 1)) : 0), page * PAGE_SIZE_INITIAL + (page > 0 ? (PAGE_SIZE_MORE * page - 1) : (PAGE_SIZE_INITIAL - 1)));
    if (error || !data || data.length === 0) {
      if (page === 0) {
        target.innerHTML = '<p style="color:#fff;text-align:center;">Nenhuma postagem encontrada.</p>';
      }
      allLoaded = true;
      addLoadMoreButton();
      return;
    }
    if (data.length < (page === 0 ? PAGE_SIZE_INITIAL : PAGE_SIZE_MORE)) {
      allLoaded = true;
    }
    posts = posts.concat(data);
    // Busca a contagem de comentários para os posts carregados
    const postIds = data.map(post => post.id);
    if (postIds.length > 0) {
      const { data: comentariosData } = await supabase
        .from('comments')
        .select('post_id', { count: 'exact', head: false })
        .in('post_id', postIds);
      // Calcula a contagem por post
      comentariosPorPost = {};
      if (comentariosData) {
        postIds.forEach(id => {
          comentariosPorPost[id] = comentariosData.filter(c => c.post_id === id).length;
        });
      }
    }
    renderPosts();
    page++;
  }

  function renderPosts() {
    const username = localStorage.getItem('username');
    // Adiciona CSS da animação se não existir
    if (!document.getElementById('fadein-main-content-style')) {
      const style = document.createElement('style');
      style.id = 'fadein-main-content-style';
      style.textContent = `
        .fadein-post-main {
          opacity: 0;
          transition: opacity 0.7s ease;
        }
        .fadein-post-main.visible {
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    }
    // Renderiza dentro do container animado
    target.innerHTML = `<div class="fadein-post-main" id="fadeinMainContentContainer">${posts.map(post => {
      const isOwner = username && post.usuario === username;
      let conteudoFormatado = post.conteudo || '';
      conteudoFormatado = conteudoFormatado
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\*(.*?)\*/g, '<i>$1</i>')
        .replace(/(https?:\/\/(?:[\w-]+\.)+[\w-]+\S*?\.(?:jpg|jpeg|png|gif|webp))/gi, '<img src="$1" style="max-width:100%;margin:10px 0;border-radius:8px;object-fit:cover;">');
      const comentariosCount = comentariosPorPost[post.id] ?? 0;
      return `
        <div class="reddit-post" data-id="${post.id}">
          <div class="reddit-header">
            <div class="reddit-avatar">${post.usuario ? post.usuario[0].toUpperCase() : 'A'}</div>
            <span class="reddit-username">${post.usuario || 'anon_user'}</span>
            <span class="reddit-time">${new Date(post.created_at).toLocaleString('pt-BR')}</span>
          </div>
          <div class="reddit-title" data-click="titulo" style="cursor:pointer;">${post.titulo || ''}</div>
          <div class="reddit-content" data-click="conteudo" style="cursor:pointer;">${conteudoFormatado}</div>
          <div class="reddit-actions">
            <span class="reddit-action">▲ Upvote (${post.upvotes ?? 0})</span>
            <span class="reddit-action">▼ Downvote (${post.downvotes ?? 0})</span>
            <span class="reddit-action">💬 Comentários (${comentariosCount})</span>
            <span class="reddit-action">🔗 Compartilhar</span>
          </div>
        </div>
      `;
    }).join('')}</div>`;
    // Aplica fade-in
    setTimeout(() => {
      const fadein = document.getElementById('fadeinMainContentContainer');
      if (fadein) fadein.classList.add('visible');

      // Adiciona event listener para título e corpo dentro do container animado
      fadein.querySelectorAll('.reddit-title, .reddit-content').forEach(function(el) {
        el.addEventListener('click', function(e) {
          const postDiv = el.closest('.reddit-post');
          if (postDiv) {
            const postId = postDiv.getAttribute('data-id');
            localStorage.setItem('post_uuid_clicked', postId);
            // Agora sempre abre o modal, igual ao clique na postagem inteira
            const modal = document.getElementById('post-detalhe-modal');
            if (modal) {
              modal.style.display = 'flex';
              modal.innerHTML = '<div id="modal-content" style="background:#23272a;box-sizing:border-box;width:100%;height:100%;overflow:auto;position:relative;"></div>';
              if (!window.renderPostDetalhe) {
                var script = document.createElement('script');
                script.src = 'post-detalhe.js';
                script.onload = function() {
                  window.renderPostDetalhe(postId, '#modal-content');
                  addModalCloseBtn();
                };
                document.body.appendChild(script);
              } else {
                window.renderPostDetalhe(postId, '#modal-content');
                addModalCloseBtn();
              }
            }
          }
          e.stopPropagation();
        });
      });
      // Adiciona event listener para a postagem inteira dentro do container animado
      fadein.querySelectorAll('.reddit-post').forEach(function(postEl) {
        postEl.addEventListener('click', async function(e) {
          if (
            e.target.closest('.reddit-action') ||
            e.target.tagName === 'A' ||
            e.target.tagName === 'BUTTON'
          ) {
            return;
          }
          const postId = postEl.getAttribute('data-id');
          localStorage.setItem('post_uuid_clicked', postId);
          // Renderiza o post-detalhe no modal, sem apagar main-content
          const modal = document.getElementById('post-detalhe-modal');
          if (modal) {
            modal.style.display = 'flex';
            modal.innerHTML = '<div id="modal-content" style="background:#23272a;box-sizing:border-box;width:100%;height:100%;overflow:auto;position:relative;"></div>';
            // Carrega post-detalhe.js se necessário
            if (!window.renderPostDetalhe) {
              var script = document.createElement('script');
              script.src = 'post-detalhe.js';
              script.onload = function() {
                window.renderPostDetalhe(postId, '#modal-content');
                addModalCloseBtn();
              };
              document.body.appendChild(script);
            } else {
              window.renderPostDetalhe(postId, '#modal-content');
              addModalCloseBtn();
            }
          }
          function addModalCloseBtn() {
            const modalContent = document.getElementById('modal-content');
          }
          e.stopPropagation();
        });
      });
    }, 50);
    addLoadMoreButton();
    // Chama o script de vídeo após renderizar as postagens
    if (window.renderizarVideosYoutube) {
      window.renderizarVideosYoutube(targetSelector);
    }
  }

  // Inicializa carregamento
  loadPosts();
}

// Para uso dinâmico: window.renderMainContent = renderMainContent;
window.renderMainContent = renderMainContent;
