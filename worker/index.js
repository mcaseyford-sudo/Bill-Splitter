import { SAMPLE_RECEIPT } from '../shared/sampleReceipt.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/parse-receipt') {
      if (request.method !== 'POST') {
        return Response.json({ error: 'Use POST' }, { status: 405 });
      }
      // STUB: OpenAI is not connected yet. Always return the sample receipt.
      return Response.json(SAMPLE_RECEIPT);
    }

    if (url.pathname.startsWith('/api/')) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    // Everything else is the React app.
    return env.ASSETS.fetch(request);
  },
};
