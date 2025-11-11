/* ---
   AI ව්‍යාපාරික සහයකයා - Vercel Proxy Server (api/generate-image.js)
   *** Stability AI (DreamStudio) API භාවිතයට සම්පූර්ණයෙන් මාරු කරන ලදී ***
--- */
module.exports = async (request, response) => {
    
    // CORS Fix
    if (request.method === 'OPTIONS') { response.setHeader('Access-Control-Allow-Origin', '*'); response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); response.setHeader('Access-Control-Allow-Headers', 'Content-Type'); response.status(200).end(); return; }
    if (request.method !== 'POST') { response.status(405).json({ error: 'Method Not Allowed' }); return; }

    // 1. Keys ලබාගැනීම
    const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
    if (!STABILITY_API_KEY) { 
        response.status(500).json({ error: 'Image API Key (STABILITY_API_KEY) එක සකසා නැත.' }); 
        return; 
    }

    // 2. Prompt ලබාගැනීම
    const userIdea = request.body.idea || "a delicious Sri Lankan chocolate cake";
    const imagePrompt = `High-quality, professional food photography of ${userIdea}. Cinematic lighting, flatlay, social media post aspect ratio.`;

    // 3. Stability API Endpoint
    const API_URL = "https://api.stability.ai/v2beta/stable-image/generate/core"; 

    try {
        const stabResponse = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${STABILITY_API_KEY}`, // <-- Stability Key
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                prompt: imagePrompt,
                output_format: "jpeg",
                aspect_ratio: "1:1", // 1280x1280 සඳහා සුදුසුම අනුපාතය
                seed: 0,
                // ⬇️ AI Model: SD3 Medium (වේගවත්) ⬇️
                model: "sd3-medium", 
            }),
            signal: AbortSignal.timeout(60000)
        });

        // 4. දෝෂ හැසිරවීම
        if (!stabResponse.ok) {
             const errorData = await stabResponse.json();
             response.setHeader('Access-Control-Allow-Origin', '*');
             response.status(stabResponse.status).json({ error: `Stability API Error: ${errorData.errors[0]}` });
             return;
        }

        const data = await stabResponse.json();
        // 5. සාර්ථක ප්‍රතිඵලය ආපසු යැවීම (Image Data එක Base64 format එකේ ඇත)
        const base64Image = data.image; // Stability AI return කරන්නේ 'image' නමැති field එකයි.
        
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.status(200).json({ base64Image: base64Image });

    } catch (error) {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.status(500).json({ error: `Image Server එකේ දෝෂයක්: ${error.message}` });
    }
};
