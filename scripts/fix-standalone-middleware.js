const fs = require('fs');
const path = require('path');

async function ensureMiddleware() {
  try {
    const root = process.cwd();
    const serverDir = path.join(root, '.next', 'server');
    const srcDir = path.join(serverDir, 'src');
    const targetFile = path.join(srcDir, 'middleware.js');
    const altFile = path.join(serverDir, 'middleware.js');

    // If target already exists, nothing to do
    if (fs.existsSync(targetFile)) {
      console.log('✅ middleware.js already present at .next/server/src/middleware.js');
      return;
    }

    // If alternative exists, copy it into the expected location
    if (fs.existsSync(altFile)) {
      await fs.promises.mkdir(srcDir, { recursive: true });
      await fs.promises.copyFile(altFile, targetFile);
      console.log('✅ Copied .next/server/middleware.js → .next/server/src/middleware.js');
      return;
    }

    // Nothing found — create a minimal middleware shim to satisfy the standalone copy step
    await fs.promises.mkdir(srcDir, { recursive: true });
    const shim = `// Auto-generated shim for standalone build
module.exports = function middleware(req, ev) { return; };
`;
    await fs.promises.writeFile(targetFile, shim, 'utf8');
    console.log('⚠️  Created shim .next/server/src/middleware.js (no compiled middleware found)');
  } catch (err) {
    console.error('Failed to ensure middleware file for standalone output:', err);
    process.exit(1);
  }
}

ensureMiddleware();
