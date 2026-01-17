// REAL GEMINI TEST
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (req.method === 'GET') {
    return res.json({
      status: 'Testing Gemini API',
      key_exists: !!GEMINI_API_KEY,
      key_preview: GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 15) + '...' : 'none'
    });
  }
  
  if (req.method === 'POST') {
    try {
      // Direct Gemini API call
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: "Hello, tell me a short joke" }]
            }]
          })
        }
      );
      
      const data = await response.json();
      
      return res.json({
        success: true,
        gemini_response: data,
        status_code: response.status
      });
      
    } catch (error) {
      return res.json({
        success: false,
        error: error.message,
        gemini_key: GEMINI_API_KEY ? 'present' : 'missing'
      });
    }
  }
}
