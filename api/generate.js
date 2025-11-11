/* ---
   AI ව්‍යාපාරික සහයකයා - Vercel Proxy Server (api/generate.js)
   *** "Router" ක්‍රමය අතහැර දමා, "Direct Model Endpoint" ක්‍රමයට මාරු කරන ලදී ***
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
    // ⬇️ *** මෙන්න අලුත් "Direct" API ලිපිනය (Router එක නොවේ) *** ⬇️
    const AI_DIRECT_URL = "https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct";

    // Phi-3 ආකෘතියට අවශ්‍ය Prompt Format එක
    const prompt = `
<|user|>
You are an expert Social Media Post creator for Sri Lankan small businesses.
Your task is to generate the following, formatted ONLY as a valid JSON object:
1. "sinhala": A friendly and catchy caption in Sinhala (using Sinhala Unicode).
2. "english": A friendly and catchy caption in English.
3. "hashtags": A string of 5-7 relevant hashtags (e.g., "#srilanka #smallbusiness #...").
Do not add any text before or after the JSON object, just the JSON.

A user has given this idea: "${userIdea}"
<|end|>
<|assistant|>
`; // ⬅️ AI එක මෙතතැන් සිට JSON එක පමණක් ලියයි

    // 5. HuggingFace API එකට "Server-Side" (ආරක්ෂිතව) කතා කිරීම
    try {
        const hfResponse = await fetch(AI_DIRECT_URL, { // <-- අලුත් Direct URL එක
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // ⬇️ 'model' නම මෙතන අවශ්‍ය නැත, કારણ එය URL එකේම ඇත ⬇️
                inputs: prompt,
                parameters: { 
                    max_new_tokens: 500, 
                    temperature: 0.7,
                    return_full_text: false 
                },
                options: {
                    wait_for_model: true // Model එක load වෙනකම් බලා සිටීම
                }
            })
        });

        // 6. ශක්තිමත් Error Handling
        if (!hfResponse.ok) {
            const errorText = await hfResponse.text(); 
            console.error('HuggingFace API Error (Not OK):', errorText);
            response.status(hfResponse.status).json({ error: `HuggingFace API Error: ${errorText}` });
            return;
        }

        const contentType = hfResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const errorText = await hfResponse.text(); 
            console.error('HuggingFace API Error (Non-JSON Response):', errorText);
            response.status(500).json({ error: `HuggingFace returned an unexpected text response: ${errorText}` });
            return;
        }

        const data = await hfResponse.json();

        // 7. සාර්ථක ප්‍රතිඵලය ආපසු Browser (ai.js) එකට යැවීම
        response.status(200).json(data);

    } catch (error) {
        console.error('Proxy Server Error:', error);
        response.status(500).json({ error: `Server එකේ දෝෂයක්: ${error.message}` });
    }
};
