// Função para buscar e exibir todas as postagens no main-content
// Função incremental para adicionar apenas novas postagens ao feed
export async function adicionarNovasPostagensFeed(postIdsExibidos = []) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    let feedContent = document.getElementById('feed-content');
    if (!feedContent) {
        feedContent = document.createElement('div');
        feedContent.id = 'feed-content';
        mainContent.appendChild(feedContent);
    }
    let novosPosts = [];
    if (window.supabaseClient && typeof window.supabaseClient.load === 'function') {
        await new Promise(resolve => {
            window.supabaseClient.load(async function(client) {
                const { data, error } = await client
                    .from('posts')
                    .select('id, titulo, post_content, created_at')
                    .order('created_at', { ascending: false });
                if (data && data.length > 0) {
                    novosPosts = data.filter(post => !postIdsExibidos.includes(post.id));
                }
                resolve();
            });
        });
    }
    novosPosts.forEach((post, idx) => {
        // Evita duplicação: verifica se já existe um h1 com o mesmo texto e um p com o mesmo conteúdo
        const existeH1 = Array.from(feedContent.querySelectorAll('h1')).some(h => h.textContent === (post.titulo || 'titulo da postagem'));
        const existeP = Array.from(feedContent.querySelectorAll('p')).some(pEl => pEl.innerHTML === (post.post_content || 'corpo da postagem'));
        if (!existeH1 || !existeP) {
            const h1 = document.createElement('h1');
            h1.textContent = post.titulo || 'titulo da postagem';
            const p = document.createElement('p');
            p.innerHTML = post.post_content || 'corpo da postagem';
            h1.classList.add('fadein-post');
            p.classList.add('fadein-post');
            // Insere no topo do feed
            if (feedContent.firstChild) {
                feedContent.insertBefore(p, feedContent.firstChild);
                feedContent.insertBefore(h1, p);
            } else {
                feedContent.appendChild(h1);
                feedContent.appendChild(p);
            }
        }
    });
    return novosPosts.map(post => post.id);
}
export async function renderPostagensFeed() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    let feedContent = document.getElementById('feed-content');
    if (!feedContent) {
        feedContent = document.createElement('div');
        feedContent.id = 'feed-content';
        mainContent.appendChild(feedContent);
    }
    feedContent.innerHTML = '';
    let posts = [];
    let totalPosts = 0;
    if (window.supabaseClient && typeof window.supabaseClient.load === 'function') {
        await new Promise(resolve => {
            window.supabaseClient.load(async function(client) {
                const { data, count, error } = await client
                    .from('posts')
                    .select('titulo, post_content', { count: 'exact' })
                    .order('created_at', { ascending: false })
                    .limit(15);
                if (data && data.length > 0) {
                    posts = data;
                    totalPosts = count || data.length;
                }
                resolve();
            });
        });
    }
    // Função para processar o texto: *italico*, **negrito**, \n para <br>
    function formatarTexto(texto) {
        if (!texto) return '';
        // Imagem: URLs terminando com .png, .jpg, .jpeg, .gif
        texto = texto.replace(/(https?:\/\/\S+\.(?:png|jpg|jpeg|gif))/gi, '<img src="$1" style="max-width:100%;margin:12px 0;border-radius:8px;" />');
        // YouTube: links do tipo https://www.youtube.com/watch?v=ID ou https://youtu.be/ID
        texto = texto.replace(
            /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]{11})/gi,
            '<div class="youtube-embed"><iframe src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe></div>'
        );
        texto = texto.replace(
            /https?:\/\/youtu\.be\/([\w-]{11})/gi,
            '<div class="youtube-embed"><iframe src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe></div>'
        );
        // Negrito: **texto**
        texto = texto.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Itálico: *texto*
        texto = texto.replace(/\*(?!\*)([^*]+)\*/g, '<em>$1</em>');
        // Quebra de linha
        texto = texto.replace(/\n/g, '<br>');
        return texto;
    }
    // Adiciona fade-in para cada item
    function fadeInElement(el, delay = 0) {
        el.classList.add('fadein-post');
        el.style.animationDelay = delay + 'ms';
    }
    if (posts.length === 0) {
        const h1 = document.createElement('h1');
        h1.textContent = 'titulo da postagem';
        const p = document.createElement('p');
        p.innerHTML = formatarTexto('corpo da postagem');
        feedContent.appendChild(h1);
        feedContent.appendChild(p);
        fadeInElement(h1, 0);
        fadeInElement(p, 100);
    } else {
        // Garante que posts estejam do mais novo para o mais antigo
        posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        posts.forEach((post, idx) => {
            const h1 = document.createElement('h1');
            h1.textContent = post.titulo || 'titulo da postagem';
            const p = document.createElement('p');
            p.innerHTML = formatarTexto(post.post_content || 'corpo da postagem');
            feedContent.appendChild(h1);
            feedContent.appendChild(p);
            fadeInElement(h1, idx * 100);
            fadeInElement(p, idx * 100 + 50);
        });
        // Adiciona botão 'Carregar mais' se houver mais postagens
        if (totalPosts > posts.length) {
            let btnCarregarMais = document.getElementById('btn-carregar-mais');
            if (!btnCarregarMais) {
                btnCarregarMais = document.createElement('button');
                btnCarregarMais.id = 'btn-carregar-mais';
                btnCarregarMais.className = 'btn-carregar-mais';
                btnCarregarMais.textContent = 'Carregar mais';
            }
            btnCarregarMais.onclick = async function() {
                // Adiciona spinner
                btnCarregarMais.disabled = true;
                btnCarregarMais.innerHTML = '<span class="spinner" style="display:inline-block;width:18px;height:18px;border:3px solid #fff;border-top:3px solid #6366f1;border-radius:50%;animation:spin 0.8s linear infinite;vertical-align:middle;"></span> Carregando...';
                if (!document.getElementById('carregar-mais-spinner-style')) {
                    const style = document.createElement('style');
                    style.id = 'carregar-mais-spinner-style';
                    style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg);} 100% {transform: rotate(360deg);} }';
                    document.head.appendChild(style);
                }
                // Busca mais postagens e adiciona ao final
                let offset = feedContent.querySelectorAll('h1').length;
                if (window.supabaseClient && typeof window.supabaseClient.load === 'function') {
                    await new Promise(resolve => {
                        window.supabaseClient.load(async function(client) {
                            const { data, error } = await client
                                .from('posts')
                                .select('titulo, post_content, created_at')
                                .order('created_at', { ascending: false })
                                .range(offset, offset + 14);
                            if (data && data.length > 0) {
                                // Garante que posts estejam do mais novo para o mais antigo
                                data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                                data.forEach((post, idx) => {
                                    const h1 = document.createElement('h1');
                                    h1.textContent = post.titulo || 'titulo da postagem';
                                    const p = document.createElement('p');
                                    p.innerHTML = formatarTexto(post.post_content || 'corpo da postagem');
                                    feedContent.appendChild(h1);
                                    feedContent.appendChild(p);
                                    fadeInElement(h1, (offset + idx) * 100);
                                    fadeInElement(p, (offset + idx) * 100 + 50);
                                });
                                // Remove botão se não houver mais postagens
                                if (data.length < 15) {
                                    btnCarregarMais.remove();
                                } else {
                                    btnCarregarMais.disabled = false;
                                    btnCarregarMais.innerHTML = 'Carregar mais';
                                }
                            } else {
                                btnCarregarMais.remove();
                            }
                            resolve();
                        });
                    });
                } else {
                    btnCarregarMais.disabled = false;
                    btnCarregarMais.innerHTML = 'Carregar mais';
                }
            };
            feedContent.appendChild(btnCarregarMais);
        }
    }
}
