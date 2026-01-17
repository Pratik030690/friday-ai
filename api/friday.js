// FRIDAY AI - FINAL WORKING GEMINI CODE
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
      message: '🎀 Friday AI with Gemini',
      status: 'online',
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
      
      console.log(`[FRIDAY] Command: ${command}`);
      
      // Get AI response
      const aiResponse = await getGeminiResponse(command);
      
      return res.status(200).json({
        success: true,
        response: aiResponse,
        command: command,
        userId: userId,
        timestamp: Date.now(),
        model: 'gemini-flash-latest'
      });
      
    } catch (error) {
      console.error('[FRIDAY] Error:', error.message);
      
      return res.status(200).json({
        success: true,
        response: "Sorry, technical issue. Please try again.",
        command: req.body?.command || '',
        timestamp: Date.now()
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// WORKING GEMINI FUNCTION
async function getGeminiResponse(userMessage) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  // Your Python-style prompt
  const systemPrompt = `You are Friday, a friendly AI assistant. Speak in Hinglish (Hindi+English mix).
Keep responses short and conversational. Be helpful and engaging.`;
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ 
              text: systemPrompt + `\n\nUser: ${userMessage}\n\nAssistant (Friday):` 
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
            topP: 0.95,
            topK: 40
          }
        })
      }
    );
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('[GEMINI] API Error:', response.status, responseText);
      throw new Error(`API error ${response.status}`);
    }
    
    const data = JSON.parse(responseText);
    
    // EXTRACT RESPONSE - NOW WE KNOW THE STRUCTURE
    let aiResponse = '';
    
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts[0]) {
      
      aiResponse = data.candidates[0].content.parts[0].text || '';
    }
    
    // If still empty, try alternative path
    if (!aiResponse && data.candidates && data.candidates[0]) {
      const candidate = data.candidates[0];
      if (candidate.text) {
        aiResponse = candidate.text;
      }
    }
    
    // Final check
    if (!aiResponse || aiResponse.trim() === '') {
      console.error('[GEMINI] Empty response:', JSON.stringify(data));
      throw new Error('Empty response from AI');
    }
    
    // Clean response
    aiResponse = aiResponse.trim();
    
    console.log('[GEMINI] Success:', aiResponse.substring(0, 100));
    return aiResponse;
    
  } catch (error) {
    console.error('[GEMINI] Error:', error.message);
    throw error;
  }
}
