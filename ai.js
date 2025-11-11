/* ---
   AI ව්‍යාපාරික සහයකයා - AI Logic (ai.js)
   *** Image First, Then Caption Orchestration, and Firestore Save Logic ***
--- */

// --- 1. අවශ්‍ය Libraries Import කිරීම ---
// 🚨🚨 firebase-config.js ගොනුවෙන් DB සහ Auth සේවාවන් Import කරනු ලැබේ
import { db, auth } from "./firebase-config.js"; 

// --- 2. ගෝලීය විචල්‍යයන් ---
const IMAGE_PROXY_URL = '/api/generate-image'; // Stability AI
const CAPTION_PROXY_URL = '/api/generate-caption'; // OpenRouter/GPT
// (ai.js ගොනුව auth.js ගොනුවට පෙර load වන නිසා, firebase.app() මෙහි නැත. ඒ නිසා අපි db සහ auth import කරමු.)


document.addEventListener("DOMContentLoaded", () => {
    
    // --- HTML Elements ---
    const generateBtn = document.getElementById("generate-btn");
    const savePostBtn = document.getElementById("save-post-btn"); // 💾 Save Button
    const ideaInput = document.getElementById("idea-input");
    const loadingSpinner = document.getElementById("loading-spinner");
    const resultsContainer = document.getElementById("results-container");
    const imageContainer = document.getElementById("post-image");
    
    const captionSinhala = document.getElementById("caption-sinhala");
    const captionEnglish = document.getElementById("caption-english");
    const hashtagsOutput = document.getElementById("hashtags-output");
    
    let currentImagePrompt = ""; // Image Prompt ගබඩා කිරීම

    if (!generateBtn) return; 
    if (savePostBtn) savePostBtn.style.display = "none"; 


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
        imageContainer.src = ""; 
        if (savePostBtn) savePostBtn.style.display = "none";
        
        currentImagePrompt = idea;

        try {
            // 1. IMAGE Proxy වෙත කතා කිරීම (Image First)
            const imgResponse = await fetch(IMAGE_PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea: idea }), 
            });

            const imgData = await imgResponse.json();

            if (!imgResponse.ok) {
                throw new Error(imgData.error || 'Image Server එකෙන් දෝෂයක් පැමිණියා.');
            }
            
            const base64Image = imgData.base64Image;
            imageContainer.src = `data:image/jpeg;base64,${base64Image}`; // Image එක පෙන්වීම

            // 2. CAPTION Proxy වෙත කතා කිරීම
            const capResponse = await fetch(CAPTION_PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: currentImagePrompt }), 
            });

            const capData = await capResponse.json();

            if (!capResponse.ok) {
                 throw new Error(capData.error || 'Caption Server එකෙන් දෝෂයක් පැමිණියා.');
            }

            // 3. JSON ප්‍රතිඵලය කියවීම සහ Clean කිරීම
            let rawText = capData.generated_text || "{}"; 
            
            try {
                const aiResponse = cleanAndParseJson(rawText);
                
                // 4. ප්‍රතිඵල පෙන්වීම
                captionEnglish.innerText = aiResponse.english;
                hashtagsOutput.innerText = aiResponse.hashtags;
                // සිංහල Unicode දෝෂය නිසා, එය ඉංග්‍රීසියෙන්ම සකස් කරමු
                captionSinhala.innerText = aiResponse.english; 

            } catch(e) {
                 // JSON failed නම්, error එක පෙන්වා raw text එක දමමු
                captionEnglish.innerText = rawText;
                captionSinhala.innerText = "Error: AI failed to output valid JSON. Please check raw output above.";
                hashtagsOutput.innerText = "Error: Check raw output";
            }

            loadingSpinner.style.display = "none";
            resultsContainer.style.display = "block";
            if (savePostBtn) savePostBtn.style.display = "block"; // 💾 Save Button පෙන්වීම

        } catch (error) {
            alert(`ව්‍යාපාරික සහයකයාගේ දෝෂයක්: ${error.message}`);
            loadingSpinner.style.display = "none";
        } finally {
            generateBtn.disabled = false;
        }
    });

    // --- B. FIRESTORE SAVE LOGIC ---
    if (savePostBtn) {
        savePostBtn.addEventListener("click", async () => {
            
            const user = auth.currentUser;
            const base64Image = imageContainer.src;
            
            // Image එකක් සාදා ඇති බවට තහවුරු කිරීම
            if (!user || base64Image.includes('data:image/jpeg;base64,') === false) {
                alert("Login වී නැත, නැතහොත් Image එකක් සාදා නැත.");
                return;
            }

            savePostBtn.disabled = true;
            savePostBtn.innerText = "Saving...";

            try {
                // Database එකට දත්ත යැවීම
                await db.collection('posts').add({
                    userId: user.uid,
                    base64Image: base64Image,
                    sinhalaCaption: captionSinhala.innerText,
                    englishCaption: captionEnglish.innerText,
                    hashtags: hashtagsOutput.innerText,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp() 
                });

                alert("Post එක සාර්ථකව Save කරන ලදී!");
                // Save වූ පසු, My Posts පිටුවට යොමු කරන්න
                window.location.href = "my-posts.html"; 

            } catch (error) {
                console.error("Error saving post: ", error);
                alert("Post එක Save කිරීමේ දෝෂයක්: " + error.message);
            } finally {
                savePostBtn.disabled = false;
                savePostBtn.innerText = "💾 Post එක Save කරන්න";
            }
        });
    }
});
