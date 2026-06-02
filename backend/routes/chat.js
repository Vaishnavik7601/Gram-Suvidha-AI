const express = require('express');
const router = express.Router();
let fetchFn;
if (typeof fetch !== 'undefined') {
  fetchFn = fetch;
} else {
  try {
    fetchFn = require('node-fetch');
  } catch (e) {
    fetchFn = null;
  }
}

router.post('/', async (req, res) => {
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Message required' });

  const text = message.toLowerCase();

  try {
    // If user mentions complaint, consult ML service for category guidance
    if (text.includes('complaint') || text.includes('file') || text.includes('report')) {
      // Try calling local ml-service analyze endpoint for heuristic guidance
      try {
        const mlRes = fetchFn ? await fetchFn('http://127.0.0.1:8000/analyze-complaint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: 'other', description: message })
        }) : null;
        if (mlRes.ok) {
          const mlData = await mlRes.json();
          if (mlData.is_valid === false) {
            return res.json({ reply: `It looks like your description may not match the selected category. Suggestion: ${mlData.warning}` });
          }
        }
      } catch (e) {
        // ignore ml-service errors and fall back
      }

      return res.json({ reply: 'To file a complaint: Log in, go to Register Complaint, fill details, add a photo and location. Your Panchayat admin will review and assign a worker.' });
    }

    if (text.includes('scheme') || text.includes('yojana') || text.includes('apply')) {
      return res.json({ reply: 'You can view available schemes at /citizen/schemes. Use the eligibility checker to find schemes that match your age and income.' });
    }

    if (text.includes('status') || text.includes('track') || text.includes('progress')) {
      return res.json({ reply: 'Visit your dashboard to see complaint status: Pending, In Progress, Resolved. For a specific complaint ID, mention it and we can help look it up.' });
    }

    // Default reply
    return res.json({ reply: 'Hello! I can help with filing complaints, scheme eligibility, and tracking. Ask me how to proceed or say "file complaint" to get started.' });
  } catch (err) {
    console.error('Chat error', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
});

module.exports = router;
