import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const script=fileURLToPath(new URL('./prepare-import.mjs',import.meta.url));
const row={brand:'Test',model:'Example',version:'Trim',source_url:'https://example.com/catalog',verified_at:'2025-01-01',price_mad:150000,price_type:'unknown'};
function run(rows){const dir=mkdtempSync(join(tmpdir(),'catalog-'));try{const path=join(dir,'batch.json');writeFileSync(path,JSON.stringify(rows));return spawnSync(process.execPath,[script,path],{encoding:'utf8'});}finally{rmSync(dir,{recursive:true,force:true});}}
test('valid batch emits transactional SQL',()=>{const r=run([row]);assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/BEGIN;/);assert.match(r.stdout,/COMMIT;/);assert.match(r.stdout,/150000/);});
test('duplicate rows rejected',()=>assert.notEqual(run([row,row]).status,0));
test('negative prices rejected',()=>assert.notEqual(run([{...row,price_mad:-1}]).status,0));
test('unsafe URL rejected',()=>assert.notEqual(run([{...row,source_url:'javascript:alert(1)'}]).status,0));
test('missing source rejected',()=>assert.notEqual(run([{...row,source_url:''}]).status,0));
test('apostrophes escaped',()=>{const r=run([{...row,version:"L'Edition"}]);assert.equal(r.status,0);assert.match(r.stdout,/L''Edition/);});
