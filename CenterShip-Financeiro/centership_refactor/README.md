# CenterShip Financeiro

Sistema financeiro interno da CenterShip Elevadores, organizado como aplicação estática em HTML, CSS e JavaScript puro, pronta para GitHub, Vercel e Supabase.

## Funcionalidades

- Dashboard financeiro interno.
- Cadastro de clientes, fornecedores e colaboradores MEI.
- Página dedicada para colaboradores MEI com cadastro funcional.
- Gerador de recibos com prévia para impressão/PDF.
- Seleção de colaborador no recibo com preenchimento automático de nome, documento, PIX e diária padrão.
- Persistência em Supabase quando configurado.
- Fallback local em `localStorage` para demonstração quando Supabase não estiver configurado.

## Como rodar localmente

1. Abra a pasta onde está o `index.html`.
2. Copie `js/config.example.js` para `js/config.js`.
3. Para modo demonstração, deixe `SUPABASE_URL` e `SUPABASE_ANON_KEY` vazios.
4. Abra `index.html`, `login.html` ou `dashboard.html` no navegador.

## Como configurar o Supabase

1. Crie um projeto no Supabase.
2. Execute o arquivo `supabase/schema.sql` no SQL Editor do Supabase.
3. Copie `js/config.example.js` para `js/config.js`.
4. Preencha apenas a URL do projeto e a anon/public key:

```js
window.CENTERSHIP_CONFIG = {
  SUPABASE_URL: 'https://SEU-PROJETO.supabase.co',
  SUPABASE_ANON_KEY: 'SUA_CHAVE_ANON_PUBLICA',
  REDIRECT_AFTER_LOGIN: 'dashboard.html',
  REDIRECT_IF_LOGGED_OUT: 'login.html'
};
```

Nunca coloque `SERVICE_ROLE_KEY` no frontend.

## Como publicar no GitHub

1. Confira se `js/config.js` não contém chaves reais que devam ir para o repositório.
2. Inicialize o repositório dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "Estrutura sistema financeiro CenterShip"
```

3. Crie um repositório no GitHub e siga os comandos informados por ele para adicionar o remote e enviar o branch.

## Deploy no Vercel

1. No Vercel, selecione o repositório do GitHub.
2. Use `Framework Preset: Other`.
3. Deixe `Build Command` e `Install Command` vazios.
4. Garanta que o `Root Directory` aponte para a pasta onde está o `index.html`.
5. Faça o deploy.

## Pastas principais

- `css/`: estilos globais.
- `js/app.js`: interações da aplicação, cadastros, recibos e preenchimento automático.
- `js/supabase-client.js`: camada de dados Supabase/localStorage.
- `supabase/schema.sql`: schema inicial do banco.
- `public/images/site/`: imagens utilizadas no site/sistema.
- `public/uploads/`: estrutura preparada para futuros uploads.
- `docs/`: documentação técnica.

## Observação sobre arquivos

A aplicação é estática. Uploads reais e geração de PDF em servidor exigem backend/storage, como Supabase Storage, S3 ou serviço equivalente.
