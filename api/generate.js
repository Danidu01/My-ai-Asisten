/* ---
   AI ව්‍යාපාරික සහයකයා - Vercel Proxy Server (api/generate.js)
   *** Final Fix: Mixtral 8x7B (ඉතා වේගවත්) වෙත මාරු කරන ලදී ***
--- */
// 'module.exports' (CommonJS) ක්‍රමය භාවිත කිරීම
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
    if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
        response.status(500).json({ error: 'API Key (OPENROUTER_API_KEY) එක සකසා නැත.' });
        return;
    }

    const userIdea = request.body.idea;
    if (!userIdea) {
        response.status(400).json({ error: '"idea" එකක් ලැබුනේ නැත.' });
        return;
    }

    // 3. OpenRouter API එකට අවශ්‍ය Prompt එක සකස් කිරීම
    const API_URL = "https://openrouter.ai/api/v1/chat/completions";
    // ⬇️ *** වේගවත්ම Free Model එක *** ⬇️
    const AI_MODEL_NAME = "mubaris/mixtral-8x7b-instruct-v0.1-gguf"; 

    const systemPrompt = `You are an expert Social Media Post creator for Sri Lankan small businesses.
Your response MUST be a single, valid JSON object, and ONLY the JSON object.
Your primary language for the 'sinhala' caption MUST be pure **Sinhala Unicode characters**.

Your task is to generate the following:
1. "sinhala": A catchy caption written entirely in **pure Sinhala Unicode**.
2. "english": A friendly and catchy caption in English.
3. "hashtags": A string of 5-7 relevant hashtags.
Exclude ALL introductory text and trailing text.`;

    const userPrompt = `A user has given this idea: "${userIdea}"`;

    // 4. OpenRouter API එකට "Server-Side" (ආරක්ෂිතව) කතා කිරීම
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
                    { "role": "user", "content": userPrompt }
                ]
            }),
            signal: AbortSignal.timeout(45000) // තත්පර 45 කට පසු නවතින්න
        });

        if (!orResponse.ok) {
            const errorText = await orResponse.text(); 
            response.setHeader('Access-Control-Allow-Origin', '*'); 
            response.status(orResponse.status).json({ error: `OpenRouter API Error: ${errorText}` });
            return;
        }

        const data = await orResponse.json();

        const aiTextResponse = data.choices[0].message.content;
        response.setHeader('Access-Control-Allow-Origin', '*'); 
        response.status(200).json({ generated_text: aiTextResponse });

    } catch (error) {
        response.setHeader('Access-Control-Allow-Origin', '*');
        if (error.name === 'TimeoutError') {
             response.status(504).json({ error: 'AI Request Timeout: OpenRouter took too long to respond.' });
        } else {
             response.status(500).json({ error: `Proxy Server Error: ${error.message}` });
        }
    }
};
