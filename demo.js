// demo.js — تشغيل: node demo.js
import { loadOrCreateIdentity, printIdentity } from './identity.js';
import { publishPost, subscribeFeed, closePool } from './feed.js';

const identity = loadOrCreateIdentity();
const { npub } = printIdentity(identity);

console.log('\n--- نشر منشور تجريبي ---');
await publishPost(identity.sk, `أول منشور من Pulse 🚀 (${new Date().toLocaleTimeString('ar-EG')})`);

console.log('\n--- قراءة الفيد (منشوراتك الأخيرة من الشبكة) ---');
subscribeFeed([identity.pk], (event) => {
  console.log(`[${new Date(event.created_at * 1000).toLocaleTimeString('ar-EG')}] ${event.content}`);
});

// اسيب الاتصال شغال 8 ثواني عشان الـ relay يرجع البيانات، بعدين اقفل
setTimeout(() => {
  closePool();
  console.log('\nتم. هويتك:', npub);
  process.exit(0);
}, 8000);
