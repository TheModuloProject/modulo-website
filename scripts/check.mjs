import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
async function walk(folder){const result=[];for(const file of await readdir(folder,{withFileTypes:true})){const path=`${folder}/${file.name}`;if(file.isDirectory())result.push(...await walk(path));else if(/\.(m?js)$/.test(path))result.push(path);}return result;}
for(const file of ['script.js',...await walk('components'),...await walk('scripts')]){const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(result.status)process.exit(result.status);}
console.log('All production and build JavaScript passes syntax checks.');
