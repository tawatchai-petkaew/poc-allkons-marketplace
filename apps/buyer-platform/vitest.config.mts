import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    root: './',
    coverage: {
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.module.ts',
        'src/**/*.e2e-spec.ts',
        'src/assets/*',
        'src/config/*',
        'src/routes/*',
        'src/theme/*',
        'src/styles/*',
        'src/stories/*',
        'src/tests/*',
      ],
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
    include: ['__tests__/**/*.test.tsx', 'src/**/*.spec.ts'],
    exclude: ['src/tests/*.e2e-spec.ts'],
  },
});
