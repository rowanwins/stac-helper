import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json'
import {terser} from 'rollup-plugin-terser'

const output = (file, plugins) => ({
    input: './src/entry.ts',
    output: {
        name: 'stacHelper',
        file,
        format: 'esm'
    },
    plugins
});

export default [
    output('./dist/stacHelper.js', [
        json(),
        commonjs()
    ]),
    output('./dist/stacHelper.min.js', [
        json(),
        commonjs(),
        terser()
    ])
]
