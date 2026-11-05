const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const file=path.join(__dirname,'..','.env.local');
if(!fs.existsSync(file))fs.writeFileSync(file,'# Paste only your Stripe sandbox secret key after the equals sign. Never use a live key.\nSTRIPE_SECRET_KEY=\n\n# Generated locally. Keep private; do not change after a checkout.\nSTRIPE_COOKIE_SECRET='+crypto.randomBytes(32).toString('hex')+'\nSITE_URL=http://127.0.0.1:3191\nPORT=3191\nHOST=127.0.0.1\n',{flag:'wx',mode:0o600});
console.log('Local Stripe settings file is ready. Its contents and credentials are not printed.');
