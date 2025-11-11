/* ---
   AI ව්‍යාපාරික සහයකයා - Vercel Proxy Server (api/generate.js)
   *** Vercel දෝෂය විසඳීමට "CommonJS" (module.exports) ක්‍රමයට වෙනස් කරන ලදී ***
--- */

// ⬇️ 'export default' වෙනුවට 'module.exports' භාවිත කිරීම ⬇️
module.exports = async (request, response) => {
    
    // 1. POST method එකක්දැයි පරීක්ෂා කිරීම
    if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    // 2. රහස් API Key එක Vercel Environment Variables වලින් ලබාගැනීම
    const HF_API_KEY = process.env.HF_API_KEY;

    if (!HF_API_KEY) {
        response.status(500).json({ error: 'API Key (Environment Variable) එක සකසා නැත.' });
        return;
    }

    // 3. Browser එකෙන් (ai.js) එවූ "idea" (prompt) එක ලබාගැනීම
    // CJS ක්‍රමයේදී, request.body එක Vercel ස්වයංක්‍රීයව parse කරයි
    const userIdea = request.body.idea;
    if (!userIdea) {
        response.status(400).json({ error: '"idea" එකක් ලැබුනේ නැත.' });
        return;
    }

    // 4. HuggingFace AI Model එකට අවශ්‍ය Prompt එක සකස් කිරීම
    const AI_ROUTER_URL = "https://router.huggingface.co/hf-inference";
    const AI_MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.2";

    const prompt = `
        [INST] You are an expert Social Media Post creator for Sri Lankan small businesses.
        A user has given this idea: "${userIdea}"

        Your task is to generate the following, formatted ONLY as a valid JSON object:
        1. "sinhala": A friendly and catchy caption in Sinhala (using Sinhala Unicode).
        2. "english": A friendly and catchy caption in English.
        3. "hashtags": A string of 5-7 relevant hashtags (e.g., "#srilanka #smallbusiness #...").

        Do not add any text before or after the JSON object, just the JSON.
        [/INST]
    `;

    // 5. HuggingFace API එකට "Server-Side" (ආරක්ෂිතව) කතා කිරීම
    try {
        const hfResponse = await fetch(AI_ROUTER_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: AI_MODEL_NAME,
                inputs: prompt,
                parameters: { 
                    max_new_tokens: 500, 
                    temperature: 0.7,
                    return_full_text: false 
                }
            })
        });

        const data = await hfResponse.json();

        if (!hfResponse.ok) {
            console.error('HuggingFace Error:', data);
            response.status(hfResponse.status).json({ error: `HuggingFace API Error: ${data.error}` });
            return;
        }

        // 6. සාර්ථක ප්‍රතිඵලය ආපසු Browser (ai.js) එකට යැවීම
        response.status(200).json(data);

    } catch (error) {
        console.error('Proxy Server Error:', error);
        response.status(500).json({ error: `Server එකේ දෝෂයක්: ${error.message}` });
    }
};
