# Central de Links — Site estático para GitHub Pages

Uma página de links no estilo Linktree, feita **somente com HTML, CSS e JavaScript**. Funciona no GitHub Pages e não precisa de banco de dados, Node.js, hospedagem paga, login ou serviços externos.

## Como colocar no GitHub Pages

1. Crie um repositório no GitHub. Por exemplo: `meus-links` (de preferência **público**, conforme disponibilidade do Pages na sua conta/plano).
2. Envie **o conteúdo desta pasta** para a raiz do repositório. O arquivo `index.html` precisa ficar na raiz, e não dentro de outra pasta `central-de-links`.
3. No repositório, abra **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**; selecione `main`, pasta `/(root)` e salve.
5. Espere a publicação. O link geralmente terá o formato `https://SEUUSUARIO.github.io/meus-links/`.
6. Abra o endereço para confirmar. **Somente depois gere e imprima o QR Code** apontando para esse endereço exato.

### O QR Code vai continuar funcionando?

**Sim.** O código contém o endereço da página, e **não os links internos**. Você pode trocar o conteúdo dos botões e publicar de novo sem alterar o QR Code. Preserve o endereço publicado: não renomeie o repositório ou o usuário do GitHub, nem mude o domínio/caminho do site, sem preparar um redirecionamento. Evite colar um link de arquivo como `index.html` ou um link de commit; use a URL pública da página.

## Como editar sem programar

1. Abra `editor.html` pelo navegador (localmente ou em `https://SEUUSUARIO.github.io/meus-links/editor.html`).
2. Altere o nome, descrição, símbolo, cor ou foto da página.
3. Clique **Adicionar novo link** e preencha título, URL, emoji, descrição e categoria. Pode adicionar quantos precisar. Você também pode desativar, destacar, excluir e mudar a ordem dos links.
4. Confira a prévia e clique **Baixar site.js**.
5. No GitHub, abra a pasta `data` do repositório e substitua o arquivo `site.js` pelo que acabou de baixar (faça o upload pelo navegador e confirme a alteração com **Commit changes**).
6. Pronto! O site público e o QR Code têm **o mesmo endereço** de antes.

> IMPORTANTE: `editor.html` é apenas um editor local que gera um novo arquivo. **Ele não tem autenticação e não modifica o GitHub automaticamente**. Qualquer pessoa pode visitar o endereço do editor, mas sem acesso ao seu repositório ninguém pode publicar alterações nele. O editor guarda um rascunho **no navegador onde você fez a edição**. Se abrir em outro aparelho, o rascunho não acompanha automaticamente; nesse caso, a versão carregada é a que está no arquivo `data/site.js` publicado.

## Como editar diretamente pelo GitHub (sem usar o editor)

Abra `data/site.js`, clique no lápis **Edit this file**, e altere os dados dentro de `window.LINKTREE_DATA`. Cada item do array `links` é um botão. Defina `enabled: false` para ocultá-lo temporariamente e `featured: true` para destacá-lo. Faça **Commit changes**.

## Estrutura de arquivos

```
index.html           -> página pública (endereço usado no QR Code)
styles.css           -> visual da página pública
app.js               -> exibe os links, categorias, busca e compartilhamento
editor.html          -> editor visual
editor.css           -> visual do editor
editor.js            -> ações do editor e exportação
assets/favicon.svg   -> ícone do navegador
data/site.js         -> SEUS LINKS E CONFIGURAÇÕES (arquivo a atualizar)
.nojekyll            -> impede processamento desnecessário pelo Jekyll
```

## Dicas importantes

- As URLs devem começar com `https://`, `http://`, `mailto:` ou `tel:`. Para WhatsApp, use `https://wa.me/55DDDNUMERO` (sem símbolos ou espaços). Nunca coloque senhas ou tokens privados no arquivo: o site é público.
- O campo `avatar` aceita uma URL pública `https://` ou `http://` para uma imagem. Deixe vazio para usar o símbolo/emoji. Um arquivo de imagem local também pode ser usado, mas precisaria de uma adaptação no código.
- **Exemplos iniciais:** os três links incluídos servem só de demonstração. Substitua pelos seus antes de distribuir o QR Code.
- As mudanças no GitHub Pages podem demorar alguns minutos para aparecer. Atualize a página no navegador se necessário.
- Para testar fora do GitHub Pages, você pode abrir `index.html` e `editor.html` diretamente no navegador: este projeto usa um arquivo `site.js` para que os dados também carreguem em modo local.
- O próprio editor também estará acessível em `/editor.html`, mesmo sem um botão na página principal. Ele não permite publicar sem ter permissão no repositório.

## Customizações

As cores e links podem ser alterados no editor. Para mudar layout, fonte, espaçamentos e animações da página pública, edite `styles.css`.
