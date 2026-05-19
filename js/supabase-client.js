(function () {
  const config = window.CENTERSHIP_CONFIG || {};
  const hasSupabase = Boolean(config.SUPABASE_URL && config.SUPABASE_ANON_KEY && window.supabase);
  const client = hasSupabase ? window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY) : null;

  function localRead(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  }

  function localWrite(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  window.CenterShipDB = {
    client,
    enabled: hasSupabase,

    async signIn(email, password) {
      if (!client) {
        localStorage.setItem('centership_demo_session', JSON.stringify({ email, created_at: new Date().toISOString() }));
        return { demo: true };
      }
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },

    async signUp(email, password, metadata = {}) {
      if (!client) {
        const users = localRead('centership_users');
        users.push({ id: uid(), email, metadata, created_at: new Date().toISOString() });
        localWrite('centership_users', users);
        return { demo: true };
      }
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: metadata }
      });
      if (error) throw error;
      return data;
    },

    async signOut() {
      localStorage.removeItem('centership_demo_session');
      if (client) await client.auth.signOut();
    },

    async getSession() {
      if (!client) return JSON.parse(localStorage.getItem('centership_demo_session') || 'null');
      const { data } = await client.auth.getSession();
      return data.session;
    },

    async listCadastros() {
      if (!client) return localRead('centership_cadastros');
      const { data, error } = await client.from('cadastros').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async createCadastro(payload) {
      const record = { ...payload, id: payload.id || uid(), created_at: new Date().toISOString() };
      if (!client) {
        const rows = localRead('centership_cadastros');
        rows.unshift(record);
        localWrite('centership_cadastros', rows);
        return record;
      }
      const { data, error } = await client.from('cadastros').insert(payload).select().single();
      if (error) throw error;
      return data;
    },

    async listRecibos() {
      if (!client) return localRead('centership_recibos');
      const { data, error } = await client.from('recibos').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async createRecibo(payload) {
      const record = { ...payload, id: payload.id || uid(), created_at: new Date().toISOString() };
      if (!client) {
        const rows = localRead('centership_recibos');
        rows.unshift(record);
        localWrite('centership_recibos', rows);
        return record;
      }
      const { data, error } = await client.from('recibos').insert(payload).select().single();
      if (error) throw error;
      return data;
    }
  };
})();
