// Injeta conteúdo de roleplays no main-content
export function renderRoleplays() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    let div = document.getElementById('roleplays-content');
    if (!div) {
        div = document.createElement('div');
        div.id = 'roleplays-content';
        mainContent.appendChild(div);
    }
    div.innerHTML = '';
    const h1 = document.createElement('h1');
    h1.textContent = 'Meus Roleplays';
    div.appendChild(h1);
    // Adicione mais conteúdo aqui se desejar
}
