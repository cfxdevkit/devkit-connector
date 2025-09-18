import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  external: [
    'lit',
    'lit/decorators.js',
    '@lit/reactive-element',
    '@lit/reactive-element/decorators.js',
  ],
  esbuildOptions(options) {
    options.target = 'es2022';
    // Force external dependencies to remain external
    options.external = [
      'lit',
      'lit/decorators.js',
      '@lit/reactive-element',
      '@lit/reactive-element/decorators.js',
    ];
    // Don't bundle external dependencies
    options.bundle = true;
    options.packages = 'external';
    // Preserve module structure
    options.mainFields = ['module', 'main'];
    options.conditions = ['import', 'module'];
    // Force preservation of submodule imports
    options.resolveExtensions = ['.js', '.ts', '.tsx'];
  },
});
