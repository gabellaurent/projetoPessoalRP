// sidebar-users.js
// Script para listar usuários registrados na sidebar usando Supabase

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = 'https://xhybbhdhjaluqjrtopml.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoeWJiaGRoamFsdXFqcnRvcG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzQ5NjMsImV4cCI6MjA2ODg1MDk2M30.Xb98A6l-duDBO6G8_3SPKwluyAm-v8LH5G22ysmSXck';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function listarUsuariosSidebar(elementId = 'sidebar-user-list') {
    const sidebarList = document.getElementById(elementId);
    if (!sidebarList) return;
    sidebarList.innerHTML = "Carregando...";
    const { data, error } = await supabase
        .from('base-users')
        .select('username');
    if (error) {
        sidebarList.innerHTML = "<li>Erro ao carregar usuários.</li>";
        console.error("Erro ao buscar usuários:", error.message);
        return;
    }
    if (!data || data.length === 0) {
        sidebarList.innerHTML = "<li>Nenhum usuário encontrado.</li>";
        return;
    }
    sidebarList.innerHTML = "";
    data.forEach(user => {
        const li = document.createElement("li");
        li.textContent = user.username;
        sidebarList.appendChild(li);
    });
}

// Para uso direto em HTML, pode-se importar e chamar listarUsuariosSidebar()
