/* ---
   AI ව්‍යාපාරික සහයකයා - Vercel Proxy Server (api/generate.js)
   *** CORS Preflight (OPTIONS) Fix එක ඇතුළත් කරන ලදී ***
--- */
module.exports = async (request, response) => {
    
    // ⬇️ *** 1. CORS Preflight Request (OPTIONS) හැසිරවීම *** ⬇️
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
    
    // ... (අනෙක් කේතය) ...
    // ... (Code from 3 to 7) ...
    
    // 7. සාර්ථක ප්‍රතිඵලය ආපසු Browser (ai.js) එකට යැවීම
    const aiTextResponse = data.choices[0].message.content;
    
    // ⬇️ *** සාර්ථක ප්‍රතිඵලයට CORS Header එක එකතු කිරීම *** ⬇️
    response.setHeader('Access-Control-Allow-Origin', '*'); 
    response.status(200).json({ generated_text: aiTextResponse });

    // ... (අනෙක් කේතය) ...
};
