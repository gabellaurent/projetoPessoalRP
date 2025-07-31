// Carrega main-content.js automaticamente ao abrir o site
window.addEventListener('DOMContentLoaded', function() {
    var hideLoader = function() {
        var loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
    };
    var showMainContentWhenReady = function() {
        var mainContent = document.querySelector('.main-content');
        var checkReady = function() {
            if (mainContent && mainContent.children.length > 0) {
                hideLoader();
            } else {
                setTimeout(checkReady, 50);
            }
        };
        checkReady();
    };
    if (!window.renderMainContent) {
        var oldScript = document.querySelector('script[src="main-content.js"]');
        if (oldScript) oldScript.remove();
        var script = document.createElement('script');
        script.src = 'main-content.js';
        script.onload = function() {
            if (window.renderMainContent) window.renderMainContent('.main-content');
            showMainContentWhenReady();
        };
        document.body.appendChild(script);
    } else {
        window.renderMainContent('.main-content');
        showMainContentWhenReady();
    }

});

// ...existing code...