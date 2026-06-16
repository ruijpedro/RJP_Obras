# RJP Obras V3

Aplicação Android/WebApp para gestão de obras, controlo, acompanhamento, licenças, diário de obra, não conformidades, planeamento, rendimentos de mão-de-obra/materiais/equipamentos e relatórios PDF.

## Funcionalidades incluídas

- Dashboard executivo
- Gestão de obras
- Diário de obra com GPS e campos para fotografias/referências
- Biblioteca inicial de rendimentos de edificação e obras públicas
- Licenças e documentos
- Não conformidades
- Planeamento / Gantt simples
- Exportação PDF
- Backup JSON
- Estrutura Google pronta em `src/services/google.js`
- Preparado para WebApp e APK Android com Capacitor

## Como correr no GitHub Codespaces

```bash
npm install
npm run dev
```

## Como gerar WebApp

```bash
npm install
npm run build
```

A pasta publicada é `dist`.

## Como gerar APK no GitHub Actions

1. Fazer upload dos ficheiros soltos para o repositório.
2. Ir a **Actions**.
3. Escolher **Build Android APK**.
4. Clicar em **Run workflow**.
5. Descarregar o artefacto `RJP-Obras-debug-apk`.

## Configuração Google

Editar:

```text
src/services/google.js
```

Preencher:

```js
CLIENT_ID
API_KEY
APPS_SCRIPT_URL
```

Enquanto o `APPS_SCRIPT_URL` não for configurado, o botão **Sincronizar** mostra aviso.

## Aviso

Software de apoio técnico. Os dados, rendimentos, custos e relatórios devem ser sempre validados por técnico responsável antes de qualquer aplicação profissional.
