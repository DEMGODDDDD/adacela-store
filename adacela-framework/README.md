# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Run locally

Open two terminals in the `adacela-framework` folder.

In the first terminal, start the Laravel API from the parent project:

```powershell
php ..\artisan serve --host=127.0.0.1 --port=8000
```

In the second terminal, start the React app:

```powershell
npm run dev
```

Keep both terminals running.

## API configuration

Create a `.env` file in the `adacela-framework` folder and set the API base URL:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

This is the local development URL; use the URL of your deployed API when hosting the frontend. Do not put passwords, API tokens, or other secrets in frontend environment variables. Restart the Vite server after changing `.env`.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
