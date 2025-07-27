  // Adiciona CSS das postagens se ainda não estiver presente
  if (!document.getElementById('main-content-style')) {
    const style = document.createElement('style');
    style.id = 'main-content-style';
    style.textContent = `
      #mainContentPosts, .main-content {  }
      .reddit-post { padding: 22px 28px 10px 28px; border-bottom: 1px solid #333; }
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
const supabaseUrl = 'https://xhybbhdhjaluqjrtopml.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoeWJiaGRoamFsdXFqcnRvcG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzQ5NjMsImV4cCI6MjA2ODg1MDk2M30.Xb98A6l-duDBO6G8_3SPKwluyAm-v8LH5G22ysmSXck';
let supabase;

function renderMainContent(targetSelector = '#mainContentPosts') {
  if (!window.supabase) {
    // Carrega supabase-js se não existir
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js';
    script.onload = () => {
      supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
      carregarPostagens(targetSelector);
    };
    document.head.appendChild(script);
  } else {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    carregarPostagens(targetSelector);
  }
}

async function carregarPostagens(targetSelector) {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    target.innerHTML = '<p style="color:#fff;text-align:center;">Nenhuma postagem encontrada.</p>';
    return;
  }

  const username = localStorage.getItem('username');
  target.innerHTML = data.map(post => {
    const isOwner = username && post.usuario === username;
    return `
      <div class="reddit-post" data-id="${post.id}">
        <div class="reddit-header">
          <div class="reddit-avatar">${post.usuario ? post.usuario[0].toUpperCase() : 'A'}</div>
          <span class="reddit-username">${post.usuario || 'anon_user'}</span>
          <span class="reddit-time">${new Date(post.created_at).toLocaleString('pt-BR')}</span>
        </div>
        <div class="reddit-title">${post.titulo || ''}</div>
        <div class="reddit-content">${post.conteudo || ''}</div>
        <div class="reddit-actions">
          <span class="reddit-action">▲ Upvote (${post.upvotes ?? 0})</span>
          <span class="reddit-action">▼ Downvote (${post.downvotes ?? 0})</span>
          <span class="reddit-action">💬 Comentar (${post.comentarios ?? 0})</span>
          <span class="reddit-action">🔗 Compartilhar</span>
          ${isOwner ? '<span class="reddit-action" style="color:#00b0f4;font-weight:600;">✏️ Editar</span>' : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Para uso dinâmico: window.renderMainContent = renderMainContent;
window.renderMainContent = renderMainContent;
