# Setup rápido do Supabase - CenterShip Financeiro

## 1. Criar projeto
Crie um projeto no Supabase e copie:
- Project URL
- anon public key

Depois edite `js/config.js`:

```js
window.CENTERSHIP_CONFIG = {
  SUPABASE_URL: 'https://SEU-PROJETO.supabase.co',
  SUPABASE_ANON_KEY: 'SUA_CHAVE_ANON_PUBLICA',
  REDIRECT_AFTER_LOGIN: 'dashboard.html',
  REDIRECT_IF_LOGGED_OUT: 'login.html'
};
```

## 2. Criar tabelas
Abra Supabase > SQL Editor e execute o arquivo:

`supabase/schema.sql`

## 3. Login sem confirmação por e-mail
Para acesso rápido interno:

Supabase > Authentication > Providers > Email
- Confirm email: OFF
- Salvar

Com isso, o usuário cadastrado poderá acessar sem precisar clicar no e-mail de confirmação.

## 4. E-mail bonito de confirmação
Se quiser confirmação por e-mail:

Supabase > Authentication > Email Templates > Confirm signup
Cole o conteúdo de:

`supabase/email-confirmacao.html`

Para produção, configure SMTP próprio em Authentication > SMTP Settings.

## 5. Deploy no Vercel
No Vercel:

- Root Directory: `CenterShip-Financeiro/centership_refactor` ou a pasta onde estiver o `index.html`
- Framework Preset: Other
- Build Command: vazio
- Install Command: vazio
- Output Directory: `.`

## 6. Observação importante
Este pacote já tem fallback localStorage. Ou seja: os botões funcionam para teste mesmo sem Supabase. Para dados ficarem salvos de verdade para todos os usuários e computadores, configure o Supabase.
