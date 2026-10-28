const fs = require('node:fs');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { createClient } = require('@supabase/supabase-js');
const config = JSON.parse(fs.readFileSync(process.env.VR_LOCAL_SUPABASE_STATUS || '', 'utf8'));
const api = config.API_URL;
const anonKey = config.ANON_KEY;
const serviceKey = config.SERVICE_ROLE_KEY;
if (!api || !anonKey || !serviceKey || !/^http:\/\/(127\.0\.0\.1|localhost):/.test(api)) throw new Error('Local configuration unavailable');
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const service = createClient(api, serviceKey, opts);
const anon = createClient(api, anonKey, opts);

async function run() {
  const created = await service.auth.admin.createUser({email:'vr-admin@example.com', password:'Synthetic-local-password-237!',email_confirm:true});
  if (created.error) throw new Error('Could not create synthetic admin');
  const admin = createClient(api, anonKey, opts);
  const login = await admin.auth.signInWithPassword({email:'vr-admin@example.com',password:'Synthetic-local-password-237!'});
  if (login.error) throw new Error('Synthetic admin login failed');
  const bucket = 'editorial-private';
  const file = Buffer.from('%PDF-1.7 synthetic local fixture');
  const upload = await service.storage.from(bucket).upload('synthetic.pdf', file, {contentType:'application/pdf'});
  if (upload.error) throw new Error('Service upload failed');
  const meta = await service.from('private_editorial_documents').insert({ id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', capture_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', object_path:'synthetic.pdf', mime_type:'application/pdf', byte_size:file.length, sha256:createHash('sha256').update(file).digest('hex'), origin:'captura', purpose:'revisão', created_by:created.data.user.id });
  if (meta.error) throw new Error('Metadata insert failed');
  const anonSigned = await anon.storage.from(bucket).createSignedUrl('synthetic.pdf',60);
  assert.ok(anonSigned.error, 'anonymous signing must fail');
  const adminSigned = await admin.storage.from(bucket).createSignedUrl('synthetic.pdf',60);
  assert.ok(adminSigned.error, 'direct admin signing must fail');
  const anonRead = await anon.from('private_editorial_documents').select('id');
  assert.ok(anonRead.error, 'anonymous metadata read must fail');
  const adminRead = await admin.from('private_editorial_documents').select('id');
  assert.ok(adminRead.error, 'direct admin metadata read must fail');
  const signed = await service.storage.from(bucket).createSignedUrl('synthetic.pdf',60);
  if (signed.error) throw new Error('Service signing failed');
  const response = await fetch(signed.data.signedUrl, {cache:'no-store'});
  assert.equal(response.status,200);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()),file);
  const publicResponse = await fetch(service.storage.from(bucket).getPublicUrl('synthetic.pdf').data.publicUrl);
  assert.notEqual(publicResponse.status,200);
  const existing = await admin.from('universal_captures').select('id');
  if (existing.error || existing.data.length !== 1) throw new Error('Synthetic admin cannot read capture');
  console.log('Local Storage integration passed: private upload, signed download, direct access denied, admin capture access.');
}
run().catch(e => { console.error(e.message); process.exitCode=1; });


