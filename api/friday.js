// Friday AI Cloud with Groq AI
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
      message: '🎀 Friday AI Cloud with Groq AI',
      status: 'online',
      timestamp: Date.now(),
      instructions: 'Send POST request with JSON: {"command": "your message"}',
      model: 'llama3-70b-8192'
    });
  }
  
  // Handle POST request
  if (req.method === 'POST') {
    try {
      const { command, userId = 'user' } = req.body;
      
      if (!command || command.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Please provide a command'
        });
      }
      
      console.log(`Processing: ${command}`);
      
      // Get AI response from Groq
      const aiResponse = await getGroqResponse(command);
      
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
      console.error('Error:', error);
      
      // Fallback responses
      const fallback = [
        "Sorry, AI service is temporary unavailable.",
        "Technical issue ho gaya. Thoda wait karo.",
        "Connection problem hai. Phirse try karo."
      ];
      
      return res.status(200).json({
        success: true,
        response: fallback[Math.floor(Math.random() * fallback.length)],
        command: req.body.command || '',
        timestamp: Date.now(),
        note: 'Fallback response'
      });
    }
  }
  
  // Method not allowed
  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}

// Groq AI Function
async function getGroqResponse(userMessage) {
  // Your Groq API Key - Vercel Environment Variable me set karna hoga
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }
  
  // System prompt for Friday AI
  const systemPrompt = `You are Friday, a friendly and ultra intelligent AI Female assistant that speaks in Hinglish (Hindi + English mix).
  
  Personality: Friendly, charming, helpful, witty, conversational
  Language: Respond in Hinglish (70% Hindi, 30% English)
  Tone: Casual and friendly
  
  Capabilities:
  1. Music: You can play songs, control playback
  2. Jokes: Tell funny jokes and puns
  3. Information: Time, weather, news, facts
  4. General: Answer questions, have conversations
  
  Current time: ${new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}
  
  Important: Keep responses concise (1-2 sentences). Be engaging and helpful.`;
  
  try {
    // Using fetch (built into Node.js 18+)
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
        max_tokens: 200,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      })
    });
    
    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract AI response
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }
    
    return aiResponse;
    
  } catch (error) {
    console.error('Groq API Error:', error.message);
    throw error;
  }
}
