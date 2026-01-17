// Friday AI Cloud API
export default function handler(req, res) {
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
      message: '🎀 Friday AI Cloud API',
      status: 'online',
      timestamp: Date.now(),
      instructions: 'Send POST request with JSON: {"command": "your message"}'
    });
  }
  
  // Handle POST request
  if (req.method === 'POST') {
    try {
      const { command } = req.body;
      
      if (!command) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a command'
        });
      }
      
      // Simple AI responses
      const responses = {
        greeting: [
          "Hello! Main Friday hu. Aapkaise ho?",
          "Namaste! Main Friday, aapki AI assistant.",
          "Hi there! Friday yahan. Kya madad karu?"
        ],
        joke: [
          "Ek ESP32 ne Cloud se kaha: Tu upar hai, main niche!",
          "Arduino: Main 8-bit hun, tu 32-bit, phir bhi main fast hun!",
          "WiFi password: 12345678... 9 tak wait karo!"
        ]
      };
      
      const cmd = command.toLowerCase();
      let response;
      
      if (cmd.includes('hello') || cmd.includes('hi') || cmd.includes('namaste')) {
        response = responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
      }
      else if (cmd.includes('joke') || cmd.includes('mazak')) {
        response = responses.joke[Math.floor(Math.random() * responses.joke.length)];
      }
      else {
        response = `Aapne kaha: "${command}". Main Friday hu, aapka AI assistant!`;
      }
      
      return res.status(200).json({
        success: true,
        response: response,
        command: command,
        timestamp: Date.now()
      });
      
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Something went wrong'
      });
    }
  }
  
  // Method not allowed
  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}
