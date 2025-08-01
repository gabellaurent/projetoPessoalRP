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
                const { data, error } = await client.from('posts').select('titulo, conteudo').order('id', { ascending: true });
                if (data && data.length > 0) {
                    posts = data;
                }
                resolve();
            });
        });
    }
    if (posts.length === 0) {
        // Nenhuma postagem encontrada, exibe padrão
        const h1 = document.createElement('h1');
        h1.textContent = 'titulo da postagem';
        const p = document.createElement('p');
        p.textContent = 'corpo da postagem';
        feedContent.appendChild(h1);
        feedContent.appendChild(p);
    } else {
        posts.forEach(post => {
            const h1 = document.createElement('h1');
            h1.textContent = post.titulo || 'titulo da postagem';
            const p = document.createElement('p');
            p.textContent = post.conteudo || 'corpo da postagem';
            feedContent.appendChild(h1);
            feedContent.appendChild(p);
        });
    }
}
