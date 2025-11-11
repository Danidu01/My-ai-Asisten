/* ---
   AI ව්‍යාපාරික සහයකයා - AI Logic (ai.js)
   *** Image Method Fix (POST Request) සහ JSON Cleanup වැඩි දියුණු කරන ලදී ***
--- */
document.addEventListener("DOMContentLoaded", () => {
    
    const generateBtn = document.getElementById("generate-btn");
    const generateImageBtn = document.getElementById("generate-image-btn");
    const ideaInput = document.getElementById("idea-input");
    const loadingSpinner = document.getElementById("loading-spinner");
    const resultsContainer = document.getElementById("results-container");
    const imageContainer = document.getElementById("post-image");
    
    const captionSinhala = document.getElementById("caption-sinhala");
    const captionEnglish = document.getElementById("caption-english");
    
    let currentEnglishCaption = ""; 
    const IMAGE_PROXY_URL = '/api/generate-image'; // Image Proxy URL

    if (!generateBtn) return; 

    // --- FUNCTION: JSON Cleanup (AI Output එක නිවැරදි කිරීමට) ---
    function cleanAndParseJson(text) {
        // 1. ```json සහ අනවශ්‍ය text ඉවත් කිරීම (Remove markdown and leading/trailing text)
        let cleanedText = text.trim();
        if (cleanedText.startsWith("```json")) {
            cleanedText = cleanedText.substring(7, cleanedText.length - 3).trim();
        } else if (cleanedText.startsWith("{") === false) {
            // JSON එකට කලින් ඇති අනවශ්‍ය text ඉවත් කිරීම
            const jsonStart = cleanedText.indexOf('{');
            if (jsonStart !== -1) {
                cleanedText = cleanedText.substring(jsonStart).trim();
            }
        }
        
        // 2. අවසන් වරට JSON එක Parse කිරීම
        return JSON.parse(cleanedText);
    }


    // --- A. TEXT Generation Logic (Phase 1) ---
    generateBtn.addEventListener("click", async () => {
        
        const idea = ideaInput.value;
        if (idea.length < 10) { alert("කරුණාකර ඔබේ අදහස තව ටිකක් විස්තර කරන්න."); return; }

        generateBtn.disabled = true;
        resultsContainer.style.display = "none";
        loadingSpinner.style.display = "block";
        generateImageBtn.style.display = "none";

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea: idea }),
            });

            const data = await response.json();

            if (!response.ok) { throw new Error(data.error || 'Server එකෙන් දෝෂයක් පැමිණියා.'); }

            // 1. JSON ප්‍රතිඵලය කියවීම සහ Clean කිරීම
            let rawText = data.generated_text || "{}"; 
            
            try {
                const aiResponse = cleanAndParseJson(rawText);
                
                // 2. ප්‍රතිඵල පෙන්වීම
                captionSinhala.innerText = aiResponse.sinhala;
                captionEnglish.innerText = aiResponse.english;
                document.getElementById("hashtags-output").innerText = aiResponse.hashtags;
                
                // 3. Image Generation සඳහා Caption එක save කිරීම
                currentEnglishCaption = aiResponse.english; 

                // Loading නවතා ප්‍රතිඵල පෙන්වීම
                loadingSpinner.style.display = "none";
                resultsContainer.style.display = "block";
                generateImageBtn.style.display = "block"; // Image Button පෙන්වීම

            } catch(e) {
                 // JSON failed නම්, error එක පෙන්වා raw text එක දමමු
                captionEnglish.innerText = rawText;
                captionSinhala.innerText = "Error: AI failed to output valid JSON. Showing raw text instead.";
                document.getElementById("hashtags-output").innerText = "Error: Check raw output";
                currentEnglishCaption = rawText; // Image සඳහා raw text එක භාවිත කරමු
            }

        } catch (error) {
            alert(`AI සේවාව සමග සම්බන්ධ වීමේ දෝෂයක්: ${error.message}`);
            loadingSpinner.style.display = "none";
        } finally {
            generateBtn.disabled = false;
        }
    });

    // --- B. IMAGE Generation Logic (Phase 2) ---
    generateImageBtn.addEventListener("click", async () => {
        
        if (!currentEnglishCaption) { alert("කරුණාකර මුලින්ම Captions නිර්මාණය කරන්න."); return; }

        generateImageBtn.disabled = true;
        imageContainer.style.opacity = 0.5;
        
        try {
            // ⬇️ *** Image Proxy වෙත POST Request යැවීම *** ⬇️
            const response = await fetch(IMAGE_PROXY_URL, {
                method: 'POST', // 🚨🚨 POST method එක මෙහිදී අනිවාර්යයයි!
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caption: currentEnglishCaption, idea: ideaInput.value }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Vercel server එකෙන් ආ දෝෂයක් (405 Method Not Allowed වැනි)
                throw new Error(data.error || 'Image Server එකෙන් දෝෂයක් පැමිණියා.');
            }
            
            const base64Image = data.base64Image;

            imageContainer.src = `data:image/jpeg;base64,${base64Image}`;
            imageContainer.style.opacity = 1.0; 

        } catch (error) {
            alert(`චිත්‍රය නිර්මාණය කිරීමේ දෝෂයක්: ${error.message}`);
        } finally {
            generateImageBtn.disabled = false;
        }
    });
});
