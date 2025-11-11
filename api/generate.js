/* ---
   AI ව්‍යාපාරික සහයකයා - Vercel Proxy Server (api/generate.js)
   *** Text Model එක "meta-llama/llama-3-8b-instruct" (JSON/Sinhala Stable) ලෙස update කරන ලදී ***
--- */
module.exports = async (request, response) => {
    if (request.method !== 'POST') { response.status(405).json({ error: 'Method Not Allowed' }); return; }
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) { response.status(500).json({ error: 'API Key (OPENROUTER_API_KEY) එක සකසා නැත.' }); return; }

    const userIdea = request.body.idea;
    if (!userIdea) { response.status(400).json({ error: '"idea" එකක් ලැබුනේ නැත.' }); return; }

    const API_URL = "https://openrouter.ai/api/v1/chat/completions";
    // ⬇️ *** Llama 3 - JSON සහ Sinhala සඳහා ඉතාමත් විශ්වාසනීයයි *** ⬇️
    const AI_MODEL_NAME = "meta-llama/llama-3-8b-instruct"; 

    const systemPrompt = `You are an expert Social Media Post creator for Sri Lankan small businesses.
You MUST output ONLY a single, valid JSON object.
Your primary language for the 'sinhala' caption MUST be pure **Sinhala Unicode characters** (සිංහල අක්ෂර).

Your task is to generate the following:
1. "sinhala": A catchy caption written entirely in **pure Sinhala Unicode**.
2. "english": A friendly and catchy caption in English.
3. "hashtags": A string of 5-7 relevant hashtags.
Do not add any text before or after the JSON object.`;

    const userPrompt = `A user has given this idea: "${userIdea}"`;

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
            })
        });

        if (!orResponse.ok) {
            const errorText = await orResponse.text(); 
            response.status(orResponse.status).json({ error: `OpenRouter API Error: ${errorText}` });
            return;
        }
        const data = await orResponse.json();
        const aiTextResponse = data.choices[0].message.content;
        response.status(200).json({ generated_text: aiTextResponse });

    } catch (error) {
        response.status(500).json({ error: `Server එකේ දෝෂයක්: ${error.message}` });
    }
};
