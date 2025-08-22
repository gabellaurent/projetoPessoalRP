// commentsPost.js
// Abre uma telinha estilo Twitter/X para comentar em uma postagem

function showCommentModal(postId) {
  // Remove modal existente
  const oldModal = document.getElementById('comment-modal');
  if (oldModal) oldModal.remove();

  // Carrega dados da postagem e autor
  window.supabaseClient.load(async function(client) {
    // Busca dados da postagem
    const { data: postData, error: postError } = await client
      .from('posts')
      .select('id, titulo, post_content, author_id')
      .eq('id', postId)
      .single();
    if (!postData) return;

    // Busca nome do autor
    let authorName = '';
    if (postData.author_id) {
      const { data: userData } = await client
        .from('base_users')
        .select('username')
        .eq('id', postData.author_id)
        .single();
      authorName = userData?.username || postData.author_id;
    }

    // Cria modal
    const modal = document.createElement('div');
    modal.id = 'comment-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';

    // Caixa estilo Twitter/X, adaptado para o tema do site
    const box = document.createElement('div');
    box.style.background = '#23272f';
    box.style.borderRadius = '16px';
    box.style.padding = '32px 24px 24px 24px';
    box.style.width = '420px';
    box.style.boxShadow = '0 2px 16px rgba(0,0,0,0.35)';
    box.style.fontFamily = 'Montserrat, Arial, sans-serif';
    box.innerHTML = `
      <div style="margin-bottom:18px;">
        <h2 style="margin:0 0 6px 0;font-size:1.3em;color:#5865f2;">${postData.titulo}</h2>
        <div style="color:#b8c7d1;font-size:0.98em;margin-bottom:4px;">por <strong style='color:#8ab4f8;'>${authorName}</strong></div>
        <div style="color:#b8c7d1;font-size:0.95em;max-height:48px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${postData.post_content}</div>
      </div>
  <textarea id="comment-text" rows="4" style="width:calc(100% - 20px);resize:none;border-radius:8px;border:1px solid #5865f2;background:#23272f;color:#fff;padding:10px;font-size:1em;margin-bottom:12px;" placeholder="Digite seu comentário..."></textarea>
      <div style="text-align:right;">
        <button id="send-comment" style="background:#5865f2;color:#fff;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-weight:600;transition:background 0.18s;">Comentar</button>
        <button id="close-comment" style="margin-left:8px;padding:8px 18px;border-radius:8px;border:none;background:#353942;color:#b8c7d1;cursor:pointer;">Cancelar</button>
      </div>
      <style>
        #comment-modal button#send-comment:hover { background: #4752c4; }
        #comment-modal button#close-comment:hover { background: #5865f2; color: #fff; }
        #comment-modal textarea:focus { outline: 2px solid #5865f2; }
      </style>
    `;

    modal.appendChild(box);
    document.body.appendChild(modal);

    // Fechar modal
    document.getElementById('close-comment').onclick = function() {
      modal.remove();
    };

    // Enviar comentário
    document.getElementById('send-comment').onclick = function() {
      const content = document.getElementById('comment-text').value.trim();
      if (!content) return;
      window.supabaseClient.load(function(client) {
        const user = window.supabaseClient.currentUser;
        if (!user) return;
        client.from('base_users').select('username').eq('id', user.id).single().then(({ data }) => {
          const comentarioObj = {
            post_id: postId,
            user_id: user.id,
            content: content,
            username: data?.username || ''
          };
          client.from('comentarios_posts').insert(comentarioObj).then(({ error }) => {
            if (!error) {
              modal.remove();
            }
          });
        });
      });
    };
  });
}

// Exporte para uso em outros scripts
window.showCommentModal = showCommentModal;
