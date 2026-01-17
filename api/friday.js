// CORRECT GEMINI ENDPOINT
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (req.method === 'GET') {
    return res.json({
      test: 'Gemini API Connection Test',
      endpoint: 'v1/models/gemini-pro:generateContent',
      key_present: !!GEMINI_API_KEY
    });
  }
  
  if (req.method === 'POST') {
    try {
      // Correct Gemini endpoint
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: "Say 'Hello Friday' in Hindi" }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 100,
          }
        })
      });
      
      const data = await response.json();
      
      return res.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        response: data,
        error: data.error || null
      });
      
    } catch (error) {
      return res.json({
        success: false,
        error: error.message,
        stack: error.stack
      });
    }
  }
}
