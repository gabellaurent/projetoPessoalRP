// Função para criar o editor de postagem dentro de um elemento alvo
export function criarEditorPostagem(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;

    // Adiciona o CSS do Quill se ainda não estiver presente
    if (!document.getElementById('quill-css')) {
        const link = document.createElement('link');
        link.id = 'quill-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
        document.head.appendChild(link);
    }

    // Oculta o feed se existir
    const feed = document.getElementById('feed-content');
    if (feed) feed.style.display = 'none';

    // Remove editor anterior se existir
    target.querySelector('.criar-postagem-container')?.remove();

    // Cria o container do editor e adiciona ao main-content com fade-in
    const editorDiv = document.createElement('div');
    editorDiv.className = 'container criar-postagem-container fadein-post';
    editorDiv.innerHTML = `
        
        <form id="postForm">
            <input type="text" id="tituloPost" placeholder="Título da postagem" required style="width:100%;background-color:transparent;margin-bottom:10px;font-size:2.2rem;font-weight:bold;border:none;outline:none;font-family:inherit;color:#fff;" />
            <div id="editor"></div>
            <button type="submit">Publicar</button>
        </form>
    `;
    target.appendChild(editorDiv);

    // Adiciona o JS do Quill se ainda não estiver presente
    if (!window.Quill) {
        const script = document.createElement('script');
        script.src = 'https://cdn.quilljs.com/1.3.6/quill.js';
        script.onload = inicializarQuill;
        document.body.appendChild(script);
    } else {
        inicializarQuill();
    }

    async function inicializarQuill() {
        const quill = new Quill('#editor', {
            theme: 'snow',
            placeholder: 'Escreva sua postagem aqui...'
        });
        document.getElementById('postForm').onsubmit = async function(e) {
            e.preventDefault();
            const btnPublicar = document.querySelector('#postForm button[type="submit"]');
            if (btnPublicar) {
                btnPublicar.disabled = true;
                btnPublicar.innerHTML = '<span class="spinner" style="display:inline-block;width:18px;height:18px;border:3px solid #fff;border-top:3px solid #6366f1;border-radius:50%;animation:spin 0.8s linear infinite;vertical-align:middle;"></span> Publicando...';
                if (!document.getElementById('publicar-spinner-style')) {
                    const style = document.createElement('style');
                    style.id = 'publicar-spinner-style';
                    style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg);} 100% {transform: rotate(360deg);} }';
                    document.head.appendChild(style);
                }
            }

            const titulo = document.getElementById('tituloPost').value.trim();
            const conteudo = quill.root.innerHTML;
            const userUUID = window.userUUID;
            if (!userUUID) {
                if (btnPublicar) {
                    btnPublicar.disabled = false;
                    btnPublicar.innerHTML = 'Publicar';
                }
                return;
            }

            let supabase = await new Promise((resolve, reject) => {
                if (window.supabaseClient && typeof window.supabaseClient.load === 'function') {
                    window.supabaseClient.load(client => resolve(client));
                } else {
                    reject('SupabaseClient não carregado');
                }
            });

            const { data: userData, error: userError } = await supabase
                .from('base_users')
                .select('username')
                .eq('id', userUUID)
                .single();
            if (userError || !userData) {
                if (btnPublicar) {
                    btnPublicar.disabled = false;
                    btnPublicar.innerHTML = 'Publicar';
                }
                return;
            }
            const author = userData.username;
            const created_at = new Date().toISOString();
            const { data: postData, error: postError } = await supabase
                .from('posts')
                .insert([
                    {
                        titulo,
                        author,
                        author_id: userUUID,
                        created_at,
                        post_content: conteudo
                    }
                ])
                .select();
            if (postError) {
                if (btnPublicar) {
                    btnPublicar.disabled = false;
                    btnPublicar.innerHTML = 'Publicar';
                }
                // Erro ao salvar postagem
            } else {
                // Remove o formulário e botão, exibe mensagem de sucesso com botão para carregar o feed
                const editorContainer = document.querySelector('.criar-postagem-container');
                if (editorContainer) {
                    editorContainer.innerHTML = `
                        <h2 style="color:#fff;">Postagem publicada, já se encontra disponível no 
                            <button id="btn-ir-feed" style="background:#6366f1;color:#fff;border:none;padding:6px 18px;border-radius:6px;font-size:1rem;cursor:pointer;margin-left:6px;">Postagem Feed</button>
                        </h2>
                    `;
                    const btnIrFeed = document.getElementById('btn-ir-feed');
                    if (btnIrFeed) {
                        btnIrFeed.onclick = function() {
                            // Simula clique no botão da sidebar
                            const btnSidebarFeed = document.getElementById('menu-feed');
                            if (btnSidebarFeed) {
                                btnSidebarFeed.click();
                            }
                        };
                    }
                }
            }
        };
    }
}
