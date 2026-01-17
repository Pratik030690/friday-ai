// ULTIMATE DEBUG VERSION
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (req.method === 'GET') {
    return res.json({
      test: 'Gemini Debug',
      key_exists: !!GEMINI_API_KEY,
      key_preview: GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 15) + '...' : 'none'
    });
  }
  
  if (req.method === 'POST') {
    const { command } = req.body || {};
    
    console.log('=== GEMINI DEBUG START ===');
    console.log('Command:', command);
    console.log('API Key exists:', !!GEMINI_API_KEY);
    
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
      
      console.log('URL:', url.substring(0, 100) + '...');
      
      const requestBody = {
        contents: [{
          parts: [{ text: `Respond in Hinglish: ${command}` }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100
        }
      };
      
      console.log('Request body:', JSON.stringify(requestBody));
      
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log('Response time:', responseTime + 'ms');
      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw response length:', responseText.length);
      console.log('Raw response (first 500 chars):', responseText.substring(0, 500));
      
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
        console.log('Parsed successfully');
      } catch (parseError) {
        console.log('JSON Parse Error:', parseError.message);
        console.log('Response text:', responseText);
        parsedData = null;
      }
      
      // Extract response
      let aiResponse = '';
      if (parsedData) {
        console.log('Parsed data keys:', Object.keys(parsedData));
        
        if (parsedData.candidates && parsedData.candidates[0]) {
          const candidate = parsedData.candidates[0];
          console.log('Candidate keys:', Object.keys(candidate));
          
          if (candidate.content && candidate.content.parts) {
            console.log('Content parts:', candidate.content.parts);
            aiResponse = candidate.content.parts[0]?.text || '';
          } else if (candidate.parts) {
            console.log('Direct parts:', candidate.parts);
            aiResponse = candidate.parts[0]?.text || '';
          } else if (candidate.text) {
            aiResponse = candidate.text;
          }
        }
        
        console.log('Extracted response:', aiResponse);
      }
      
      console.log('=== GEMINI DEBUG END ===');
      
      if (aiResponse && aiResponse.trim().length > 0) {
        return res.json({
          success: true,
          response: aiResponse,
          command: command,
          debug: {
            response_time: responseTime,
            status: response.status,
            extracted: true
          }
        });
      } else {
        return res.json({
          success: false,
          response: 'No text extracted',
          command: command,
          debug: {
            response_time: responseTime,
            status: response.status,
            parsed_data: parsedData,
            raw_response_preview: responseText.substring(0, 200)
          }
        });
      }
      
    } catch (error) {
      console.error('=== FETCH ERROR ===');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      console.log('=== END ERROR ===');
      
      return res.json({
        success: false,
        response: 'Fetch error: ' + error.message,
        command: command,
        debug: {
          error_type: error.name,
          error_message: error.message
        }
      });
    }
  }
}
