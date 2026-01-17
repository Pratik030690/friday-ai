// DEBUG GEMINI RESPONSE
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (req.method === 'GET') {
    return res.json({
      debug: true,
      gemini_key: GEMINI_API_KEY ? 'SET' : 'NOT SET'
    });
  }
  
  if (req.method === 'POST') {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "Hello, respond with just 'OK TEST'" }]
          }]
        })
      });
      
      const responseText = await response.text();
      
      return res.json({
        success: response.ok,
        status: response.status,
        raw_response: responseText,
        parsed: JSON.parse(responseText)
      });
      
    } catch (error) {
      return res.json({
        success: false,
        error: error.message,
        raw_error: error.toString()
      });
    }
  }
}
