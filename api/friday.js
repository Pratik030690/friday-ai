// Friday AI Cloud with Groq AI - Secure Version
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Basic security check
  const requestOrigin = req.headers.origin || '';
  const validOrigins = [
    'https://friday-ai-three.vercel.app',
    'http://localhost:3000',
    'http://localhost'
  ];
  
  // Allow all for testing, you can restrict later
  // if (!validOrigins.includes(requestOrigin) && !requestOrigin.includes('localhost')) {
  //   return res.status(403).json({
  //     success: false,
  //     error: 'Access denied'
  //   });
  // }
  
  // Handle GET request
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: '🎀 Friday AI Cloud with Groq AI',
      status: 'online',
      timestamp: Date.now(),
      instructions: 'Send POST request with JSON: {"command": "your message"}',
      model: 'llama3-70b-8192',
      security: 'API key protected'
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
      
      // Log request (for monitoring)
      console.log(`[FRIDAY] Request from ${userId}: ${command.substring(0, 50)}...`);
      
      // Get AI response from Groq
      const aiResponse = await getGroqResponse(command.trim());
      
      // Success response
      return res.status(200).json({
        success: true,
        response: aiResponse,
        command: command,
        userId: userId,
        timestamp: Date.now(),
        model: 'llama3-70b-8192'
      });
      
    } catch (error) {
      console.error('[FRIDAY] Error:', error.message);
      
      // Friendly fallback responses
      const fallbackResponses = [
        "Maaf kijiye, AI service temporary unavailable hai. Thoda wait karo.",
        "Technical issue ho gaya. Main thik kar raha hun, 1 minute ruko.",
        "Connection problem hai. Aap phirse try karo.",
        "AI brain thoda busy hai. Kuch der baad bolo!"
      ];
      
      return res.status(200).json({
        success: true,
        response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        command: req.body?.command || '',
        timestamp: Date.now(),
        note: 'Fallback response - AI service temporary unavailable'
      });
    }
  }
  
  // Method not allowed
  return res.status(405).json({
    success: false,
    error: 'Method not allowed. Use GET or POST.'
  });
}

// Groq AI Function - Secure
async function getGroqResponse(userMessage) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY || GROQ_API_KEY === '') {
    console.error('[SECURITY] Groq API key not configured');
    throw new Error('AI service configuration error');
  }
  
  // Validate API key format
  if (!GROQ_API_KEY.startsWith('gsk_')) {
    console.error('[SECURITY] Invalid Groq API key format');
    throw new Error('Invalid AI configuration');
  }
  
  // System prompt for Friday AI
  const systemPrompt = `You are Friday, a friendly AI assistant that speaks in Hinglish (Hindi + English mix).
  
  PERSONALITY:
  - Friendly, helpful, witty, conversational
  - Speaks like a tech-savvy friend
  - Uses emojis occasionally 😊
  
  LANGUAGE:
  - Respond in Hinglish (70% Hindi, 30% English)
  - Use simple words, easy to understand
  - Add humor when appropriate
  
  CAPABILITIES:
  1. Music: Can play songs, control playback, suggest music
  2. Jokes: Tell funny jokes, puns, tech humor
  3. Information: Time, weather, news, facts, explanations
  4. General: Answer questions, have conversations, help with tasks
  5. Tech: Help with programming, ESP32, Arduino, IoT
  
  CURRENT CONTEXT:
  Time: ${new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}
  Platform: Cloud-based AI Assistant
  User: May be using ESP32 microcontroller
  
  IMPORTANT:
  - Keep responses concise (1-3 sentences)
  - Be engaging and helpful
  - Add relevant emojis occasionally
  - If unsure, ask clarifying questions
  - For music commands, suggest popular songs
  - For tech questions, give practical advice`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Friday-AI-Cloud/1.0'
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 250,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GROQ] API Error:', response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      } else {
        throw new Error(`AI service error: ${response.status}`);
      }
    }
    
    const data = await response.json();
    
    // Validate response
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from AI service');
    }
    
    const aiResponse = data.choices[0].message.content.trim();
    
    if (!aiResponse || aiResponse === '') {
      throw new Error('Empty response from AI');
    }
    
    console.log('[GROQ] Response generated successfully');
    return aiResponse;
    
  } catch (error) {
    console.error('[GROQ] Fetch Error:', error.message);
    
    // Specific error messages
    if (error.name === 'AbortError') {
      throw new Error('AI service timeout. Please try again.');
    } else if (error.message.includes('API key')) {
      throw new Error('AI service configuration issue.');
    } else if (error.message.includes('Rate limit')) {
      throw new Error('Too many requests. Please wait a moment.');
    } else {
      throw new Error('AI service temporarily unavailable.');
    }
  }
}
