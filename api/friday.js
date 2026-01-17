// FRIDAY AI WITH GEMINI - WORKING VERSION
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Handle GET
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: '🎀 Friday AI with Google Gemini',
      status: 'online',
      model: 'gemini-flash-latest',
      timestamp: Date.now()
    });
  }
  
  // Handle POST
  if (req.method === 'POST') {
    try {
      const { command, userId = 'user' } = req.body;
      
      if (!command || command.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Please provide a command'
        });
      }
      
      // Get response from Gemini
      const aiResponse = await getGeminiResponse(command.trim());
      
      return res.status(200).json({
        success: true,
        response: aiResponse,
        command: command,
        userId: userId,
        timestamp: Date.now(),
        model: 'gemini-flash-latest'
      });
      
    } catch (error) {
      console.error('Error:', error.message);
      
      // Fallback
      return res.status(200).json({
        success: true,
        response: "Temporary issue: " + error.message,
        command: req.body?.command || '',
        timestamp: Date.now(),
        note: 'fallback'
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// GEMINI AI FUNCTION - WORKING
async function getGeminiResponse(userMessage) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  // System prompt
  const systemPrompt = `You are Friday, a friendly AI assistant that speaks in Hinglish (Hindi + English mix).
  
  Respond in Hinglish (70% Hindi, 30% English).
  Be concise, friendly, and helpful.
  Add occasional emojis.
  
  Current time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt }]
            },
            {
              role: "user", 
              parts: [{ text: userMessage }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          }
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract response
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiResponse) {
      throw new Error('No response from Gemini');
    }
    
    return aiResponse;
    
  } catch (error) {
    throw new Error('Gemini AI: ' + error.message);
  }
}
