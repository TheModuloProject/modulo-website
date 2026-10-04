import sharp from 'sharp';
import { readdir, writeFile } from 'node:fs/promises';

const folder = '/Users/razan/Desktop/Modulo';
const stamp = (await readdir(folder)).find(name => name.startsWith('Country_ Abu Dhabi Series_') && name.endsWith('.jpg'));
await sharp(`${folder}/${stamp}`).resize({ width: 350, withoutEnlargement: true }).webp({ quality: 85 }).toFile('assets/abu-dhabi-stamp.webp');
// Vector reproduction of the supplied geometric mark. Coordinates preserve
// the circles, capsules, and central disk without raster background padding.
export const shapes = '<circle cx="10" cy="10" r="9.7"/><rect x="24" y=".3" width="52" height="19.4" rx="9.7"/><circle cx="90" cy="10" r="9.7"/><rect x=".3" y="24" width="19.4" height="52" rx="9.7"/><circle cx="50" cy="50" r="22"/><rect x="80.3" y="24" width="19.4" height="52" rx="9.7"/><circle cx="10" cy="90" r="9.7"/><rect x="24" y="80.3" width="52" height="19.4" rx="9.7"/><circle cx="90" cy="90" r="9.7"/>';
for (const [name, fill] of [['logo-light','#151515'],['logo-dark','#e7e8ec']]) {
 await writeFile(`assets/${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="${fill}">${shapes}</svg>\n`);
}
await writeFile('assets/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="20" fill="#244cff"/><g transform="translate(18 18) scale(.84)" fill="#f3f2ee">${shapes}</g></svg>\n`);

for(const width of [160,280]) {
 await sharp(`${folder}/${stamp}`).resize({width}).webp({quality:78}).toFile(`assets/abu-dhabi-stamp-${width}.webp`);
 await sharp(`${folder}/${stamp}`).resize({width}).avif({quality:52,effort:5}).toFile(`assets/abu-dhabi-stamp-${width}.avif`);
}
