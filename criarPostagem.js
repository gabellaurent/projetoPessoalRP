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

    // Cria o container do editor e adiciona ao main-content
    const editorDiv = document.createElement('div');
    editorDiv.className = 'container criar-postagem-container';
    editorDiv.innerHTML = `
        <h2>Criar Postagem</h2>
        <form id="postForm">
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

    function inicializarQuill() {
        const quill = new Quill('#editor', {
            theme: 'snow',
            placeholder: 'Escreva sua postagem aqui...'
        });
        document.getElementById('postForm').onsubmit = function(e) {
            e.preventDefault();
            var conteudo = quill.root.innerHTML;
            alert('Conteúdo da postagem:\n' + conteudo);
            // Aqui você pode enviar o conteúdo para o backend
        };
    }
}
