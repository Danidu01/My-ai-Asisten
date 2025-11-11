/* ---
   AI ව්‍යාපාරික සහයකයා - Vercel Proxy Server (api/generate.js)
   *** Text Model එක "meta-llama/llama-3-8b-instruct" (JSON/Sinhala Stable) ලෙස update කරන ලදී ***
--- */
module.exports = async (request, response) => {
    // ... (අපේ පරණ කේතය) ...
    // ... (Code from 1 to 4) ...
    // ⬇️ *** මෙහිදී පමණක් වෙනස්කම් සිදුකළ යුතුය *** ⬇️

    // 4. OpenRouter API එකට අවශ්‍ය Prompt එක සකස් කිරීම
    const API_URL = "https://openrouter.ai/api/v1/chat/completions";
    const AI_MODEL_NAME = "meta-llama/llama-3-8b-instruct"; 

    // System Prompt එකෙන් JSON format එක බලගැන්වීම
    const systemPrompt = `You are an expert Social Media Post creator for Sri Lankan small businesses.
Your response MUST be a single, valid JSON object, and ONLY the JSON object.
Your primary language for the 'sinhala' caption MUST be pure **Sinhala Unicode characters**.

Your task is to generate the following:
1. "sinhala": A catchy caption written entirely in **pure Sinhala Unicode**.
2. "english": A friendly and catchy caption in English.
3. "hashtags": A string of 5-7 relevant hashtags.
Exclude ALL introductory text (like "Here is the JSON") and trailing text.`;

    const userPrompt = `A user has given this idea: "${userIdea}"`;

    // 5. OpenRouter API එකට "Server-Side" (ආරක්ෂිතව) කතා කිරීම
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

        // ... (අනෙක් කේතය) ...
    }
};
