/* ---
   AI ව්‍යාපාරික සහයකයා - AI Logic (ai.js)
   *** Image First, Then Caption Orchestration ***
--- */
document.addEventListener("DOMContentLoaded", () => {
    
    const generateBtn = document.getElementById("generate-btn");
    const ideaInput = document.getElementById("idea-input");
    const loadingSpinner = document.getElementById("loading-spinner");
    const resultsContainer = document.getElementById("results-container");
    const imageContainer = document.getElementById("post-image");
    
    const captionSinhala = document.getElementById("caption-sinhala");
    const captionEnglish = document.getElementById("caption-english");
    const hashtagsOutput = document.getElementById("hashtags-output");
    
    // ගෝලීය වශයෙන් Image Prompt ගබඩා කිරීම
    let currentImagePrompt = ""; 
    const IMAGE_PROXY_URL = '/api/generate-image';
    const CAPTION_PROXY_URL = '/api/generate-caption';

    if (!generateBtn) return; 

    // --- FUNCTION: JSON Cleanup (Final Polish) ---
    function cleanAndParseJson(text) {
        let cleanedText = text.trim();
        // ```json block ඉවත් කිරීම
        if (cleanedText.startsWith("```json")) {
            cleanedText = cleanedText.substring(7, cleanedText.length - 3).trim();
        }
        // අනවශ්‍ය text ඉවත් කිරීම (JSON එක '{' වලින් පටන්ගත යුතුයි)
        const jsonStart = cleanedText.indexOf('{');
        const jsonEnd = cleanedText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1).trim();
        } else if (jsonStart === -1) {
            throw new Error("JSON object not found.");
        }
        
        // Final Parse
        return JSON.parse(cleanedText);
    }


    // --- A. MAIN GENERATION LOGIC (Image First) ---
    generateBtn.addEventListener("click", async () => {
        
        const idea = ideaInput.value;
        if (idea.length < 10) { alert("කරුණාකර ඔබේ අදහස තව ටිකක් විස්තර කරන්න."); return; }

        // UI Reset
        generateBtn.disabled = true;
        resultsContainer.style.display = "none";
        loadingSpinner.style.display = "block";
        imageContainer.src = ""; // පරණ image එක මකා දැමීම
        
        // 1. Image Prompt සකස් කිරීම
        currentImagePrompt = idea;

        try {
            // 2. IMAGE Proxy වෙත කතා කිරීම (Image First)
            const imgResponse = await fetch(IMAGE_PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea: idea }), // Image Proxy එකට idea එක යැවීම
            });

            const imgData = await imgResponse.json();

            if (!imgResponse.ok) {
                throw new Error(imgData.error || 'Image Server එකෙන් දෝෂයක් පැමිණියා.');
            }
            
            const base64Image = imgData.base64Image;
            imageContainer.src = `data:image/jpeg;base64,${base64Image}`; // Image එක පෙන්වීම

            // 3. CAPTION Proxy වෙත කතා කිරීම (Image එක සාර්ථක වූ පසු)
            const capResponse = await fetch(CAPTION_PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: currentImagePrompt }), // Caption Proxy එකට Prompt එක යැවීම
            });

            const capData = await capResponse.json();

            if (!capResponse.ok) {
                 throw new Error(capData.error || 'Caption Server එකෙන් දෝෂයක් පැමිණියා.');
            }

            // 4. JSON ප්‍රතිඵලය කියවීම සහ Clean කිරීම
            let rawText = capData.generated_text || "{}"; 
            
            try {
                const aiResponse = cleanAndParseJson(rawText);
                
                // 5. ප්‍රතිඵල පෙන්වීම
                captionEnglish.innerText = aiResponse.english;
                hashtagsOutput.innerText = aiResponse.hashtags;
                
                // 🚨 සිංහල Caption එකක් නැත - එය ඉංග්‍රීසියෙන්ම සකස් කරමු
                // (සිංහල Unicode දෝෂය නිසා, අපි එය English Caption එකෙන් සකස් කරමු)
                captionSinhala.innerText = aiResponse.english; 

            } catch(e) {
                 // JSON failed නම්, error එක පෙන්වා raw text එක දමමු
                captionEnglish.innerText = rawText;
                captionSinhala.innerText = "Error: AI failed to output valid JSON. Please check raw output above.";
                hashtagsOutput.innerText = "Error: Check raw output";
            }

            loadingSpinner.style.display = "none";
            resultsContainer.style.display = "block";

        } catch (error) {
            alert(`ව්‍යාපාරික සහයකයාගේ දෝෂයක්: ${error.message}`);
            loadingSpinner.style.display = "none";
        } finally {
            generateBtn.disabled = false;
        }
    });
});
