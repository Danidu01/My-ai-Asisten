/* ---
   AI ව්‍යාපාරික සහයකයා - Vercel Proxy Server (api/generate-caption.js)
   *** Image එකට අදාළ Caption සහ Hashtags නිර්මාණය කිරීම ***
--- */
module.exports = async (request, response) => {
    
    // CORS Fix
    if (request.method === 'OPTIONS') { response.setHeader('Access-Control-Allow-Origin', '*'); response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); response.setHeader('Access-Control-Allow-Headers', 'Content-Type'); response.status(200).end(); return; }
    if (request.method !== 'POST') { response.status(405).json({ error: 'Method Not Allowed' }); return; }

    // 1. Keys ලබාගැනීම
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) { response.status(500).json({ error: 'Text API Key (OPENROUTER_API_KEY) එක සකසා නැත.' }); return; }

    // 2. Prompt ලබාගැනීම
    const imagePrompt = request.body.prompt; // Image Prompt එක
    const API_URL = "https://openrouter.ai/api/v1/chat/completions";
    const AI_MODEL_NAME = "openai/gpt-3.5-turbo"; // වේගවත්ම Text Model

    const systemPrompt = `You are a social media expert. Your task is to generate ONLY a single, valid JSON object for an image created with the following prompt: "${imagePrompt}".
The JSON must contain:
1. "english": A catchy English caption.
2. "hashtags": A string of 5-7 relevant hashtags.
Exclude ALL other text.`;
    
    // 3. OpenRouter API එකට කතා කිරීම
    try {
        const orResponse = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: AI_MODEL_NAME, 
                messages: [
                    { "role": "system", "content": systemPrompt }, 
                    { "role": "user", "content": "Generate the caption and hashtags for the image." }
                ]
            }),
            signal: AbortSignal.timeout(30000)
        });

        if (!orResponse.ok) {
            const errorText = await orResponse.text(); 
            response.setHeader('Access-Control-Allow-Origin', '*'); 
            response.status(orResponse.status).json({ error: `Text API Error: ${errorText}` });
            return;
        }

        const data = await orResponse.json();
        const aiTextResponse = data.choices[0].message.content;

        response.setHeader('Access-Control-Allow-Origin', '*'); 
        response.status(200).json({ generated_text: aiTextResponse });

    } catch (error) {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.status(500).json({ error: `Text Server එකේ දෝෂයක්: ${error.message}` });
    }
};