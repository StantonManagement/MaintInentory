// Test PIN hashing to verify database seed data
import crypto from 'crypto';

async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

console.log('Testing PIN hashes for database seed data:\n');

// Test PIN 1234 (Stan)
hashPin('1234').then(hash => {
  console.log('PIN: 1234 (Stan)');
  console.log('Hash:', hash);
  console.log('Expected: 03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4');
  console.log('Match:', hash === '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4');
  console.log('');
  
  // Test PIN 5678 (Javier)
  return hashPin('5678');
}).then(hash => {
  console.log('PIN: 5678 (Javier)');
  console.log('Hash:', hash);
  console.log('Expected: 4d79e8897bb61d86c2f43992ec50d7d2d5415d0b2c30f4f5c35e3e47b5c8c8b0');
  console.log('Match:', hash === '4d79e8897bb61d86c2f43992ec50d7d2d5415d0b2c30f4f5c35e3e47b5c8c8b0');
});
