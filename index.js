const appRootPath = require('app-root-path');
const path = require('path');
const env = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;
const rootPath = appRootPath.path;
const config = require(path.resolve(rootPath, `config/${env}.json`));
config.rootPath = rootPath;

const app = new (require('./dist/app.js').default)({ env, config });

app.listen(PORT);