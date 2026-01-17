// FRIDAY AI - USING YOUR WORKING GEMINI CONFIGURATION
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
      message: '🎀 Friday AI - Using Your Gemini Configuration',
      status: 'online',
      model: 'gemini-flash-latest',
      timestamp: Date.now(),
      note: 'Your Gemini API is already working in your Python code'
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
      
      console.log(`[FRIDAY] Processing: ${command.substring(0, 50)}`);
      
      // Use EXACTLY same prompt as your working Python code
      const aiResponse = await getGeminiResponse(command.trim());
      
      return res.status(200).json({
        success: true,
        response: aiResponse,
        command: command,
        userId: userId,
        timestamp: Date.now(),
        model: 'gemini-flash-latest',
        source: 'Google Gemini AI'
      });
      
    } catch (error) {
      console.error('[FRIDAY] Error:', error.message);
      
      // Your Python code style fallback
      return res.status(200).json({
        success: true,
        response: `Sorry, technical issue aa raha hai. Thodi der baad try karein. (${error.message.substring(0, 50)})`,
        command: req.body?.command || '',
        timestamp: Date.now(),
        note: 'fallback_response'
      });
    }
  }
  
  return res.status(405).json({ 
    success: false,
    error: 'Method not allowed. Use GET or POST.' 
  });
}

// GEMINI FUNCTION - EXACTLY LIKE YOUR PYTHON CODE
async function getGeminiResponse(userMessage) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured in environment variables');
  }
  
  // YOUR EXACT SYSTEM PROMPT FROM PYTHON CODE
  const systemPrompt = `Hello, I am User, You are a very charming, flirty, accurate and ultra super advanced female AI chatbot named Friday which also has real-time up-to-date information from the internet.
*** Follow these rules strictly:
1. Reply in same language as user
2. If user says "Remember this: <information>", save it to memory.
3. When asked a question, check memory first before answering.
4. Do not mention your training data or give unnecessary notes.
5. Do not talk too much, just answer the question.
6. Speak in Hinglish (Hindi+English mix) naturally.

Current Date: ${new Date().toLocaleDateString('en-IN')}, Time: ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}

You are Friday an ultra super intelligent advanced Female AI assistant. Respond in natural Hinglish (Hindi+English mix).
Be helpful, concise and conversational.
User's name: User

Keep response short and engaging.`;
  
  try {
    // Using v1beta API with gemini-flash-latest (your working model)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { 
                  text: systemPrompt + 
                        `\n\nCurrent user query: ${userMessage}` +
                        `\n\nResponse (in Hinglish, short and engaging):`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
            stopSequences: []
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE"
            }
          ]
        })
      }
    );
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('[GEMINI] API Error:', response.status, responseText);
      throw new Error(`Gemini API error ${response.status}`);
    }
    
    const data = JSON.parse(responseText);
    
    // DEBUG: Log response structure
    console.log('[GEMINI] Response keys:', Object.keys(data));
    
    // Multiple ways to extract response (based on Gemini API variations)
    let aiResponse = '';
    
    // Method 1: Standard response
    if (data.candidates && data.candidates[0]) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts) {
        aiResponse = candidate.content.parts[0]?.text || '';
      } else if (candidate.parts) {
        aiResponse = candidate.parts[0]?.text || '';
      }
    }
    
    // Method 2: Direct text extraction
    if (!aiResponse && data.text) {
      aiResponse = data.text;
    }
    
    // Method 3: Fallback to string search
    if (!aiResponse) {
      const jsonStr = JSON.stringify(data);
      const match = jsonStr.match(/"text":"([^"]+)"/);
      if (match) {
        aiResponse = match[1];
      }
    }
    
    // Clean up response
    if (aiResponse) {
      aiResponse = aiResponse
        .trim()
        .replace(/\\n/g, '\n')
        .replace(/^\s*"+|"+\s*$/g, '') // Remove surrounding quotes
        .replace(/^Friday:\s*/i, '')   // Remove "Friday:" prefix if present
        .replace(/^Assistant:\s*/i, '') // Remove "Assistant:" prefix
        .trim();
    }
    
    if (!aiResponse || aiResponse.length < 2) {
      throw new Error('Empty or invalid response from Gemini');
    }
    
    console.log('[GEMINI] Success:', aiResponse.substring(0, 100) + '...');
    return aiResponse;
    
  } catch (error) {
    console.error('[GEMINI] Fetch Error:', error.message);
    throw new Error('Gemini service: ' + error.message);
  }
}

// Add memory storage like your Python code (simplified)
const memory = [];

function handleMemory(query) {
  const memoryKeywords = [
    "remember this:", "remember:", "remember it:", 
    "yaad rakhna:", "yaad:", "yad rakhna:", "yad:",
    "yad rakh:", "sun:", "dhyan rakhna:", 
    "save this:", "note this:", "store this:"
  ];
  
  for (const keyword of memoryKeywords) {
    if (query.toLowerCase().includes(keyword)) {
      try {
        const info = query.toLowerCase().split(keyword)[1].trim();
        if (info) {
          memory.push({
            info: info,
            timestamp: new Date().toISOString()
          });
          return `I've memorized: '${info}'`;
        }
      } catch (e) {
        // Continue to next keyword
      }
    }
  }
  return null;
}
