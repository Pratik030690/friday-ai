// FIXED GEMINI TEST
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (req.method === 'GET') {
    return res.json({
      status: 'Gemini API Test',
      available_models: [
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest', 
        'gemini-pro'
      ],
      key_exists: !!GEMINI_API_KEY
    });
  }
  
  if (req.method === 'POST') {
    try {
      // Try different model names
      const models = [
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest',
        'gemini-pro',
        'gemini-1.0-pro'
      ];
      
      let lastError = '';
      
      for (const model of models) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
          
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: "Hello, tell me a very short joke about technology" }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 100
              }
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            return res.json({
              success: true,
              working_model: model,
              response: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No text',
              full_response: data
            });
          }
          
          lastError = `Model ${model}: ${response.status}`;
          
        } catch (err) {
          lastError = `Model ${model}: ${err.message}`;
        }
      }
      
      return res.json({
        success: false,
        error: 'All models failed',
        last_error: lastError
      });
      
    } catch (error) {
      return res.json({
        success: false,
        error: error.message
      });
    }
  }
}
