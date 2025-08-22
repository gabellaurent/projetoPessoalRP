// likes.js
// Funções para registrar, remover e consultar likes usando Supabase (window.supabaseClient)

// Registrar um like
export async function addLike(user_id, post_id) {
  const supabase = await new Promise(resolve => {
    window.supabaseClient.load(client => resolve(client));
  });
  const { data, error } = await supabase
    .from('likes')
    .insert([
      { user_id, post_id }
    ]);
  return { data, error };
}

// Remover um like
export async function removeLike(user_id, post_id) {
  const supabase = await new Promise(resolve => {
    window.supabaseClient.load(client => resolve(client));
  });
  const { data, error } = await supabase
    .from('likes')
    .delete()
    .match({ user_id, post_id });
  return { data, error };
}

// Consultar se o usuário já deu like em uma postagem
export async function hasLiked(user_id, post_id) {
  const supabase = await new Promise(resolve => {
    window.supabaseClient.load(client => resolve(client));
  });
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user_id)
    .eq('post_id', post_id);
  return { liked: data && data.length > 0, error };
}
