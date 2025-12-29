import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    babel: {
      plugins: [
        function ({ types: t }: any) {
          return {
            visitor: {
              VariableDeclarator(path: any) {
                if (path.node.id.type === 'Identifier' &&
                  path.node.init &&
                  path.node.init.type === 'CallExpression' &&
                  path.node.init.callee.type === 'Identifier' &&
                  path.node.init.callee.name === 'createSelector') {

                  const varName = path.node.id.name;
                  const args = path.node.init.arguments;

                  // console.log('Found selector:', varName);

                  // Check if last arg is object
                  const lastArg = args[args.length - 1];
                  if (lastArg && lastArg.type === 'ObjectExpression') {
                    lastArg.properties.push(
                      t.objectProperty(t.identifier('name'), t.stringLiteral(varName))
                    );
                  } else {
                    args.push(t.objectExpression([
                      t.objectProperty(t.identifier('name'), t.stringLiteral(varName))
                    ]));
                  }
                }
              }
            }
          };
        }
      ]
    }
  })],
  base: '/redux-perf-toolkit/', // Assumes repo name is redux-perf-toolkit
  resolve: {
    alias: {
      // Surgical replacement of reselect with our instrumented proxy
      'reselect': path.resolve(__dirname, '../../packages/core/src/reselect-proxy.ts'),
      // FORCE @redux-perf/core to resolve to source to share the SAME EventBus singleton
      '@dienp/redux-perf-core': path.resolve(__dirname, '../../packages/core/src/index.ts')
    }
  },
})
