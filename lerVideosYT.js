// Script para procurar links de vídeos do YouTube nas postagens e renderizar o vídeo
// Chame renderizarVideosYoutube() após as postagens serem carregadas na página

function renderizarVideosYoutube(postContainerSelector = '.main-content') {
    const container = document.querySelector(postContainerSelector);
    if (!container) return;
    // Procura todos os elementos que podem conter links (ex: div, p, span, a)
    const elements = container.querySelectorAll('div, p, span, a');
    // Regex pega link do YouTube mesmo seguido de <br>, espaço, pontuação, etc
    const ytRegex = /(https?:\/\/(?:www\.|m\.)?youtube\.com\/watch\?v=([\w-]+)|https?:\/\/youtu\.be\/([\w-]+))(?![^<]*>)/gi;
    elements.forEach(el => {
        // Se for <a>, verifica se o href é do YouTube
        if (el.tagName === 'A') {
            const href = el.getAttribute('href');
            const match = ytRegex.exec(href);
            ytRegex.lastIndex = 0;
            if (match) {
                const videoId = match[2] || match[3];
                if (videoId) {
                    el.outerHTML = `<div class=\"yt-video-embed\" style=\"margin:10px 0;max-width:560px;\"><div style=\"position:relative;width:100%;padding-bottom:56.25%;height:0;\"><iframe style=\"position:absolute;top:0;left:0;width:100%;height:100%;border-radius:8px;\" src=\"https://www.youtube.com/embed/${videoId}\" frameborder=\"0\" allowfullscreen></iframe></div></div>`;
                }
            }
        } else {
            // Procura links do YouTube no texto
            let html = el.innerHTML;
            let newHtml = html.replace(ytRegex, function(match, url1, id1, id2) {
                const videoId = id1 || id2;
                if (videoId) {
                    return `<div class=\"yt-video-embed\" style=\"margin:10px 0;max-width:560px;\"><div style=\"position:relative;width:100%;padding-bottom:56.25%;height:0;\"><iframe style=\"position:absolute;top:0;left:0;width:100%;height:100%;border-radius:8px;\" src=\"https://www.youtube.com/embed/${videoId}\" frameborder=\"0\" allowfullscreen></iframe></div></div>`;
                }
                return match;
            });
            if (newHtml !== html) {
                el.innerHTML = newHtml;
            }
        }
    });
}
window.renderizarVideosYoutube = renderizarVideosYoutube;

// Exemplo de uso automático ao carregar as postagens
// window.addEventListener('DOMContentLoaded', () => {
//     renderizarVideosYoutube('.main-content');
// });

// Você pode chamar renderizarVideosYoutube() manualmente após carregar as postagens
