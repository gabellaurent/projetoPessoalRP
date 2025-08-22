// Dados simulados de postagens e comentários
const posts = [
  { id: 1, titulo: 'Primeira Postagem', conteudo: 'Conteúdo da primeira postagem.' },
  { id: 2, titulo: 'Segunda Postagem', conteudo: 'Conteúdo da segunda postagem.' }
];

const comentarios = [
  { id: 1, postId: 1, autor: 'João', texto: 'Ótima postagem!' },
  { id: 2, postId: 1, autor: 'Maria', texto: 'Concordo com você.' },
  { id: 3, postId: 2, autor: 'Pedro', texto: 'Muito interessante.' }
];

// Função para exibir detalhes da postagem e comentários
export function exibirPostagemEDetalhes(postId) {
  const post = posts.find(p => p.id === postId);
  const comentariosRelacionados = comentarios.filter(c => c.postId === postId);

  const detalheDiv = document.getElementById('post-detalhe');
  if (!detalheDiv) return;

  detalheDiv.innerHTML = `
    <h2>${post.titulo}</h2>
    <p>${post.conteudo}</p>
    <h3>Comentários</h3>
    <ul>
      ${comentariosRelacionados.map(c => `<li><strong>${c.autor}:</strong> ${c.texto}</li>`).join('')}
    </ul>
  `;
}

// Captura clique nas postagens dentro do main-content
function setupPostClick() {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  mainContent.addEventListener('click', function(e) {
    const postElement = e.target.closest('.postagem');
    if (postElement) {
      const postId = parseInt(postElement.dataset.postId, 10);
      exibirPostagemEDetalhes(postId);
    }
  });
}

// Inicialização
window.addEventListener('DOMContentLoaded', setupPostClick);
