// SIMPLE TEST CODE - Check Environment Variable
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Get Gemini API key from environment
  const geminiKey = process.env.GEMINI_API_KEY;
  const hasKey = !!geminiKey;
  const keyPreview = hasKey ? geminiKey.substring(0, 10) + '...' : 'NO KEY FOUND';
  
  // Handle GET request
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: '🔧 Debug Mode - Friday AI',
      gemini_key_exists: hasKey,
      gemini_key_preview: keyPreview,
      key_length: hasKey ? geminiKey.length : 0,
      starts_with_AIza: hasKey ? geminiKey.startsWith('AIza') : false,
      timestamp: Date.now(),
      note: 'This is debug mode to check environment variables'
    });
  }
  
  // Handle POST request
  if (req.method === 'POST') {
    try {
      const { command } = req.body || {};
      
      return res.status(200).json({
        success: true,
        response: `Debug: Gemini Key exists? ${hasKey}. Key preview: ${keyPreview}`,
        command: command || 'no command',
        gemini_key_status: hasKey ? 'PRESENT' : 'MISSING',
        timestamp: Date.now(),
        instructions: 'If key is missing, check Vercel environment variables'
      });
      
    } catch (error) {
      return res.status(200).json({
        success: false,
        response: `Error: ${error.message}`,
        gemini_key_exists: hasKey,
        timestamp: Date.now()
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
