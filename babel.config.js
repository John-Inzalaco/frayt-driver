const JSON5 = require('json5');
const fs = require('fs');

const config = JSON5.parse(fs.readFileSync('./tsconfig.json', 'utf8'));

const {
  compilerOptions: { baseUrl, paths },
} = config;

let aliases = {};

for (alias in paths) {
  path = paths[alias][0].replace(/\/\*$/g, '');
  alias = alias.replace(/\/\*$/g, '');
  aliases[alias] = path;
}

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        envName: 'APP_ENV',
        moduleName: '@env',
        path: '.env',
        blocklist: null,
        allowlist: null,
        allowUndefined: true,
      },
    ],
    [
      'module-resolver',
      {
        root: [baseUrl],
        alias: aliases,
        extensions: ['.ts', '.tsx'],
      },
    ],
  ],
};
