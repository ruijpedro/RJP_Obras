# RJP Obras V4.1 — APK + WebApp

Versão com:

- Dashboard executivo
- Obras
- Diário IA
- Planeamento + Gantt simples
- Autos profissionais
- Curva S
- Rendimentos ECAACR / LNEC / RJP
- Modo Ferrovia IP
- Licenças
- Não conformidades
- Fotos GPS
- Google Sheets/Drive por Apps Script
- PDF executivo
- Backup/importação JSON
- Workflow para APK Android
- Workflow para WebApp com GitHub Pages

## APK

GitHub → Actions → Build Android APK → Run workflow

Artifact:

`RJP-Obras-V41-debug-apk`

## WebApp pública

GitHub → Settings → Pages → Source: GitHub Actions

Depois:

GitHub → Actions → Build and Deploy WebApp → Run workflow

O link aparece no passo `deploy`.

## Google Apps Script

Usa o ficheiro:

`google-apps-script/Code.gs`

Implementar como Web App e colar o URL `/exec` no separador Google da app.
