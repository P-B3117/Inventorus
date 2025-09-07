import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    watch: {
      usePolling: false,
      useFsEvents: false,
      ignored: ['**/node_modules/@mui/icons-material/**'],
    },
    fs: {
      strict: false,
    },
  },
  optimizeDeps: {
    include: [
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
    ],
    exclude: [
      '@mui/icons-material',
    ],
  },
  ssr: {
    noExternal: ['@mui/material', '@emotion/react', '@emotion/styled'],
  },
});
