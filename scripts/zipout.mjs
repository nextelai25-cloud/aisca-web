import { ZipArchive } from 'archiver';
import fs from 'fs';
import path from 'path';

const output = fs.createWriteStream('C:/Users/Logistics/Downloads/AISCA WEB FINAL VERSION/aisca-hostinger-v2.zip');
const archive = new ZipArchive({ zlib: { level: 9 } });

output.on('close', () => console.log('Done! ' + archive.pointer() + ' total bytes'));
archive.on('error', err => { throw err; });

archive.pipe(output);
archive.directory('./out/', false);
archive.finalize();
