// login-supabase.js
// Autenticação de login usando Supabase

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = 'https://xhybbhdhjaluqjrtopml.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoeWJiaGRoamFsdXFqcnRvcG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzQ5NjMsImV4cCI6MjA2ODg1MDk2M30.Xb98A6l-duDBO6G8_3SPKwluyAm-v8LH5G22ysmSXck';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function autenticarUsuario(username, password) {
    // Busca usuário pelo username
    const { data, error } = await supabase
        .from('base-users')
        .select('username, password')
        .eq('username', username)
        .single();
    if (error || !data) {
        return { sucesso: false, mensagem: 'Usuário não encontrado.' };
    }
    // Verifica senha
    if (data.password === password) {
        return { sucesso: true, usuario: data };
    } else {
        return { sucesso: false, mensagem: 'Senha incorreta.' };
    }
}
