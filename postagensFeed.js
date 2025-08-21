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
    // Função desativada: use renderPostagensFeed para atualizar o feed principal
    // Mantida apenas para compatibilidade, mas não faz nada
    return [];
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
                    .select('titulo, post_content, author, author_id, created_at', { count: 'exact' })
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
            const postDiv = document.createElement('div');
            postDiv.className = 'post-item fadein-post';
            postDiv.style.animationDelay = (idx * 100) + 'ms';

            const h1 = document.createElement('h1');
            h1.classList.add('fadein-post');
            h1.style.animationDelay = (idx * 100) + 'ms';
            // Formata data
            let dataFormatada = '';
            if (post.created_at) {
                const d = new Date(post.created_at);
                const hoje = new Date();
                const ontem = new Date();
                ontem.setDate(hoje.getDate() - 1);
                function isSameDay(a, b) {
                    return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
                }
                if (isSameDay(d, hoje)) {
                    dataFormatada = `Hoje, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                } else if (isSameDay(d, ontem)) {
                    dataFormatada = `Ontem, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                } else {
                    dataFormatada = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                }
            }
            // Monta título estilo Reddit
            h1.innerHTML = `<span style="font-weight:bold;">${post.titulo || 'titulo da postagem'}</span> <span style="font-size:0.9rem;color:#bbb;margin-left:12px;">por <a href="#" class="user-link" style="color:#8ab4f8;text-decoration:underline;" data-userid="${post.author_id}">${post.author || 'usuário'}</a> • ${dataFormatada}</span>`;

            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = formatarTexto(post.post_content || 'corpo da postagem');
            contentDiv.classList.add('fadein-post', 'post-content');
            contentDiv.style.animationDelay = (idx * 100 + 50) + 'ms';

            postDiv.appendChild(h1);
            postDiv.appendChild(contentDiv);
            feedContent.appendChild(postDiv);
        });
        // Adiciona botão 'Carregar mais' se houver mais postagens
            // Mostra o botão se houver mais postagens para carregar
            let btnCarregarMais = document.getElementById('btn-carregar-mais');
            if (!btnCarregarMais) {
                btnCarregarMais = document.createElement('button');
                btnCarregarMais.id = 'btn-carregar-mais';
                btnCarregarMais.className = 'btn-carregar-mais';
                btnCarregarMais.textContent = 'Carregar mais';
            }
            btnCarregarMais.style.display = (totalPosts > feedContent.querySelectorAll('.post-item').length) ? 'block' : 'none';
            btnCarregarMais.onclick = async function() {
                btnCarregarMais.disabled = true;
                btnCarregarMais.innerHTML = '<span class="spinner" style="display:inline-block;width:18px;height:18px;border:3px solid #fff;border-top:3px solid #6366f1;border-radius:50%;animation:spin 0.8s linear infinite;vertical-align:middle;"></span> Carregando...';
                if (!document.getElementById('carregar-mais-spinner-style')) {
                    const style = document.createElement('style');
                    style.id = 'carregar-mais-spinner-style';
                    style.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg);} 100% {transform: rotate(360deg);} }';
                    document.head.appendChild(style);
                }
                let offset = feedContent.querySelectorAll('.post-item').length;
                let novosPosts = [];
                if (window.supabaseClient && typeof window.supabaseClient.load === 'function') {
                    await new Promise(resolve => {
                        window.supabaseClient.load(async function(client) {
                            const { data, error } = await client
                                .from('posts')
                                .select('titulo, post_content, author, author_id, created_at')
                                .order('created_at', { ascending: false })
                                .range(offset, offset + 4); // 5 itens por vez
                            if (data && data.length > 0) {
                                novosPosts = data;
                            }
                            resolve();
                        });
                    });
                }
                novosPosts.forEach((post, idx) => {
                    const postDiv = document.createElement('div');
                    postDiv.className = 'post-item fadein-post';
                    postDiv.style.animationDelay = ((offset + idx) * 100) + 'ms';
                    const h1 = document.createElement('h1');
                    h1.classList.add('fadein-post');
                    h1.style.animationDelay = ((offset + idx) * 100) + 'ms';
                    let dataFormatada = '';
                    if (post.created_at) {
                        const d = new Date(post.created_at);
                        const hoje = new Date();
                        const ontem = new Date();
                        ontem.setDate(hoje.getDate() - 1);
                        function isSameDay(a, b) {
                            return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
                        }
                        if (isSameDay(d, hoje)) {
                            dataFormatada = `Hoje, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                        } else if (isSameDay(d, ontem)) {
                            dataFormatada = `Ontem, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                        } else {
                            dataFormatada = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                        }
                    }
                    h1.innerHTML = `<span style=\"font-weight:bold;\">${post.titulo || 'titulo da postagem'}</span> <span style=\"font-size:0.9rem;color:#bbb;margin-left:12px;\">por <a href=\"#\" class=\"user-link\" style=\"color:#8ab4f8;text-decoration:underline;\" data-userid=\"${post.author_id}\">${post.author || 'usuário'}</a> • ${dataFormatada}</span>`;
                    const contentDiv = document.createElement('div');
                    contentDiv.innerHTML = formatarTexto(post.post_content || 'corpo da postagem');
                    contentDiv.classList.add('fadein-post', 'post-content');
                    contentDiv.style.animationDelay = ((offset + idx) * 100 + 50) + 'ms';
                    postDiv.appendChild(h1);
                    postDiv.appendChild(contentDiv);
                    // Insere acima do botão 'Carregar mais'
                    if (btnCarregarMais && btnCarregarMais.parentNode === feedContent) {
                        feedContent.insertBefore(postDiv, btnCarregarMais);
                    } else {
                        feedContent.appendChild(postDiv);
                    }
                });
                // Atualiza visibilidade do botão
                btnCarregarMais.disabled = false;
                btnCarregarMais.innerHTML = 'Carregar mais';
                if ((offset + novosPosts.length) >= totalPosts || novosPosts.length === 0) {
                    btnCarregarMais.style.display = 'none';
                }
            };
            feedContent.appendChild(btnCarregarMais);
    }
}
