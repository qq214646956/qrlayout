// 安装中文翻译：用本地构建的中文版覆盖 npm 英文原版
import { copyFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const srcDir = resolve(__dirname, '..', '..', 'packages', 'ui', 'dist');
const destDir = resolve(__dirname, 'node_modules', 'qrlayout-ui', 'dist');

const files = ['qrlayout-ui.js', 'qrlayout-ui.umd.js'];

let ok = true;
for (const file of files) {
  const src = resolve(srcDir, file);
  const dest = resolve(destDir, file);
  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log('[OK] ' + file + ' -> 中文版已安装');
  } else {
    console.error('[FAIL] ' + src + ' 不存在');
    ok = false;
  }
}
if (ok) console.log('\n中文翻译安装完成!\n');
else process.exit(1);
