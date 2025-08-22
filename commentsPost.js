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
      .select('id, titulo, post_content, author_id, created_at')
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

    // Busca comentários da postagem
    const { data: comentarios, error: comentariosError } = await client
      .from('comentarios_posts')
      .select('id, user_id, username, content, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    // Cria box de comentário
    const box = document.createElement('div');
  box.id = 'comment-box';
  box.style.background = '#23272f';
  box.style.borderRadius = '16px';
  box.style.padding = '0';
  box.style.width = '100%';
  box.style.height = '100%';
  box.style.boxSizing = 'border-box';
  box.style.boxShadow = '0 2px 16px rgba(0,0,0,0.10)';
  box.style.fontFamily = 'Montserrat, Arial, sans-serif';
  box.style.display = 'flex';
  box.style.flexDirection = 'column';

    // Renderiza título da postagem acima dos comentários
    let comentariosHtml = `<div style="padding:18px 16px 0 16px;">
      <h2 style="margin:0 0 6px 0;font-size:1.3em;color:#5865f2;">${postData.titulo}</h2>
      <div style="color:#b8c7d1;font-size:0.98em;margin-bottom:8px;">Postado por <strong style='color:#8ab4f8;'>${authorName}</strong> em <span style='color:#5865f2;'>${postData.created_at ? new Date(postData.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}</span></div>
      <hr style="border:0;height:1px;background:#353942;margin:10px 0 0 0;" />
    </div>`;
    comentariosHtml += '<div id="comentarios-list" style="flex:1 1 auto;overflow-y:auto;padding:12px 16px 0 16px;">';
    if (comentarios && comentarios.length > 0) {
      comentariosHtml += '<h3 style="color:#8ab4f8;font-size:1.1em;margin-bottom:10px;">Comentários</h3>';
      comentarios.forEach(comentario => {
        comentariosHtml += `
          <div style="margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #353942;">
            <div style="color:#b8c7d1;font-size:0.97em;">
              <a href="#" class="user-link" data-userid="${comentario.user_id}" style="color:#8ab4f8;font-weight:bold;text-decoration:none;">${comentario.username || comentario.user_id}</a>
              <span style='color:#5865f2;font-size:0.85em;margin-left:6px;'>${new Date(comentario.created_at).toLocaleString()}</span>
            </div>
            <div style="color:#fff;font-size:1em;margin-top:2px;">${comentario.content}</div>
          </div>
        `;
      });
      // Fechar comentários ao clicar em um nome de usuário
      box.addEventListener('click', function(e) {
        const link = e.target.closest('.user-link');
        if (link && link.dataset.userid) {
          e.preventDefault();
          // Fecha comentários
          if (sidebar) sidebar.innerHTML = '';
          // Carrega perfil
          if (window.renderizarPerfilUsuario) {
            window.renderizarPerfilUsuario(link.dataset.userid);
          }
        }
      });
    } else {
      comentariosHtml += '<div style="color:#b8c7d1;">Nenhum comentário ainda.</div>';
    }
    comentariosHtml += '</div>';

    box.innerHTML = `
      ${comentariosHtml}
      <div style="padding:16px;">
        <textarea id="comment-text" rows="4" style="width:100%;resize:none;border-radius:8px;border:1px solid #5865f2;background:#23272f;color:#fff;padding:10px;font-size:1em;margin-bottom:12px;box-sizing:border-box;" placeholder="Digite seu comentário..."></textarea>
        <div style="text-align:left;">
          <button id="send-comment" style="background:#5865f2;color:#fff;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-weight:600;transition:background 0.18s;">Comentar</button>
          <button id="close-comment" style="margin-left:8px;padding:8px 18px;border-radius:8px;border:none;background:#353942;color:#b8c7d1;cursor:pointer;">Cancelar</button>
        </div>
      </div>
      <style>
        /* Sidebar deve ter altura definida no layout principal */
        .extra-sidebar { height: 100%; min-height: 320px; overflow: hidden; display: flex; flex-direction: column; }
        #comment-box { height: 100%; min-height: 320px; display: flex; flex-direction: column; }
        #comentarios-list { flex: 1 1 0; overflow-y: auto; max-height: none; }
        #comment-box > div:last-child { flex-shrink: 0; }
        #comment-box button#send-comment:hover { background: #4752c4; }
        #comment-box button#close-comment:hover { background: #5865f2; color: #fff; }
        #comment-box textarea:focus { outline: 2px solid #5865f2; }
        /* Barra de rolagem estilizada para comentários */
        #comentarios-list::-webkit-scrollbar {
          width: 8px;
          background: #23272f;
          border-radius: 8px;
        }
        #comentarios-list::-webkit-scrollbar-thumb {
          background: #5865f2;
          border-radius: 8px;
        }
        #comentarios-list::-webkit-scrollbar-thumb:hover {
          background: #4752c4;
        }
        /* Firefox */
        #comentarios-list {
          scrollbar-width: thin;
          scrollbar-color: #5865f2 #23272f;
        }
      </style>
    `;

    // Insere box na extra-sidebar
    const sidebar = document.querySelector('.extra-sidebar');
    if (sidebar) {
      sidebar.innerHTML = '';
      sidebar.appendChild(box);
    } else {
      document.body.appendChild(box);
    }

    // Fechar box
    document.getElementById('close-comment').onclick = function() {
      if (sidebar) {
        sidebar.innerHTML = '';
      } else {
        box.remove();
      }
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
              document.getElementById('comment-text').value = '';
              // Atualiza comentários na tela
              showCommentModal(postId);
            }
          });
        });
      });
    };
  });
}

// Exporte para uso em outros scripts
window.showCommentModal = showCommentModal;
