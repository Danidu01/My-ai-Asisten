/* ---
   AI ව්‍යාපාරික සහයකයා - Vercel Proxy Server (api/generate-image.js)
   *** CORS Preflight (OPTIONS) Fix එක සහ Timeout Fix ඇතුළත් කරන ලදී ***
--- */
module.exports = async (request, response) => {
    
    // 1. CORS Preflight Request (OPTIONS) හැසිරවීම
    if (request.method === 'OPTIONS') {
        response.setHeader('Access-Control-Allow-Origin', '*'); 
        response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        response.status(200).end();
        return;
    }
    
    // 2. POST method එකක්දැයි පරීක්ෂා කිරීම
    if (request.method !== 'POST') { response.status(405).json({ error: 'Method Not Allowed' }); return; }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) { response.status(500).json({ error: 'API Key (OPENROUTER_API_KEY) එක සකසා නැත.' }); return; }

    const AI_IMAGE_MODEL_NAME = "runwayml/stable-diffusion-v1-5"; 
    const API_URL = "https://openrouter.ai/api/v1/images/generations"; 
    
    const userCaption = request.body.caption || "delicious Sri Lankan meal";
    const imagePrompt = `A high-quality, appealing social media photo of ${request.body.idea}. Visually emphasize: ${userCaption}. Style: flatlay, professional food photography.`;

    try {
        const orResponse = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`, 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: AI_IMAGE_MODEL_NAME, 
                prompt: imagePrompt,
                n: 1, 
                size: "512x512", 
                response_format: "b64_json"
            }),
            signal: AbortSignal.timeout(60000) // තත්පර 60 (60000ms) කට පසු නවතින්න
        });

        if (!orResponse.ok) {
            const errorText = await orResponse.text(); 
            response.setHeader('Access-Control-Allow-Origin', '*');
            response.status(orResponse.status).json({ error: `Image API Error: ${errorText}` });
            return;
        }

        const data = await orResponse.json();
        const base64Image = data.data[0].b64_json;
        
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.status(200).json({ base64Image: base64Image });

    } catch (error) {
        response.setHeader('Access-Control-Allow-Origin', '*');
        if (error.name === 'TimeoutError') {
             response.status(504).json({ error: 'Image API Request Timeout.' });
        } else {
             response.status(500).json({ error: `Image Server එකේ දෝෂයක්: ${error.message}` });
        }
    }
};
