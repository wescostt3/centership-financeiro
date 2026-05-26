# Arquitetura do projeto — CenterShip Financeiro

Este projeto é uma aplicação web estática em HTML, CSS e JavaScript puro, pronta para deploy no Vercel sem etapa de build.

## Estrutura

```txt
/
├── index.html                 # entrada principal
├── login.html                 # autenticação Supabase ou sessão demo local
├── dashboard.html             # visão geral financeira
├── cadastros.html             # base de clientes, fornecedores e colaboradores
├── colaboradores-mei.html     # cadastro e listagem dedicada de prestadores MEI
├── recibos.html               # gerador de recibos com seleção de colaborador
├── pagamentos-semanais.html   # fluxo de pagamentos MEI
├── css/
│   └── app.css                # estilos globais
├── js/
│   ├── app.js                 # interações, formulários, cadastros, recibos e busca
│   ├── config.example.js      # modelo de configuração pública
│   ├── config.js              # configuração local, ignorada pelo git
│   └── supabase-client.js     # camada de dados Supabase/localStorage
├── supabase/
│   └── schema.sql             # schema inicial e políticas RLS
├── public/
│   ├── images/                # marca e imagens de interface
│   └── uploads/               # estrutura futura para arquivos
├── docs/                      # documentação técnica
├── vercel.json                # configuração para deploy estático no Vercel
├── .gitignore                 # proteção de config local e arquivos temporários
└── README.md
```

## Camada de dados

`js/supabase-client.js` expõe `window.CenterShipDB` e centraliza as operações usadas pela interface:

- `signIn`, `signUp`, `signOut`, `getSession`.
- `listCadastros`, `createCadastro`.
- `listRecibos`, `createRecibo`.

Quando `SUPABASE_URL` e `SUPABASE_ANON_KEY` estão configurados em `js/config.js`, os dados são persistidos no Supabase. Quando estão vazios, o sistema usa `localStorage` para demonstração local.

## Fluxos principais

### Cadastros

`cadastros.html` e `colaboradores-mei.html` usam o mesmo handler em `js/app.js` por meio de atributos HTML:

- `data-open-cadastro`: abre o modal e define o tipo do cadastro.
- `data-cadastro-form`: envia o formulário para `CenterShipDB.createCadastro`.
- `data-cadastros-grid`: renderiza cards dinâmicos.
- `data-cadastros-tipo`: filtra a listagem por tipo, usado na página de colaboradores.
- `data-search-cadastros`: filtra os cards carregados.

### Recibos

`recibos.html` usa `data-receipt-form` para atualizar a prévia e salvar recibos. O seletor `data-provider-select` carrega colaboradores MEI cadastrados e preenche dados do prestador automaticamente, mantendo o preenchimento manual como fallback.

## Supabase

O schema inicial está em `supabase/schema.sql` e cria:

- `cadastros`: clientes, fornecedores e colaboradores MEI.
- `recibos`: recibos emitidos.
- `documentos`: metadados de arquivos futuros.

As políticas RLS liberam operações para usuários autenticados. Para produção com permissões por perfil, evoluir essas políticas antes de disponibilizar para múltiplos níveis de acesso.

## Deploy no Vercel

- Framework Preset: `Other`
- Build Command: vazio
- Install Command: vazio
- Output Directory: vazio ou `.`
- Root Directory: pasta onde está o `index.html`

## Observação sobre uploads

Por ser uma aplicação estática, campos de upload no navegador não salvam arquivos em servidor. Para armazenar comprovantes, notas e recibos, conecte Supabase Storage ou outro serviço de storage.
