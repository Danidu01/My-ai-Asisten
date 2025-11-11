/* ---
   AI ව්‍යාපාරික සහයකයා - Vercel Proxy Server (api/generate-image.js)
   *** Stability AI (Image Model) එක භාවිතයට යාවත්කාලීන කරන ලදී ***
--- */

// 'module.exports' (CommonJS) ක්‍රමය භාවිත කිරීම
module.exports = async (request, response) => {
    
    // 1. POST method එකක්දැයි පරීක්ෂා කිරීම
    if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    // 2. රහස් OpenRouter API Key එක Vercel Environment Variables වලින් ලබාගැනීම
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; // <-- එකම Key එක
    if (!OPENROUTER_API_KEY) {
        response.status(500).json({ error: 'API Key (OPENROUTER_API_KEY) එක සකසා නැත.' });
        return;
    }

    // 3. Browser එකෙන් එවූ "caption" සහ "idea" ලබාගැනීම
    const userCaption = request.body.caption || "delicious Sri Lankan meal";
    const userIdea = request.body.idea || "a simple food image";
    
    // 4. OpenRouter API එකට අවශ්‍ය Prompt එක සකස් කිරීම
    const API_URL = "https://openrouter.ai/api/v1/images/generations"; // <-- Image API URL
    
    // ⬇️ *** Image Creation Model (Free Tier එකේ ඇති) *** ⬇️
    // Stability AI (SDXL) යනු හොඳම නොමිලේ දෙන Image Model එකයි
    const AI_IMAGE_MODEL_NAME = "stabilityai/stable-diffusion-xl-base-1.0"; 

    // AI චිත්‍රය සඳහා Prompt එක
    const imagePrompt = `A high-quality, appealing commercial photo of ${userIdea}. The image should visually emphasize: ${userCaption}. Style: food photography, professional bokeh, cinematic lighting, social media post aspect ratio.`;

    // 5. OpenRouter Image API එකට "Server-Side" (ආරක්ෂිතව) කතා කිරීම
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
                n: 1, // එක චිත්‍රයක් පමණක් ඉල්ලමු
                // 1280x1280 චිත්‍රය වෙනුවට, 1024x1024 (SDXL Standard) එකක් ඉල්ලමු
                size: "1024x1024", 
                response_format: "b64_json" // Base64 encoding වලින් පිළිතුර ඉල්ලමු
            })
        });

        if (!orResponse.ok) {
            const errorText = await orResponse.text(); 
            response.status(orResponse.status).json({ error: `Image API Error: ${errorText}` });
            return;
        }

        const data = await orResponse.json();

        // 6. සාර්ථක ප්‍රතිඵලය ආපසු Browser (ai.js) එකට යැවීම
        // Image Data එක (Base64 string) පමණක් යවමු
        const base64Image = data.data[0].b64_json;
        response.status(200).json({ base64Image: base64Image });

    } catch (error) {
        console.error('Image Proxy Server Error:', error);
        response.status(500).json({ error: `Image Server එකේ දෝෂයක්: ${error.message}` });
    }
};