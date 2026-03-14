const { build } = require('vite');

build({
  build: {
    outDir: 'build'
  }
}).then(() => {
  console.log('Build complete!');
}).catch((err) => {
  console.error(err);
  process.exit(1);
});