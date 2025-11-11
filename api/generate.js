/* ---
   AI ව්‍යාපාරික සහයකයා - Vercel Proxy Server (api/generate.js)
   *** AI Model එක (v0.1) සහ Error Handling (json) update කරන ලදී ***
--- */

// 'module.exports' (CommonJS) ක්‍රමය භාවිත කිරීම
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
    const userIdea = request.body.idea;
    if (!userIdea) {
        response.status(400).json({ error: '"idea" එකක් ලැබුනේ නැත.' });
        return;
    }

    // 4. HuggingFace AI Model එකට අවශ්‍ය Prompt එක සකස් කිරීම
    const AI_ROUTER_URL = "https://router.huggingface.co/hf-inference";
    // ⬇️ *** මෙන්න අලුත්, ස්ථාවර (Stable) AI Model එක *** ⬇️
    const AI_MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.1"; 

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
                model: AI_MODEL_NAME, // <-- අලුත් Model නම
                inputs: prompt,
                parameters: { 
                    max_new_tokens: 500, 
                    temperature: 0.7,
                    return_full_text: false 
                }
            })
        });

        // ⬇️ *** අලුත්: ශක්තිමත් Error Handling *** ⬇️
        // HuggingFace එකෙන් ආපු පිළිතුර (response) OK ද?
        if (!hfResponse.ok) {
            // OK නැත්නම්, පිළිතුර JSON එකක්ද Text එකක්ද කියා බලමු
            // "Not Found" වැනි Text දෝෂයක් ආවොත්, hfResponse.text() එකෙන් අල්ලගමු
            const errorText = await hfResponse.text(); 
            console.error('HuggingFace API Error:', errorText);
            // Browser එකට (ai.js) දෝෂය JSON එකක් ලෙස යවමු
            response.status(hfResponse.status).json({ error: `HuggingFace API Error: ${errorText}` });
            return;
        }

        // ⬇️ පිළිතුර OK නම්, JSON එක කියවමු
        const data = await hfResponse.json();

        // 6. සාර්ථක ප්‍රතිඵලය ආපසු Browser (ai.js) එකට යැවීම
        response.status(200).json(data);

    } catch (error) {
        // (JSON parse error වැනි) Server එකේ දෝෂයක්
        console.error('Proxy Server Error:', error);
        response.status(500).json({ error: `Server එකේ දෝෂයක්: ${error.message}` });
    }
};
