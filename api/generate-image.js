/* ---
   AI ව්‍යාපාරික සහයකයා - Vercel Proxy Server (api/generate-image.js)
   *** Image Model එක SD 1.5 (Fast) එකට update කරන ලදී ***
--- */
module.exports = async (request, response) => {
    if (request.method !== 'POST') { response.status(405).json({ error: 'Method Not Allowed' }); return; }
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) { response.status(500).json({ error: 'API Key (OPENROUTER_API_KEY) එක සකසා නැත.' }); return; }

    // Image Generation සඳහා 1.5 Model එක භාවිත කිරීම (Timeout නැවැත්වීමට)
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
            })
        });

        if (!orResponse.ok) {
            const errorText = await orResponse.text(); 
            response.status(orResponse.status).json({ error: `Image API Error: ${errorText}` });
            return;
        }

        const data = await orResponse.json();
        const base64Image = data.data[0].b64_json;
        response.status(200).json({ base64Image: base64Image });

    } catch (error) {
        response.status(500).json({ error: `Image Server එකේ දෝෂයක්: ${error.message}` });
    }
};
