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
        <h2>Criar Postagem</h2>
        <form id="postForm">
            <input type="text" id="tituloPost" placeholder="Título da postagem" required style="width:100%;margin-bottom:10px;" />
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

            // Supondo que a uuid do usuário logado está disponível em window.userUUID
            const userUUID = window.userUUID;
            if (!userUUID) {
                if (btnPublicar) {
                    btnPublicar.disabled = false;
                    btnPublicar.innerHTML = 'Publicar';
                }
                return;
            }

            // Usa o supabaseClient global
            let supabase = await new Promise((resolve, reject) => {
                if (window.supabaseClient && typeof window.supabaseClient.load === 'function') {
                    window.supabaseClient.load(client => resolve(client));
                } else {
                    reject('SupabaseClient não carregado');
                }
            });

            // Busca o username na tabela base-users
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

            // Data de criação
            const created_at = new Date().toISOString();

            // Salva na tabela posts
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
                // Adiciona o novo post ao topo do feed e só remove o editor após garantir que foi carregado
                if (postData && postData[0] && postData[0].id) {
                    import('./postagensFeed.js').then(module => {
                        module.adicionarNovasPostagensFeed([]).then(() => {
                            // Opcional: adiciona o novo ID ao array global
                            if (window.postIdsExibidos && typeof window.postIdsExibidos === 'object') {
                                window.postIdsExibidos.unshift(postData[0].id);
                            }
                            // Agora remove o editor e exibe o feed
                            document.querySelector('.criar-postagem-container')?.remove();
                            const feedContent = document.getElementById('feed-content');
                            if (feedContent) feedContent.style.display = 'block';
                        });
                    });
                } else {
                    if (btnPublicar) {
                        btnPublicar.disabled = false;
                        btnPublicar.innerHTML = 'Publicar';
                    }
                }
            }
        };
    }
}
