# RJP Obras V3 WebApp

WebApp React/Vite para gestão de obras.

## Módulos

- Dashboard executivo
- Obras
- Diário de Obra IA local
- Biblioteca de Rendimentos: LNEC/Paz Branco + ECAACR + RJP
- Custos e Autos
- Licenças
- Não Conformidades
- Fotografias GPS
- Planeamento preparado
- Google Sheets/Drive via Apps Script
- Relatórios PDF

## Como correr no Codespaces

```bash
npm install
npm run dev
```

## Como gerar a WebApp

```bash
npm install
npm run build
```

A pasta final para publicar é:

```bash
dist
```

## GitHub Pages / Netlify / Vercel

O projeto já tem:

```js
base: './'
```

no `vite.config.js`, por isso está preparado para publicação como WebApp.

## Google Apps Script

1. Abrir Google Apps Script.
2. Criar novo projeto.
3. Colar o conteúdo de `google-apps-script/Code.gs`.
4. Implementar como Aplicação Web.
5. Acesso: qualquer pessoa com o link.
6. Copiar o URL terminado em `/exec`.
7. Colar no separador Google da app.
8. Clicar em Sincronizar Google.
