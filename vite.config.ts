import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

// https://vite.dev/config/
export default defineConfig( ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  console.log(env.VITE_DEBUG)

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // Multi-tenancy por subdomínio localmente (ex.: VITE_ROOT_DOMAIN=
      // localtest.me + acessar evolutiongames.localtest.me:5173) manda um
      // Host que o Vite, por padrão, bloquearia como desconhecido — ver
      // docs/tcc/MULTI_TENANCY.md. localtest.me (não localhost) porque
      // browsers Chromium não compartilham cookie de sessão entre
      // subdomínios de ".localhost" (sem registrable domain de verdade por
      // trás) — ".localhost" continua liberado aqui só por compatibilidade
      // com quem ainda testa sem subdomínio cruzado.
      allowedHosts: ['.localhost', '.localtest.me'],
      ...(env.VITE_DEBUG === 'true' && {
        proxy: {
          // changeOrigin: false (fica no default) de propósito — o backend
          // usa o header Host original pra resolver multi-tenancy por
          // subdomínio (TenantHostMiddleware, ver docs/tcc/MULTI_TENANCY.md).
          // Com changeOrigin: true o proxy reescreve o Host pro alvo
          // ("localhost:8000"), e o middleware nunca enxergaria
          // "evolutiongames.localhost" — toda requisição via subdomínio
          // local cairia silenciosamente em modo global.
          '/api': {
            target: 'http://localhost:8000',
            secure: false,
          },
          '/uploads': {
            target: 'http://localhost:8000',
            secure: false,
          },
        },
      }),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
})
