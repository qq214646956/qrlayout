// 安装中文翻译 + 同步最新 core/ui 构建产物
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
let ok = true;

// 1. 复制 qrlayout-ui dist（中文翻译版）
const uiSrc = resolve(__dirname, '..', '..', 'packages', 'ui', 'dist');
const uiDest = resolve(__dirname, 'node_modules', 'qrlayout-ui', 'dist');
for (const file of ['qrlayout-ui.js', 'qrlayout-ui.umd.js']) {
    const src = join(uiSrc, file);
    const dest = join(uiDest, file);
    if (existsSync(src)) {
        copyFileSync(src, dest);
        console.log('[OK] qrlayout-ui/' + file + ' -> 最新版');
    } else {
        console.error('[FAIL] ' + src + ' 不存在');
        ok = false;
    }
}

// 2. 同步 qrlayout-core dist（确保最新构建产物）
function copyDir(src, dest) {
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
    for (const entry of readdirSync(src)) {
        const srcPath = join(src, entry);
        const destPath = join(dest, entry);
        if (statSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            copyFileSync(srcPath, destPath);
        }
    }
}
const coreSrc = resolve(__dirname, '..', '..', 'packages', 'core', 'dist');
const coreDest = resolve(__dirname, 'node_modules', 'qrlayout-core', 'dist');
if (existsSync(coreSrc)) {
    copyDir(coreSrc, coreDest);
    console.log('[OK] qrlayout-core/dist -> 最新版');
} else {
    console.error('[FAIL] qrlayout-core/dist 不存在，请先执行: cd packages/core && npm run build');
    ok = false;
}

if (ok) console.log('\n依赖同步完成!\n');
else process.exit(1);
