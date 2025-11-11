/* ---
   AI ව්‍යාපාරික සහයකයා - AI Logic (ai.js)
   *** OpenRouter.ai (Vercel Proxy) එකට කතා කිරීමට යාවත්කාලීන කරන ලදී ***
--- */

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. HTML Elements අල්ලා ගැනීම
    const generateBtn = document.getElementById("generate-btn");
    const ideaInput = document.getElementById("idea-input");
    
    const loadingSpinner = document.getElementById("loading-spinner");
    const resultsContainer = document.getElementById("results-container");
    
    // Output boxes
    const captionSinhala = document.getElementById("caption-sinhala");
    const captionEnglish = document.getElementById("caption-english");
    const hashtagsOutput = document.getElementById("hashtags-output");
    
    // Image Generation Button
    const generateImageBtn = document.getElementById("generate-image-btn");

    if (!generateBtn) return; // 'app.html' පිටුවේ නැත්නම්, මෙතනින් නවතින්න

    // 2. "Generate" බොත්තම click කළ විට
    generateBtn.addEventListener("click", async () => {
        
        const idea = ideaInput.value;
        if (idea.length < 10) {
            alert("කරුණාකර ඔබේ අදහස තව ටිකක් විස්තර කරන්න.");
            return;
        }

        // UI එක සූදානම් කිරීම
        generateBtn.disabled = true;
        resultsContainer.style.display = "none";
        loadingSpinner.style.display = "block";
        generateImageBtn.style.display = "none";

        // 3. අපේ "මැද මිනිසා" (Vercel Proxy) වෙත කතා කිරීම
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idea: idea }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Vercel server එකෙන් ආ දෝෂයක්
                throw new Error(data.error || 'Server එකෙන් දෝෂයක් පැමිණියා.');
            }

            // 4. ප්‍රතිඵලය JSON එකක් බවට පත් කිරීම
            // (OpenRouter එකෙන් එන `data.generated_text` එක කියවීම)
            let text = data.generated_text.trim();

            if (text.startsWith("```json")) {
                text = text.substring(7, text.length - 3).trim();
            }
            if (text.startsWith("{") === false) {
                text = "{" + text.split("{")[1];
            }
            if (text.endsWith("}") === false) {
                text = text.split("}")[0] + "}";
            }

            const aiResponse = JSON.parse(text);

            // 5. ප්‍රතිඵල පෙන්වීම
            captionSinhala.innerText = aiResponse.sinhala;
            captionEnglish.innerText = aiResponse.english;
            hashtagsOutput.innerText = aiResponse.hashtags;

            // Loading නවතා ප්‍රතිඵල පෙන්වීම
            loadingSpinner.style.display = "none";
            resultsContainer.style.display = "block";
            generateImageBtn.style.display = "block"; 

        } catch (error) {
            console.error("Client-side Error:", error);
            alert(`AI සේවාව සමග සම්බන්ධ වීමේ දෝෂයක්: ${error.message}`);
            loadingSpinner.style.display = "none";
        } finally {
            generateBtn.disabled = false;
        }
    });

    // 6. "Generate Image" බොත්තම (අදියර 2)
    generateImageBtn.addEventListener("click", () => {
        alert("Image Generation (අදියර 2) තවම සූදානම් නැත. අපි ඊළඟට මෙය හදමු!");
    });

});
