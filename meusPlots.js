// Injeta conteúdo de plots no main-content
export function renderPlots() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    let div = document.getElementById('plots-content');
    if (!div) {
        div = document.createElement('div');
        div.id = 'plots-content';
        mainContent.appendChild(div);
    }
    div.innerHTML = '';
    const h1 = document.createElement('h1');
    h1.textContent = 'Meus Plots';
    div.appendChild(h1);
    // Adicione mais conteúdo aqui se desejar
}
