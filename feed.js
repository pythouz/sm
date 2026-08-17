// feed.js — نشر منشور وقراءة الفيد عبر relays مجانية عامة
import { finalizeEvent, SimplePool } from 'nostr-tools';
import { useWebSocketImplementation } from 'nostr-tools/pool';
import WebSocket from 'ws';

useWebSocketImplementation(WebSocket);

const RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.primal.net',
  'wss://nos.lol',
];

const pool = new SimplePool();

export async function publishPost(sk, content) {
  const event = finalizeEvent(
    {
      kind: 1, // منشور نصي عادي
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content,
    },
    sk
  );

  const results = await Promise.allSettled(pool.publish(RELAYS, event));
  const ok = results.filter(r => r.status === 'fulfilled').length;
  console.log(`تم النشر على ${ok}/${RELAYS.length} relay`);
  console.log('معرّف المنشور:', event.id);
  return event;
}

export function subscribeFeed(pubkeys, onEvent) {
  const sub = pool.subscribeMany(
    RELAYS,
    [{ kinds: [1], authors: pubkeys, limit: 20 }],
    {
      onevent: onEvent,
      oneose: () => console.log('-- تم تحميل المنشورات القديمة، بننتظر الجديد لحظياً --'),
    }
  );
  return sub;
}

export function closePool() {
  pool.close(RELAYS);
}
