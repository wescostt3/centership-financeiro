# Relatório de ajustes realizados

## Organização

- As imagens que estavam soltas na raiz foram movidas para `public/images/site/`.
- Foi criada a pasta `public/uploads/` com subpastas para comprovantes, notas fiscais, recibos e contratos.
- Foi adicionada documentação em `docs/ARQUITETURA.md`.
- Foi adicionado `README.md` com instruções de deploy.
- Foi adicionado `vercel.json` para deploy estático no Vercel.

## Correções e melhorias técnicas

- Atualização do caminho da imagem de fundo usada no CSS.
- Validação dos links internos das páginas HTML.
- Validação de referências de arquivos estáticos no CSS.
- Ajuste no acionamento de `<dialog>` para usar `showModal()`/`close()` quando disponível.
- Validação sintática do JavaScript com `node --check`.

## Recibos

- A página `recibos.html` agora atualiza a prévia automaticamente ao preencher os campos.
- Foram adicionados campos necessários para emissão completa do recibo: CPF, diárias, valor por diária, adicional, desconto, forma de pagamento, chave/dados bancários, data do pagamento e dados da empresa.
- A impressão permanece funcionando pelo botão **Imprimir recibo**.
- Para gerar PDF hoje, use o navegador: Imprimir > Salvar como PDF.

## Observação sobre upload

A estrutura de pastas para upload foi preparada, mas o salvamento real de arquivos exige backend ou storage externo. Em HTML estático, o navegador não consegue gravar arquivos no servidor do Vercel sozinho.
