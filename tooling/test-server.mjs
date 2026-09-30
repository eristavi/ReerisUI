import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=process.cwd();
const port=Number(process.env.REVA_TEST_PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    const published=url.pathname.startsWith('/ReerisUI/');
    const servingRoot=published ? path.join(root,'.reeris-docs-site') : root;
    const pathname=published ? url.pathname.slice('/ReerisUI/'.length) : url.pathname;
    const rel=decodeURIComponent(pathname).replace(/^\/+/, '') || (published ? 'index.html' : 'docs/index.html');
    const file=path.resolve(servingRoot,rel);
    if(!file.startsWith(servingRoot+path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
    res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
    res.setHeader('Cache-Control','no-store');
    fs.createReadStream(file).pipe(res);
  } catch { res.writeHead(400); res.end('Bad request'); }
});
server.listen(port,'127.0.0.1',()=>console.log(`Reeris test server: http://127.0.0.1:${port}`));
