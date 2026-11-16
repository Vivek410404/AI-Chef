// scripts/verify-live-gemini-status.mjs
// Audit live Gemini models against Google's API endpoint without leaking API key

import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.log('No GEMINI_API_KEY found in .env');
  process.exit(1);
}

const models = [
  'models/gemini-3.5-flash-lite',
  'models/gemini-3.1-flash-lite',
  'models/gemini-2.5-flash-lite',
  'models/gemini-1.5-flash',
  'models/gemini-3.5-flash'
];

async function testModel(model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`;
  const startTime = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Return JSON: {"test": "ok", "provider": "gemini"}' }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });
    const duration = Date.now() - startTime;
    const text = await res.text();
    let parsed = null;
    try { parsed = JSON.parse(text); } catch {}
    
    return {
      model,
      reachedGoogle: true,
      httpStatus: res.status,
      durationMs: duration,
      error: res.status !== 200 ? (parsed?.error?.message || text.slice(0, 100)) : null,
      errorCode: parsed?.error?.code,
      errorStatus: parsed?.error?.status,
      sampleResponse: res.status === 200 ? parsed?.candidates?.[0]?.content?.parts?.[0]?.text : null
    };
  } catch (err) {
    return {
      model,
      reachedGoogle: false,
      error: err.message,
      durationMs: Date.now() - startTime
    };
  }
}

async function run() {
  console.log('=====================================================');
  console.log('  LIVE GOOGLE GEMINI API MODEL PROBING AUDIT          ');
  console.log('=====================================================');

  for (const m of models) {
    const result = await testModel(m);
    console.log(`\nModel: ${result.model}`);
    console.log(`  Reached Google API: ${result.reachedGoogle ? 'YES' : 'NO'}`);
    console.log(`  HTTP Status: ${result.httpStatus || 'N/A'} (${result.durationMs}ms)`);
    if (result.httpStatus === 200) {
      console.log(`  Output: ${result.sampleResponse?.trim()}`);
    } else {
      console.log(`  Error: [${result.errorStatus || 'ERR'}] ${result.error}`);
    }
  }
}

run().catch(console.error);
