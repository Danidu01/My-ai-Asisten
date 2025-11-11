/* ---
   AI ව්‍යාපාරික සහයකයා - Vercel Proxy Server (api/generate-image.js)
   *** Final Fix: multipart/form-data භාවිතයෙන් Stability AI (DreamStudio) වෙත යැවීම ***
--- */
const FormData = require('form-data'); // 🚨🚨 New Library
const fetch = require('node-fetch'); // 🚨🚨 New Library (Compatibility)

module.exports = async (request, response) => {
    
    // CORS Fix
    if (request.method === 'OPTIONS') { response.setHeader('Access-Control-Allow-Origin', '*'); response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); response.setHeader('Access-Control-Allow-Headers', 'Content-Type'); response.status(200).end(); return; }
    if (request.method !== 'POST') { response.status(405).json({ error: 'Method Not Allowed' }); return; }

    const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
    if (!STABILITY_API_KEY) { 
        response.status(500).json({ error: 'Image API Key (STABILITY_API_KEY) එක සකසා නැත.' }); 
        return; 
    }
    
    const API_URL = "https://api.stability.ai/v2beta/stable-image/generate/core"; 

    try {
        // 1. Browser එකෙන් ආ JSON Body එක කියවීම
        const userIdea = request.body.idea || "a delicious Sri Lankan chocolate cake";
        const imagePrompt = `High-quality, professional food photography of ${userIdea}. Cinematic lighting, flatlay, social media post aspect ratio.`;
        
        // 2. FormData (multipart/form-data) Object එකක් නිර්මාණය කිරීම
        const formData = new FormData();
        formData.append('prompt', imagePrompt);
        formData.append('output_format', 'jpeg');
        formData.append('aspect_ratio', '1:1');
        formData.append('seed', '0');
        formData.append('model', 'sd3-medium');
        
        // 3. Stability API Endpoint වෙත කතා කිරීම
        const stabResponse = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${STABILITY_API_KEY}`,
                "Accept": "application/json"
                // 'Content-Type': 'multipart/form-data' එක FormData library එකෙන් auto set වේ
            },
            body: formData, // FormData Object එක යැවීම
            signal: AbortSignal.timeout(60000)
        });

        // 4. දෝෂ හැසිරවීම
        if (!stabResponse.ok) {
             const errorData = await stabResponse.json();
             response.setHeader('Access-Control-Allow-Origin', '*');
             response.status(stabResponse.status).json({ error: `Stability API Error: ${errorData.errors[0] || 'Unknown Error'}` });
             return;
        }

        const data = await stabResponse.json();
        const base64Image = data.image; 
        
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.status(200).json({ base64Image: base64Image });

    } catch (error) {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.status(500).json({ error: `Image Server එකේ දෝෂයක්: ${error.message}` });
    }
};
