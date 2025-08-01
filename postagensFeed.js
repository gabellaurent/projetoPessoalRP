// Função para buscar e exibir todas as postagens no main-content
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
    if (window.supabaseClient && typeof window.supabaseClient.load === 'function') {
        await new Promise(resolve => {
            window.supabaseClient.load(async function(client) {
                const { data, error } = await client.from('posts').select('titulo, post_content').order('created_at', { ascending: false });
                if (data && data.length > 0) {
                    posts = data;
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
    }
}
