// feed.js — نشر منشور وقراءة الفيد عبر relays مجانية عامة
import { finalizeEvent } from 'nostr-tools';
import { SimplePool, useWebSocketImplementation } from 'nostr-tools/pool';
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
  return publishEvent(event);
}

// لايك — NIP-25 (kind 7)
export async function publishLike(sk, targetEvent) {
  const event = finalizeEvent(
    {
      kind: 7,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['e', targetEvent.id],
        ['p', targetEvent.pubkey],
      ],
      content: '+',
    },
    sk
  );
  return publishEvent(event);
}

// كومنت (رد) — NIP-10 (kind 1 مع e/p tags)
export async function publishReply(sk, targetEvent, content) {
  const event = finalizeEvent(
    {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['e', targetEvent.id, '', 'reply'],
        ['p', targetEvent.pubkey],
      ],
      content,
    },
    sk
  );
  return publishEvent(event);
}

async function publishEvent(event) {
  const results = await Promise.allSettled(pool.publish(RELAYS, event));
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.log(`  ✗ ${RELAYS[i]}: ${r.reason}`);
    else console.log(`  ✓ ${RELAYS[i]}`);
  });
  const ok = results.filter(r => r.status === 'fulfilled').length;
  console.log(`تم النشر (kind ${event.kind}) على ${ok}/${RELAYS.length} relay — id: ${event.id}`);
  return event;
}

export function subscribeFeed(pubkeys, onEvent) {
  const sub = pool.subscribeMany(
    RELAYS,
    { kinds: [1], authors: pubkeys, limit: 20 },
    {
      onevent: onEvent,
      oneose: () => console.log('-- تم تحميل المنشورات القديمة، بننتظر الجديد لحظياً --'),
    }
  );
  return sub;
}

export function subscribeToEvent(eventId, onEvent) {
  return pool.subscribeMany(
    RELAYS,
    { kinds: [1, 7], '#e': [eventId], limit: 50 },
    {
      onevent: onEvent,
      oneose: () => console.log('-- تم تحميل التفاعلات الحالية، بننتظر الجديد لحظياً --'),
    }
  );
}

export function closePool() {
  pool.close(RELAYS);
}
