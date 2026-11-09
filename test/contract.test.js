import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => readFileSync(resolve(root, relative), 'utf8');
const json = (relative) => JSON.parse(read(relative));

const manifest = json('package.json');
const client = read('client.js');
const patch = read('cordis.patch.yml');

test('bundle manifest declares a patch and a web client', () => {
  assert.equal(manifest.type, 'module');
  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml');
  assert.equal(manifest.dsh.client.platform, 'web');
  assert.equal(manifest.exports['.'], './index.js');
  assert.equal(manifest.exports['./client'], './client.js');
});

test('every exported runtime file exists and is listed in files', () => {
  const runtime = [
    manifest.exports['.'],
    manifest.exports['./client'],
    'cordis.patch.yml',
    'locale/en.json',
    'locale/zh.json',
    'icon.svg',
  ];
  for (const file of runtime) {
    const relative = file.replace(/^\.\//, '');
    assert.ok(existsSync(resolve(root, relative)), `missing runtime file: ${relative}`);
  }
  const files = manifest.files;
  for (const entry of ['index.js', 'client.js', 'cordis.patch.yml', 'locale/*.json', 'icon.svg']) {
    assert.ok(files.includes(entry), `files is missing ${entry}`);
  }
});

test('locale metadata is localized and non-placeholder', () => {
  for (const locale of ['en', 'zh']) {
    const meta = json(`locale/${locale}.json`).meta;
    assert.ok(meta.title && meta.title.length > 3, `${locale}.title`);
    assert.ok(meta.description && meta.description.length > 10, `${locale}.description`);
  }
});

test('patch row and client factory use the package name', () => {
  assert.ok(patch.includes('id: dsh-rewind-anchor'));
  assert.ok(patch.includes(`name: '${manifest.name}'`));
  assert.ok(client.includes(`id: '${manifest.name}'`));
  assert.ok(client.includes('window.__ModuleLoader__.load('));
});

test('icon exists, is svg, and stays within the size limit', () => {
  const icon = read('icon.svg');
  assert.ok(icon.startsWith('<svg'), 'icon must be svg markup');
  assert.ok(statSync(resolve(root, 'icon.svg')).size <= 256 * 1024, 'icon exceeds 256 KiB');
});

test('client module respects UI plugin boundaries', () => {
  assert.ok(client.includes("inject: ['slots']"), 'client must declare its slot dependency');
  assert.ok(client.includes('ctx.slots.inject('), 'client must contribute through slots');
  for (const forbidden of [
    'document.body.appendChild',
    'document.body.append(',
    "require('@deepseek-ai/dsh-client-ui-primitives')",
    'MutationObserver',
  ]) {
    assert.ok(!client.includes(forbidden), `forbidden UI pattern: ${forbidden}`);
  }
});
