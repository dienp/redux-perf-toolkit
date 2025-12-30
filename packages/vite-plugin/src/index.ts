import { transformSync } from '@babel/core';
import * as t from '@babel/types';
// @ts-ignore
import presetTypescript from '@babel/preset-typescript';

export interface ReduxPerfPluginOptions {
    /**
     * Set to true to automatically rewrite 'reselect' imports to '@dynlabs/redux-perf-core'.
     * @default true
     */
    rewriteReselect?: boolean;
    /**
     * The path to resolve '@dynlabs/redux-perf-core' to.
     * @default '@dynlabs/redux-perf-core'
     */
    corePath?: string;
}

export function reduxPerfPlugin(options: ReduxPerfPluginOptions = {}): any {
    const { rewriteReselect = true, corePath = '@dynlabs/redux-perf-core' } = options;

    return {
        name: 'vite-plugin-redux-perf',
        enforce: 'pre',

        // Rewrite imports from 'reselect' to corePath
        resolveId(source: string, importer: string | undefined) {
            if (rewriteReselect && source === 'reselect') {
                // Only rewrite if the importer is NOT in node_modules
                // and NOT already inside the core package
                if (importer && (
                    importer.includes('node_modules') ||
                    importer.includes('packages/core') ||
                    importer.includes('packages\\core') ||
                    importer.includes('redux-perf-core')
                )) {
                    return null;
                }
                return corePath;
            }
            return null;
        },

        // Instrument createSelector calls using Babel
        transform(code: string, id: string) {
            if (id.includes('node_modules')) {
                return null;
            }

            if (!id.endsWith('.ts') && !id.endsWith('.tsx') && !id.endsWith('.js') && !id.endsWith('.jsx')) {
                return null;
            }

            if (!code.includes('createSelector')) {
                return null;
            }

            const result = transformSync(code, {
                presets: [[presetTypescript, { isTSX: true, allExtensions: true }]],
                plugins: [
                    function () {
                        return {
                            visitor: {
                                VariableDeclarator(path: any) {
                                    if (
                                        t.isIdentifier(path.node.id) &&
                                        t.isCallExpression(path.node.init) &&
                                        t.isIdentifier(path.node.init.callee) &&
                                        path.node.init.callee.name === 'createSelector'
                                    ) {
                                        const varName = path.node.id.name;
                                        const args = path.node.init.arguments;

                                        // Check if last arg is an object (options)
                                        const lastArg = args[args.length - 1];
                                        if (t.isObjectExpression(lastArg)) {
                                            // Check if name already exists
                                            const hasName = lastArg.properties.some(p =>
                                                t.isObjectProperty(p) &&
                                                t.isIdentifier(p.key) &&
                                                p.key.name === 'name'
                                            );
                                            if (!hasName) {
                                                lastArg.properties.push(
                                                    t.objectProperty(t.identifier('name'), t.stringLiteral(varName))
                                                );
                                            }
                                        } else if (args.length > 0) {
                                            // Append a new options object
                                            args.push(
                                                t.objectExpression([
                                                    t.objectProperty(t.identifier('name'), t.stringLiteral(varName))
                                                ])
                                            );
                                        }
                                    }
                                }
                            }
                        };
                    }
                ],
                filename: id,
                sourceMaps: true,
                babelrc: false,
                configFile: false
            });

            if (result && result.code) {
                return {
                    code: result.code,
                    map: result.map
                };
            }

            return null;
        }
    };
}
