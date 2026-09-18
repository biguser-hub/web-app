import { reactive } from 'vue'
import { supabase } from '../lib/supabase'

export const userStore = reactive({
  user: null,
  profile: null,
  loading: true
})

export async function loadUser() {
  const { data } = await supabase.auth.getUser()
  userStore.user = data.user
  if (data.user) {
    const result = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle()
    userStore.profile = result.data
  } else {
    userStore.profile = null
  }
  userStore.loading = false
}

supabase.auth.onAuthStateChange(() => {
  setTimeout(loadUser, 0)
})

