/* ---
   AI ව්‍යාපාරික සහයකයා - Vercel Proxy Server (api/generate.js)
   *** AI Model එක "mistralai/mistral-7b-instruct:free" (වඩාත්ම ස්ථාවර) එකට update කරන ලදී ***
--- */

// 'module.exports' (CommonJS) ක්‍රමය භාවිත කිරීම
module.exports = async (request, response) => {
    
    // 1. POST method එකක්දැයි පරීක්ෂා කිරීම
    if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    // 2. රහස් OpenRouter API Key එක Vercel Environment Variables වලින් ලබාගැනීම
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
        response.status(500).json({ error: 'API Key (OPENROUTER_API_KEY) එක සකසා නැත.' });
        return;
    }

    // 3. Browser එකෙන් (ai.js) එවූ "idea" (prompt) එක ලබාගැනීම
    const userIdea = request.body.idea;
    if (!userIdea) {
        response.status(400).json({ error: '"idea" එකක් ලැබුනේ නැත.' });
        return;
    }

    // 4. OpenRouter API එකට අවශ්‍ය Prompt එක සකස් කිරීම
    const API_URL = "https://openrouter.ai/api/v1/chat/completions";
    // ⬇️ *** මෙන්න අලුත්, 100% ක් නොමිලේ දෙන Mistral AI Model එක *** ⬇️
    const AI_MODEL_NAME = "mistralai/mistral-7b-instruct:free"; 

    // Mistral ආකෘතියට අවශ්‍ය Prompt Format එක
    const systemPrompt = `You are an expert Social Media Post creator for Sri Lankan small businesses.
Your task is to generate the following, formatted ONLY as a valid JSON object:
1. "sinhala": A friendly and catchy caption in Sinhala (using Sinhala Unicode).
2. "english": A friendly and catchy caption in English.
3. "hashtags": A string of 5-7 relevant hashtags (e.g., "#srilanka #smallbusiness #...").
Do not add any text before or after the JSON object, just the JSON.`;

    const userPrompt = `A user has given this idea: "${userIdea}"`;

    // 5. OpenRouter API එකට "Server-Side" (ආරක්ෂිතව) කතා කිරීම
    try {
        const orResponse = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`, // <-- OpenRouter Key
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: AI_MODEL_NAME, // <-- Mistral Model නම
                messages: [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": userPrompt }
                ]
            })
        });

        // 6. ශක්තිමත් Error Handling
        if (!orResponse.ok) {
            const errorText = await orResponse.text(); 
            console.error('OpenRouter API Error (Not OK):', errorText);
            response.status(orResponse.status).json({ error: `OpenRouter API Error: ${errorText}` });
            return;
        }

        const data = await orResponse.json();

        // 7. සාර්ථක ප්‍රතිඵලය ආපසු Browser (ai.js) එකට යැවීම
        const aiTextResponse = data.choices[0].message.content;
        response.status(200).json({ generated_text: aiTextResponse });

    } catch (error) {
        console.error('Proxy Server Error:', error);
        response.status(500).json({ error: `Server එකේ දෝෂයක්: ${error.message}` });
    }
};
