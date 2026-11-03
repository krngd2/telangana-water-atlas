import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url)),files=[];
const ignored=new Set(['.git','.cache','node_modules','dist','test-results','playwright-report','.venv']);
async function visit(dir){
  for(const entry of await fs.readdir(dir,{withFileTypes:true})){
    if(ignored.has(entry.name))continue;
    const file=path.join(dir,entry.name);
    if(entry.isDirectory()){if(file===path.join(root,'public'))continue;await visit(file);}
    else if(entry.name.endsWith('.md'))files.push(file);
  }
}
await visit(root);
const failures=[];let count=0;
for(const file of files){
  const text=await fs.readFile(file,'utf8');
  const links=[...text.matchAll(/\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g),...text.matchAll(/(?:src|href)="([^"]+)"/g)];
  for(const [,href] of links){
    if(/^(?:[a-z]+:|\/\/|#)/i.test(href))continue;
    const [relative]=href.split('#'),target=path.resolve(path.dirname(file),decodeURIComponent(relative));
    if(!target.startsWith(root)){failures.push(`${path.relative(root,file)}: outside repository: ${href}`);continue;}
    try{await fs.access(target);count++;}catch{failures.push(`${path.relative(root,file)}: missing ${href}`);}
  }
}
if(failures.length)throw Error(failures.join('\n'));
console.log(`Documentation verified: ${files.length} Markdown files, ${count} local links/images. External source availability and heading anchors are not checked.`);
