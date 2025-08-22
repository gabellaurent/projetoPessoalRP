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
                    .select('id, titulo, post_content, author, author_id, created_at', { count: 'exact' })
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
            // postDiv.style.maxHeight = '600px';
            // postDiv.style.overflow = 'hidden';

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

            const postBodyDiv = document.createElement('div');
            postBodyDiv.className = 'postBody';
            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = formatarTexto(post.post_content || 'corpo da postagem');
            contentDiv.classList.add('fadein-post', 'post-content');
            contentDiv.style.animationDelay = (idx * 100 + 50) + 'ms';
            postBodyDiv.appendChild(contentDiv);

            postDiv.appendChild(h1);
            postDiv.appendChild(postBodyDiv);
            // Adiciona botão 'Exibir mais' se o conteúdo exceder o max-height
            setTimeout(() => {
                if (contentDiv.scrollHeight > postBodyDiv.clientHeight) {
                    // Adiciona gradiente
                    postBodyDiv.style.position = 'relative';
                    const gradiente = document.createElement('div');
                    gradiente.className = 'postBody-gradient';
                    gradiente.style.position = 'absolute';
                    gradiente.style.left = '0';
                    gradiente.style.right = '0';
                    gradiente.style.bottom = '0';
                    gradiente.style.height = '300px';
                    gradiente.style.pointerEvents = 'none';
                    gradiente.style.background = 'linear-gradient(to bottom, rgba(35,39,47,0), #23272F 90%)';
                    gradiente.style.borderRadius = 'inherit';
                    gradiente.style.zIndex = '2';
                    postBodyDiv.appendChild(gradiente);

                    const btnExibirMais = document.createElement('button');
                    btnExibirMais.className = 'btn-exibir-mais';
                    btnExibirMais.textContent = 'Exibir mais';
                    btnExibirMais.style.display = 'block';
                    btnExibirMais.style.margin = '8px auto';
                    btnExibirMais.style.padding = '6px 18px';
                    btnExibirMais.style.borderRadius = '8px';
                    btnExibirMais.style.background = '#353942';
                    btnExibirMais.style.color = '#b8c7d1';
                    btnExibirMais.style.fontWeight = '600';
                    btnExibirMais.style.border = 'none';
                    btnExibirMais.style.cursor = 'pointer';
                    btnExibirMais.style.zIndex = '3';
                    btnExibirMais.onclick = function() {
                        postBodyDiv.style.maxHeight = 'none';
                        btnExibirMais.style.display = 'none';
                        if (gradiente && gradiente.parentNode) gradiente.parentNode.removeChild(gradiente);
                    };
                    postBodyDiv.parentNode.insertBefore(btnExibirMais, actionsDiv);
                }
            }, 0);
            // ...removido HR antes dos botões...
            // Botões de curtir e comentar
            const actionsDiv = document.createElement('div');
            actionsDiv.style.display = 'flex';
            actionsDiv.style.justifyContent = 'flex-start';
            actionsDiv.style.gap = '12px';
            actionsDiv.style.marginBottom = '8px';
            // Botão curtir com coração e contador
            const btnCurtir = document.createElement('button');
            btnCurtir.className = 'btn-curtir';
            btnCurtir.style.padding = '6px 12px';
            btnCurtir.style.borderRadius = '50%';
            btnCurtir.style.border = 'none';
            btnCurtir.style.background = 'transparent';
            btnCurtir.style.cursor = 'pointer';
            btnCurtir.style.display = 'flex';
            btnCurtir.style.alignItems = 'center';
            // Ícone SVG coração
            btnCurtir.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e25555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 5.6c-1.5-1.7-4.1-1.7-5.6 0l-.7.8-.7-.8c-1.5-1.7-4.1-1.7-5.6 0-1.6 1.8-1.6 4.6 0 6.4l.7.8 5.6 6.1 5.6-6.1.7-.8c1.6-1.8 1.6-4.6 0-6.4z"></path></svg>`;
            // Contador de curtidas
            const likesCount = document.createElement('span');
            likesCount.className = 'likes-count';
            likesCount.textContent = '0';
            likesCount.style.marginLeft = '6px';
            likesCount.style.fontWeight = 'bold';
            likesCount.style.color = '#e25555';
            btnCurtir.appendChild(likesCount);

            // Consulta quantidade de likes na tabela likes
            window.supabaseClient.load(async function(client) {
                const { count, error } = await client
                    .from('likes')
                    .select('id', { count: 'exact', head: true })
                    .eq('post_id', post.id);
                if (!error && typeof count === 'number') {
                    likesCount.textContent = count.toString();
                }
            });

            // Integração com likes.js
            import('./likes.js').then(({ addLike, removeLike, hasLiked }) => {
                let liked = false;
                let user_id = window.supabaseClient?.currentUser?.id;
                let post_id = post.id;
                // Verifica se o usuário já curtiu
                if (user_id && post_id) {
                    hasLiked(user_id, post_id).then(res => {
                        liked = res.liked;
                        if (liked) btnCurtir.classList.add('liked');
                    });
                }
                btnCurtir.addEventListener('click', async () => {
                    if (!user_id || !post_id) {
                        return;
                    }
                    if (!liked) {
                        const { error } = await addLike(user_id, post_id);
                        if (!error) {
                            liked = true;
                            btnCurtir.classList.add('liked');
                            likesCount.textContent = (parseInt(likesCount.textContent) + 1).toString();
                        }
                    } else {
                        const { error } = await removeLike(user_id, post_id);
                        if (!error) {
                            liked = false;
                            btnCurtir.classList.remove('liked');
                            likesCount.textContent = (parseInt(likesCount.textContent) - 1).toString();
                        }
                    }
                });
            });
            // Botão comentar com ícone e contador
            const btnComentar = document.createElement('button');
            btnComentar.className = 'btn-comentar';
            btnComentar.style.padding = '6px 12px';
            btnComentar.style.borderRadius = '50%';
            btnComentar.style.border = 'none';
            btnComentar.style.background = 'transparent';
            btnComentar.style.cursor = 'pointer';
            btnComentar.style.display = 'flex';
            btnComentar.style.alignItems = 'center';
            // Ícone SVG comentário
            btnComentar.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
            // Contador de comentários
            const commentsCount = document.createElement('span');
            commentsCount.className = 'comments-count';
            commentsCount.textContent = '...'; // Carregando
            commentsCount.style.marginLeft = '6px';
            commentsCount.style.fontWeight = 'bold';
            commentsCount.style.color = '#6366f1';
            btnComentar.appendChild(commentsCount);
            // Buscar quantidade real de comentários
            window.supabaseClient.load(async function(client) {
                const updateCount = async () => {
                    const { count, error } = await client
                        .from('comentarios_posts')
                        .select('id', { count: 'exact', head: true })
                        .eq('post_id', post.id);
                    if (!error && typeof count === 'number') {
                        commentsCount.textContent = count.toString();
                    } else {
                        commentsCount.textContent = '0';
                    }
                };
                await updateCount();
                // Listener realtime para atualizar contador
                const channel = client.channel('realtime-comments-count-' + post.id);
                channel.on(
                  'postgres_changes',
                  { event: '*', schema: 'public', table: 'comentarios_posts', filter: `post_id=eq.${post.id}` },
                  () => {
                    updateCount();
                  }
                );
                channel.subscribe();
            });
            // Evento para abrir caixa de comentário
            btnComentar.addEventListener('click', function(e) {
                e.stopPropagation(); // Evita propagação para outros elementos
                if (window.showCommentModal) {
                    window.showCommentModal(post.id);
                }
            });
            actionsDiv.appendChild(btnCurtir);
            actionsDiv.appendChild(btnComentar);
            postDiv.appendChild(actionsDiv);
            // Novo HR após os botões de ação
            const hrAcoes = document.createElement('hr');
            hrAcoes.style.margin = '8px 0 16px 0';
            hrAcoes.style.border = 'none';
            hrAcoes.style.borderTop = '1px solid #2d3b49';
            postDiv.appendChild(hrAcoes);
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
                    // postDiv.style.maxHeight = '600px';
                    // postDiv.style.overflow = 'hidden';
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
                    const postBodyDiv = document.createElement('div');
                    postBodyDiv.className = 'postBody';
                    const contentDiv = document.createElement('div');
                    contentDiv.innerHTML = formatarTexto(post.post_content || 'corpo da postagem');
                    contentDiv.classList.add('fadein-post', 'post-content');
                    contentDiv.style.animationDelay = ((offset + idx) * 100 + 50) + 'ms';
                    postBodyDiv.appendChild(contentDiv);
                    postDiv.appendChild(h1);
                    postDiv.appendChild(postBodyDiv);
                    // Adiciona botão 'Exibir mais' se o conteúdo exceder o max-height
                    setTimeout(() => {
                        if (contentDiv.scrollHeight > postBodyDiv.clientHeight) {
                            postBodyDiv.style.position = 'relative';
                            const gradiente = document.createElement('div');
                            gradiente.className = 'postBody-gradient';
                            gradiente.style.position = 'absolute';
                            gradiente.style.left = '0';
                            gradiente.style.right = '0';
                            gradiente.style.bottom = '0';
                            gradiente.style.height = '300px';
                            gradiente.style.pointerEvents = 'none';
                            gradiente.style.background = 'linear-gradient(to bottom, rgba(35,39,47,0), #23272F 90%)';
                            gradiente.style.borderRadius = 'inherit';
                            gradiente.style.zIndex = '2';
                            postBodyDiv.appendChild(gradiente);

                            const btnExibirMais = document.createElement('button');
                            btnExibirMais.className = 'btn-exibir-mais';
                            btnExibirMais.textContent = 'Exibir mais';
                            btnExibirMais.style.display = 'block';
                            btnExibirMais.style.margin = '8px auto';
                            btnExibirMais.style.padding = '6px 18px';
                            btnExibirMais.style.borderRadius = '8px';
                            btnExibirMais.style.background = '#353942';
                            btnExibirMais.style.color = '#b8c7d1';
                            btnExibirMais.style.fontWeight = '600';
                            btnExibirMais.style.border = 'none';
                            btnExibirMais.style.cursor = 'pointer';
                            btnExibirMais.style.zIndex = '3';
                            btnExibirMais.onclick = function() {
                                postBodyDiv.style.maxHeight = 'none';
                                btnExibirMais.style.display = 'none';
                                if (gradiente && gradiente.parentNode) gradiente.parentNode.removeChild(gradiente);
                            };
                            postBodyDiv.parentNode.insertBefore(btnExibirMais, actionsDiv);
                        }
                    }, 0);
                    // ...removido HR antes dos botões...
                    // Botões de curtir e comentar
                    const actionsDiv = document.createElement('div');
                    actionsDiv.style.display = 'flex';
                    actionsDiv.style.justifyContent = 'flex-start';
                    actionsDiv.style.gap = '12px';
                    actionsDiv.style.marginBottom = '8px';
                    // Botão curtir com coração e contador
                    const btnCurtir = document.createElement('button');
                    btnCurtir.className = 'btn-curtir';
                    btnCurtir.style.padding = '6px 12px';
                    btnCurtir.style.borderRadius = '50%';
                    btnCurtir.style.border = 'none';
                    btnCurtir.style.background = 'transparent';
                    btnCurtir.style.cursor = 'pointer';
                    btnCurtir.style.display = 'flex';
                    btnCurtir.style.alignItems = 'center';
                    // Ícone SVG coração
                    btnCurtir.innerHTML = `<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#e25555\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20.8 5.6c-1.5-1.7-4.1-1.7-5.6 0l-.7.8-.7-.8c-1.5-1.7-4.1-1.7-5.6 0-1.6 1.8-1.6 4.6 0 6.4l.7.8 5.6 6.1 5.6-6.1.7-.8c1.6-1.8 1.6-4.6 0-6.4z\"></path></svg>`;
                    // Contador de curtidas
                    const likesCount = document.createElement('span');
                    likesCount.className = 'likes-count';
                    likesCount.textContent = post.likes || '0';
                    likesCount.style.marginLeft = '6px';
                    likesCount.style.fontWeight = 'bold';
                    likesCount.style.color = '#e25555';
                    btnCurtir.appendChild(likesCount);
                    // Botão comentar com ícone e contador
                    const btnComentar = document.createElement('button');
                    btnComentar.className = 'btn-comentar';
                    btnComentar.style.padding = '6px 12px';
                    btnComentar.style.borderRadius = '50%';
                    btnComentar.style.border = 'none';
                    btnComentar.style.background = 'transparent';
                    btnComentar.style.cursor = 'pointer';
                    btnComentar.style.display = 'flex';
                    btnComentar.style.alignItems = 'center';
                    // Ícone SVG comentário
                    btnComentar.innerHTML = `<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#6366f1\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"></path></svg>`;
                    // Contador de comentários
                    const commentsCount = document.createElement('span');
                    commentsCount.className = 'comments-count';
                    commentsCount.textContent = post.comments || '0';
                    commentsCount.style.marginLeft = '6px';
                    commentsCount.style.fontWeight = 'bold';
                    commentsCount.style.color = '#6366f1';
                    btnComentar.appendChild(commentsCount);
                    actionsDiv.appendChild(btnCurtir);
                    actionsDiv.appendChild(btnComentar);
                    postDiv.appendChild(actionsDiv);
                    // Novo HR após os botões de ação
                    const hrAcoes = document.createElement('hr');
                    hrAcoes.style.margin = '8px 0 16px 0';
                    hrAcoes.style.border = 'none';
                    hrAcoes.style.borderTop = '1px solid #2d3b49';
                    postDiv.appendChild(hrAcoes);
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
