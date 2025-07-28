// supabaseClient.js
// Centraliza a configuração do Supabase para uso em vários arquivos

// Para uso em módulos ES (import/export)
// export const supabaseUrl = 'https://xhybbhdhjaluqjrtopml.supabase.co';
// export const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoeWJiaGRoamFsdXFqcnRvcG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzQ5NjMsImV4cCI6MjA2ODg1MDk2M30.Xb98A6l-duDBO6G8_3SPKwluyAm-v8LH5G22ysmSXck';
// export const supabase = createClient(supabaseUrl, supabaseKey);

// Para uso em scripts tradicionais (window.supabaseClient)
(function() {
  const supabaseUrl = 'https://xhybbhdhjaluqjrtopml.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoeWJiaGRoamFsdXFqcnRvcG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzQ5NjMsImV4cCI6MjA2ODg1MDk2M30.Xb98A6l-duDBO6G8_3SPKwluyAm-v8LH5G22ysmSXck';
  let singletonClient = null;
  function loadSupabase(callback) {
    function createOrReturnClient() {
      if (!singletonClient) {
        singletonClient = window.supabase.createClient(supabaseUrl, supabaseKey);
      }
      callback(singletonClient);
    }
    if (window.supabase && window.supabase.createClient) {
      createOrReturnClient();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js';
    script.onload = function() {
      createOrReturnClient();
    };
    document.head.appendChild(script);
  }
  window.supabaseClient = {
    load: loadSupabase,
    url: supabaseUrl,
    key: supabaseKey
  };
})();
