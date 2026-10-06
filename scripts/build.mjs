import { mkdir, copyFile, cp, writeFile, rm, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { securityHeaders } from './security-policy.mjs';
import './generate-site.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const destination=resolve(root,'dist');
await rm(destination,{recursive:true,force:true});
await mkdir(resolve(destination,'assets'),{recursive:true});
const routes=JSON.parse(await readFile('scripts/site/routes.json','utf8'));
const files=routes.map(route=>route==='/'?'index.html':route.endsWith('.html')?route.slice(1):`${route.slice(1)}index.html`);
for(const file of [...files,'styles.css','pages.css','script.js','robots.txt','sitemap.xml']){
 await mkdir(dirname(resolve(destination,file)),{recursive:true});
 await copyFile(resolve(root,file),resolve(destination,file));
}
for(const file of ['favicon.svg','contact-pin.webp','invitation-grain.svg','logo-light.svg','logo-dark.svg','material.svg','social-preview.png','invoiceit-login-desktop.webp','invoiceit-login-mobile.webp','invoiceit-cover.webp','the-layla-studios-cover.webp','the-layla-studios-desktop.webp','the-layla-studios-mobile.webp','hadaya-al-dar-cover.webp','hadaya-al-dar-desktop.webp','hadaya-al-dar-mobile.webp','dataflow-medical-cover.webp','dataflow-medical-desktop.webp','dataflow-medical-mobile.webp']) await copyFile(resolve(root,'assets',file),resolve(destination,'assets',file));
await cp(resolve(root,'assets/fonts'),resolve(destination,'assets/fonts'),{recursive:true});
await cp(resolve(root,'components'),resolve(destination,'components'),{recursive:true});
const policies=await Promise.all(files.map(file=>securityHeaders(resolve(root,file))));
// Authorise only the generated pre-paint bootstrap and structured data scripts.
const hashes=[...new Set(policies.flatMap(policy=>policy['Content-Security-Policy'].match(/'sha256-[^']+'/g)))];
const headers={...policies[0],'Strict-Transport-Security':'max-age=31536000'};
headers['Content-Security-Policy']=headers['Content-Security-Policy'].replace(/script-src[^;]+;/,`script-src 'self' ${hashes.join(' ')};`);
await writeFile(resolve(destination,'_headers'),`/*\n${Object.entries(headers).map(([key,value])=>`  ${key}: ${value}`).join('\n')}\n`);
await writeFile(resolve(root,'vercel.json'),JSON.stringify({buildCommand:'npm run build',outputDirectory:'dist',cleanUrls:true,trailingSlash:true,headers:[{source:'/(.*)',headers:Object.entries(headers).map(([key,value])=>({key,value}))}]},null,2)+'\n');
console.log(`Built ${files.length} static pages with optimised assets and deployment security headers.`);
