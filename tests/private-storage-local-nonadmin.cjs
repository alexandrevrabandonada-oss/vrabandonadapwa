const fs=require('fs'); const assert=require('assert/strict'); const {createClient}=require('@supabase/supabase-js');
const c=JSON.parse(fs.readFileSync(process.env.VR_LOCAL_SUPABASE_STATUS || '','utf8')); if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(c.API_URL)) throw Error('not local');
const opts={auth:{persistSession:false,autoRefreshToken:false}}; const service=createClient(c.API_URL,c.SERVICE_ROLE_KEY,opts); const user=createClient(c.API_URL,c.ANON_KEY,opts);
(async()=>{let x=await service.auth.admin.createUser({email:'vr-reader@example.com',password:'Synthetic-local-password-237!',email_confirm:true}); if(x.error && !x.error.message.includes('already')) throw Error('user setup'); x=await user.auth.signInWithPassword({email:'vr-reader@example.com',password:'Synthetic-local-password-237!'});if(x.error)throw Error('user login');
let captures=await user.from('universal_captures').select('id');assert.equal(captures.error,null);assert.equal(captures.data.length,0);
let sign=await user.storage.from('editorial-private').createSignedUrl('synthetic.pdf',60);assert.ok(sign.error);
let upload=await user.storage.from('editorial-private').upload('unauthorized.pdf',Buffer.from('test'),{contentType:'application/pdf'});assert.ok(upload.error);
let metadata=await user.from('private_editorial_documents').select('id');assert.ok(metadata.error);
let list=await user.from('admin_email_allowlist').insert({email:'attacker@example.com'});assert.ok(list.error);

console.log('Non-admin denied capture, signing, upload, metadata and allowlist.');})().catch(e=>{console.error(e.message);process.exitCode=1});


