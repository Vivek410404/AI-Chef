import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:4000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'rasoi_iq_super_secret_jwt_key_2026';
const WORKER_SECRET = process.env.INTERNAL_WORKER_SECRET || '4f9a8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a';

async function main() {
  const tokenCustA = jwt.sign(
    { sub: 'user-demo-1', id: 'user-demo-1', role: 'CUSTOMER', householdId: 'hh-sharma-family', email: 'rahul.sharma@gmail.com' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const res1 = await fetch(`${BASE_URL}/grocery/cart/reorder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${tokenCustA}`,
      'idempotency-key': 'debug-key-1'
    },
    body: JSON.stringify({ orderId: 'ord-gate-1794928479008-306', householdId: 'hh-sharma-family' })
  });
  console.log('res1 status:', res1.status, await res1.text());

  const res16 = await fetch(`${BASE_URL}/marketplace/orders/ord-gate-1794928479008-306/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-worker-key': WORKER_SECRET
    },
    body: JSON.stringify({ status: 'HUB_PACKING' })
  });
  console.log('res16 status:', res16.status, await res16.text());
}

main().catch(console.error);
