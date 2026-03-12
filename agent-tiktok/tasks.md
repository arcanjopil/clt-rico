# Tarefas do Agente TikTok

## Concluído
- [x] Estrutura básica do projeto (`package.json`, `.env`).
- [x] Script de Automação de Navegador (`agent.js`).
- [x] Geração de Vídeo Programática (`video_generator.js`).
  - [x] Uso de `fluent-ffmpeg` e `ffmpeg-static`.
  - [x] Overlay de texto (Nome do Produto e Preço).
  - [x] Loop de imagem de fundo.
- [x] Agendamento Diário (`scheduler.js`).
  - [x] Uso de `node-cron` para rodar às 09:00.

## Pendente
- [ ] **Integração com IA Generativa**:
  - Usar OpenAI/Gemini para criar descrições de produtos mais atraentes.
- [ ] **Melhoria Visual**:
  - Adicionar música de fundo.
  - Usar múltiplas imagens com transições.
- [ ] **Deploy**:
  - Configurar em um servidor VPS ou manter rodando localmente.

## Como Rodar
1.  **Instalar dependências**: `npm install`
2.  **Gerar vídeo de teste**: `node video_generator.js`
3.  **Rodar agente (manual)**: `node agent.js`
4.  **Iniciar agendador**: `node scheduler.js`
