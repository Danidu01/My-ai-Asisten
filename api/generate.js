/* ---
   AI ව්‍යාපාරික සහයකයා - Vercel Proxy Server (api/generate.js)
   *** Final Fix: Network Error Handling සහ GPT-3.5-Turbo (OpenRouter) ***
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
    const AI_MODEL_NAME = "openai/gpt-3.5-turbo"; 

    const systemPrompt = `You are an expert Social Media Post creator for Sri Lankan small businesses.
Your response MUST be a single, valid JSON object, and ONLY the JSON object.
Your primary language for the 'sinhala' caption MUST be pure **Sinhala Unicode characters**.
Exclude ALL introductory text (like "Here is the JSON") and trailing text.`;

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
            // 🚨 Time out වීමට පෙර API එකට කියන්න (Vercel Timeout එක වළක්වයි)
            signal: AbortSignal.timeout(50000) // තත්පර 50 (50000ms) කට පසු නවතින්න
        });

        // 5. සාර්ථක නොවන Response හැසිරවීම (400, 404, 429 වැනි)
        if (!orResponse.ok) {
            const errorText = await orResponse.text(); 
            response.setHeader('Access-Control-Allow-Origin', '*'); 
            response.status(orResponse.status).json({ error: `OpenRouter API Error: ${errorText}` });
            return;
        }

        const data = await orResponse.json();

        // 6. සාර්ථක ප්‍රතිඵලය ආපසු Browser (ai.js) එකට යැවීම
        const aiTextResponse = data.choices[0].message.content;
        response.setHeader('Access-Control-Allow-Origin', '*'); 
        response.status(200).json({ generated_text: aiTextResponse });

    } catch (error) {
        // 🚨 ජාල දෝෂය (Network Error) හෝ Timeout Error එක අල්ලාගැනීම
        response.setHeader('Access-Control-Allow-Origin', '*');
        if (error.name === 'TimeoutError') {
             response.status(504).json({ error: 'AI Request Timeout: OpenRouter took too long to respond.' });
        } else {
             response.status(500).json({ error: `Proxy Server Error: ${error.message}` });
        }
    }
};
