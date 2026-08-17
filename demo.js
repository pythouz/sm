// demo.js — تشغيل: node demo.js
import { loadOrCreateIdentity, printIdentity } from './identity.js';
import { publishPost, publishLike, publishReply, subscribeFeed, subscribeToEvent, closePool } from './feed.js';

const identity = loadOrCreateIdentity();
const { npub } = printIdentity(identity);

console.log('\n--- 1) نشر منشور تجريبي ---');
const post = await publishPost(identity.sk, `أول منشور من Pulse 🚀 (${new Date().toLocaleTimeString('ar-EG')})`);

console.log('\n--- 2) لايك على المنشور ---');
await publishLike(identity.sk, post);

console.log('\n--- 3) كومنت على المنشور ---');
await publishReply(identity.sk, post, 'أول كومنت تجريبي 👏');

console.log('\n--- 4) متابعة التفاعلات على المنشور (لايك + كومنت) ---');
subscribeToEvent(post.id, (event) => {
  const type = event.kind === 7 ? 'لايك' : 'كومنت';
  console.log(`[${type}] من ${event.pubkey.slice(0, 8)}...: ${event.content}`);
});

console.log('\n--- 5) قراءة الفيد العام ---');
subscribeFeed([identity.pk], (event) => {
  console.log(`[فيد] ${new Date(event.created_at * 1000).toLocaleTimeString('ar-EG')}: ${event.content}`);
});

setTimeout(() => {
  closePool();
  console.log('\nتم. هويتك:', npub);
  process.exit(0);
}, 10000);
