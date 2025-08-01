// Injeta conteúdo de personagens no main-content
export function renderPersonagens() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    let div = document.getElementById('personagens-content');
    if (!div) {
        div = document.createElement('div');
        div.id = 'personagens-content';
        mainContent.appendChild(div);
    }
    div.innerHTML = '';
    const h1 = document.createElement('h1');
    h1.textContent = 'Meus Personagens';
    div.appendChild(h1);
    // Adicione mais conteúdo aqui se desejar
}
