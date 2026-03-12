# TikTok Automation Agent

Este agente automatiza o processo de postagem de vídeos de vendas no TikTok.

## Funcionalidades

1.  **Seleção de Produto**: Escolhe aleatoriamente um produto de `products.json`.
2.  **Geração de Vídeo**: (Simulado) Usa um arquivo de vídeo local `sample.mp4`.
3.  **Login Automático**: Tenta logar com credenciais do `.env` ou reutiliza cookies salvos.
4.  **Upload**: Envia o vídeo para o TikTok com legenda e hashtags.

## Configuração

1.  Instale as dependências:
    ```bash
    npm install
    ```

2.  Crie um arquivo `.env` baseado no `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Preencha com suas credenciais do TikTok.

3.  **Importante**: Coloque um vídeo de teste chamado `sample.mp4` nesta pasta.
    - O agente precisa de um arquivo de vídeo real para fazer o upload.

4.  Edite `products.json` com seus produtos e links de afiliado.

## Execução

```bash
node agent.js
```

## Notas

-   **CAPTCHA**: O login automático do TikTok frequentemente exibe CAPTCHAs. O script abrirá o navegador para que você possa resolver manualmente se necessário.
-   **Cookies**: Após o primeiro login bem-sucedido, os cookies serão salvos em `tiktok_cookies.json` para evitar logins futuros.
