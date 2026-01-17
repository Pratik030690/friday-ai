// Friday AI Cloud with Google Gemini AI
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Handle GET request
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: '🎀 Friday AI Cloud with Google Gemini',
      status: 'online',
      timestamp: Date.now(),
      instructions: 'Send POST request with JSON: {"command": "your message"}',
      ai_model: 'gemini-1.5-flash',
      provider: 'Google AI Studio'
    });
  }
  
  // Handle POST request
  if (req.method === 'POST') {
    try {
      const { command, userId = 'user' } = req.body;
      
      // Validate input
      if (!command || typeof command !== 'string' || command.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid command'
        });
      }
      
      console.log(`[FRIDAY] Processing: ${command.substring(0, 50)}...`);
      
      // Get AI response from Gemini
      const aiResponse = await getGeminiResponse(command.trim());
      
      // Success response
      return res.status(200).json({
        success: true,
        response: aiResponse,
        command: command,
        userId: userId,
        timestamp: Date.now(),
        model: 'gemini-1.5-flash'
      });
      
    } catch (error) {
      console.error('[FRIDAY] Error:', error.message);
      
      // Smart fallback based on error
      let fallbackMessage = "Technical issue ho gaya. Thoda ruko...";
      
      if (error.message.includes('API_KEY') || error.message.includes('key')) {
        fallbackMessage = "AI service configuration issue. API key check karo.";
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        fallbackMessage = "Request limit exceed ho gaya. 1 minute baad try karo.";
      } else if (error.message.includes('network') || error.message.includes('connect')) {
        fallbackMessage = "Network issue hai. Internet check karo.";
      }
      
      return res.status(200).json({
        success: true,
        response: fallbackMessage,
        command: req.body?.command || '',
        timestamp: Date.now(),
        note: 'Fallback - ' + error.message.substring(0, 50)
      });
    }
  }
  
  // Method not allowed
  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}

// Google Gemini AI Function
async function getGeminiResponse(userMessage) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY || GEMINI_API_KEY === '') {
    console.error('[GEMINI] API key not configured');
    throw new Error('GEMINI_API_KEY not set in environment variables');
  }
  
  // Validate API key format
  if (!GEMINI_API_KEY.startsWith('AIza')) {
    console.error('[GEMINI] Invalid API key format');
    throw new Error('Invalid Gemini API key format');
  }
  
  // System prompt for Friday AI
  const systemPrompt = `You are Friday, a friendly AI assistant that speaks in Hinglish (Hindi + English mix).

PERSONALITY:
- Friendly, helpful, witty, conversational
- Speaks like a tech-savvy friend
- Uses occasional emojis but not too many

LANGUAGE:
- Respond in Hinglish (70% Hindi, 30% English)
- Keep sentences short and simple
- Add humor when appropriate

CAPABILITIES:
1. Music: Can play songs, control playback, suggest playlists
2. Jokes: Tell funny jokes, especially tech-related puns
3. Information: Time, weather, news, facts, explanations
4. Tech Help: ESP32, Arduino, IoT, programming, electronics
5. General: Conversations, advice, recommendations

CURRENT CONTEXT:
- Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
- Platform: Cloud AI Assistant
- User: May be using ESP32 microcontroller

RESPONSE GUIDELINES:
- Keep responses concise (1-3 sentences)
- Be engaging and helpful
- For music: Suggest popular Bollywood/English songs
- For tech: Give practical, actionable advice
- If unsure: Ask clarifying questions
- Add relevant emojis occasionally (🎵 for music, 🤖 for tech, 😄 for jokes)`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    // Gemini API endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt }
            ],
            role: "user"
          },
          {
            parts: [
              { text: userMessage }
            ],
            role: "user"
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 300,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[GEMINI] API Error:', response.status, JSON.stringify(errorData));
      
      if (response.status === 400) {
        throw new Error('Invalid request to Gemini API');
      } else if (response.status === 403) {
        throw new Error('Gemini API key invalid or quota exceeded');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Gemini API error: ${response.status}`);
      }
    }
    
    const data = await response.json();
    
    // Extract response text
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      console.error('[GEMINI] Invalid response structure:', JSON.stringify(data).substring(0, 200));
      throw new Error('Invalid response from Gemini API');
    }
    
    const aiResponse = data.candidates[0].content.parts[0]?.text || '';
    
    if (!aiResponse.trim()) {
      throw new Error('Empty response from Gemini');
    }
    
    console.log('[GEMINI] Response generated successfully');
    return aiResponse.trim();
    
  } catch (error) {
    console.error('[GEMINI] Fetch Error:', error.message);
    
    // Specific error handling
    if (error.name === 'AbortError') {
      throw new Error('Gemini API timeout. Please try again.');
    } else if (error.message.includes('API key') || error.message.includes('key')) {
      throw new Error('Gemini API key issue. Check configuration.');
    } else if (error.message.includes('quota') || error.message.includes('limit')) {
      throw new Error('Gemini API quota exceeded. Free tier limit reached.');
    } else if (error.message.includes('network')) {
      throw new Error('Network error connecting to Gemini.');
    } else {
      throw new Error('Gemini AI service temporarily unavailable: ' + error.message);
    }
  }
}

// Simple health check endpoint
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
