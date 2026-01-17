// LIST GEMINI MODELS
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (req.method === 'GET') {
    try {
      // First, list available models
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
      
      const listResponse = await fetch(listUrl);
      const modelsData = await listResponse.json();
      
      return res.json({
        success: true,
        available_models: modelsData.models?.map(m => m.name) || [],
        models_count: modelsData.models?.length || 0,
        key_exists: !!GEMINI_API_KEY
      });
      
    } catch (error) {
      return res.json({
        success: false,
        error: error.message,
        key_preview: GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'none'
      });
    }
  }
  
  if (req.method === 'POST') {
    try {
      // Get available models first
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
      const listResponse = await fetch(listUrl);
      const modelsData = await listResponse.json();
      
      const models = modelsData.models || [];
      
      // Try each model
      for (const model of models.slice(0, 5)) {
        try {
          const modelName = model.name.split('/').pop(); // Extract model name
          const generateUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
          
          const genResponse = await fetch(generateUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: "Hello, respond with 'OK'" }]
              }]
            })
          });
          
          if (genResponse.ok) {
            const data = await genResponse.json();
            return res.json({
              success: true,
              working_model: modelName,
              model_display_name: model.displayName,
              response: data.candidates?.[0]?.content?.parts?.[0]?.text || 'no text',
              all_models: models.map(m => m.name)
            });
          }
        } catch (err) {
          continue; // Try next model
        }
      }
      
      return res.json({
        success: false,
        error: 'No working model found',
        available_models: models.map(m => m.name),
        key_preview: GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 15) + '...' : 'none'
      });
      
    } catch (error) {
      return res.json({
        success: false,
        error: error.message
      });
    }
  }
}
