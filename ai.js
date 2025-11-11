/* ---
   AI ව්‍යාපාරික සහයකයා - AI Logic (ai.js)
   *** OpenRouter.ai Proxy (Text + Image) එකට කතා කිරීමට යාවත්කාලීන කරන ලදී ***
--- */

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. HTML Elements අල්ලා ගැනීම
    const generateBtn = document.getElementById("generate-btn");
    const generateImageBtn = document.getElementById("generate-image-btn");
    const ideaInput = document.getElementById("idea-input");
    
    const loadingSpinner = document.getElementById("loading-spinner");
    const resultsContainer = document.getElementById("results-container");
    const imageContainer = document.getElementById("post-image");
    
    // Output boxes
    const captionSinhala = document.getElementById("caption-sinhala");
    const captionEnglish = document.getElementById("caption-english");
    
    // ගෝලීය වශයෙන් දත්ත ගබඩා කිරීම
    let currentEnglishCaption = ""; 

    if (!generateBtn) return; 

    // --- A. TEXT Generation Logic (Phase 1) ---
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

        try {
            // 1. Text Proxy වෙත කතා කිරීම
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea: idea }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Server එකෙන් දෝෂයක් පැමිණියා.');
            }

            // 2. JSON ප්‍රතිඵලය කියවීම (Text Proxy එකේ code එකට ගැලපෙන ලෙස)
            let text = data.generated_text.trim();
            // JSON string එක clean කිරීම (AI එකේ output වලට අනුව)
            try {
                if (text.startsWith("```json")) {
                    text = text.substring(7, text.length - 3).trim();
                }
                const aiResponse = JSON.parse(text);
                
                // 3. ප්‍රතිඵල පෙන්වීම
                captionSinhala.innerText = aiResponse.sinhala;
                captionEnglish.innerText = aiResponse.english;
                document.getElementById("hashtags-output").innerText = aiResponse.hashtags;
                
                // 4. Image Generation සඳහා Caption එක save කිරීම
                currentEnglishCaption = aiResponse.english; 

                // Loading නවතා ප්‍රතිඵල පෙන්වීම
                loadingSpinner.style.display = "none";
                resultsContainer.style.display = "block";
                generateImageBtn.style.display = "block"; // Image Button පෙන්වීම

            } catch(e) {
                 // AI එක JSON format එකෙන් නුදුන්නොත්, අපි මුළු text එකම English caption එකේ දමමු
                captionEnglish.innerText = text;
                captionSinhala.innerText = "Error: AI failed to output valid JSON. Showing raw text instead.";
                currentEnglishCaption = text;
                loadingSpinner.style.display = "none";
                resultsContainer.style.display = "block";
                generateImageBtn.style.display = "block";
            }

        } catch (error) {
            console.error("Client-side Error:", error);
            alert(`AI සේවාව සමග සම්බන්ධ වීමේ දෝෂයක්: ${error.message}`);
            loadingSpinner.style.display = "none";
        } finally {
            generateBtn.disabled = false;
        }
    });

    // --- B. IMAGE Generation Logic (Phase 2) ---
    generateImageBtn.addEventListener("click", async () => {
        
        if (!currentEnglishCaption) {
            alert("කරුණාකර මුලින්ම Captions නිර්මාණය කරන්න.");
            return;
        }

        // UI එක සූදානම් කිරීම
        generateImageBtn.disabled = true;
        imageContainer.style.opacity = 0.5; // Image එක අඳුරු කිරීම
        
        try {
            // 1. Image Proxy වෙත කතා කිරීම
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Image Prompt සඳහා English Caption යැවීම
                body: JSON.stringify({ caption: currentEnglishCaption, idea: ideaInput.value }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Vercel server එකෙන් ආ දෝෂයක්
                throw new Error(data.error || 'Image Server එකෙන් දෝෂයක් පැමිණියා.');
            }
            
            // 2. Base64 Image Data ලබාගැනීම
            const base64Image = data.base64Image;

            // 3. Image එක Browser එකේ පෙන්වීම (Data URI භාවිතයෙන්)
            imageContainer.src = `data:image/jpeg;base64,${base64Image}`;
            imageContainer.style.opacity = 1.0; 

        } catch (error) {
            console.error("Client-side Image Error:", error);
            alert(`චිත්‍රය නිර්මාණය කිරීමේ දෝෂයක්: ${error.message}`);
        } finally {
            generateImageBtn.disabled = false;
        }
    });

});
