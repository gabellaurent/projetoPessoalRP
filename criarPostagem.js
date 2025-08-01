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
            const titulo = document.getElementById('tituloPost').value.trim();
            const conteudo = quill.root.innerHTML;

            // Supondo que a uuid do usuário logado está disponível em window.userUUID
            const userUUID = window.userUUID;
            if (!userUUID) {
                alert('Usuário não logado.');
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
                .from('base-users')
                .select('username')
                .eq('id', userUUID)
                .single();
            if (userError || !userData) {
                alert('Erro ao buscar usuário.');
                return;
            }
            const author = userData.username;

            // Data de criação
            const created_at = new Date().toISOString();

            // Salva na tabela posts
            const { error: postError } = await supabase
                .from('posts')
                .insert([
                    {
                        titulo,
                        author,
                        created_at,
                        post_content: conteudo
                    }
                ]);
            if (postError) {
                alert('Erro ao salvar postagem: ' + postError.message);
            } else {
                alert('Postagem publicada com sucesso!');
                // Opcional: Limpar o editor ou redirecionar
            }
        };
    }
}
