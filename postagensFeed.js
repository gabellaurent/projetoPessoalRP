// Função para buscar e exibir todas as postagens no main-content
export async function renderPostagensFeed() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    mainContent.innerHTML = '';
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
        mainContent.appendChild(h1);
        mainContent.appendChild(p);
    } else {
        posts.forEach(post => {
            const h1 = document.createElement('h1');
            h1.textContent = post.titulo || 'titulo da postagem';
            const p = document.createElement('p');
            p.textContent = post.conteudo || 'corpo da postagem';
            mainContent.appendChild(h1);
            mainContent.appendChild(p);
        });
    }
}
