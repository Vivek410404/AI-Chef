import 'dotenv/config';
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set');
  process.exit(1);
}

const candidates = [
  'models/gemini-3.5-flash',
  'models/gemini-3.5-flash-lite',
  'models/gemini-3.8-flash',
  'models/gemini-flash-latest',
  'models/gemini-flash-lite-latest',
  'models/gemini-2.5-flash-lite',
  'models/gemini-3-flash-preview',
  'models/gemini-3.7-flash'
];

async function checkCandidates() {
  for (const model of candidates) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Return JSON: {"status": "ok"}' }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });
      console.log(`${model} -> Status ${res.status}`);
      if (res.status === 200) {
        const d = await res.json();
        console.log('SUCCESS with', model, d.candidates?.[0]?.content?.parts?.[0]?.text);
        break;
      }
    } catch (err) {
      console.log(`${model} -> error ${err.message}`);
    }
  }
}

checkCandidates().catch(console.error);
