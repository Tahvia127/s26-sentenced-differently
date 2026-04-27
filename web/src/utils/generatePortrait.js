/**
 * generatePortrait.js
 * ShortAPI / GPT-Image-2 portrait generation with polling.
 * Docs: https://shortapi.dev
 */

const BASE   = 'https://shortapi.dev';
const KEY    = import.meta.env.VITE_SHORTAPI_KEY ?? '';
const MODEL  = 'openai/gpt-image-2/text-to-image';
const POLL_MS = 1800;
const TIMEOUT_MS = 90000;

async function createJob(prompt) {
  const res = await fetch(`${BASE}/job/create`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model:  MODEL,
      prompt,
      width:  512,
      height: 512,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Job create failed: HTTP ${res.status}`);
  }
  const json = await res.json();
  const id = json?.id ?? json?.job_id ?? json?.data?.id;
  if (!id) throw new Error('No job ID returned from ShortAPI');
  return id;
}

async function pollJob(jobId) {
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, POLL_MS));
    const res = await fetch(`${BASE}/job/query?id=${jobId}`, {
      headers: { 'Authorization': `Bearer ${KEY}` },
    });
    if (!res.ok) continue;
    const json = await res.json();
    const status = json?.status ?? json?.data?.status;
    if (status === 'completed' || status === 'success' || status === 'done') {
      const url = json?.output?.url ?? json?.url ?? json?.data?.url ?? json?.result?.url;
      if (url) return { url };
      const b64 = json?.output?.base64 ?? json?.base64 ?? json?.data?.base64;
      if (b64) return { base64: b64 };
      throw new Error('Job completed but no image URL/base64 found');
    }
    if (status === 'failed' || status === 'error') {
      throw new Error(json?.error ?? 'Portrait generation failed');
    }
  }
  throw new Error('Portrait generation timed out (90s)');
}

/**
 * Generate a portrait via ShortAPI.
 * Returns { url } or { base64 } depending on what the API returns.
 */
export async function generatePortrait(prompt) {
  if (!KEY) throw new Error('VITE_SHORTAPI_KEY not set. Add it to web/.env');
  const jobId = await createJob(prompt);
  return pollJob(jobId);
}
