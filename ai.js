/* ---
   AI ව්‍යාපාරික සහයකයා - AI Logic (ai.js)
   *** Final Fix: V9/V10 Firestore Save Logic (collection, addDoc) භාවිතයට මාරු කරන ලදී ***
--- */

// --- 1. අවශ්‍ය Libraries Import කිරීම ---
// 🚨🚨 db සහ auth යන service instances import කරයි
import { db, auth } from "./firebase-config.js"; 
// ⬇️ *** V9/V10 සඳහා අවශ්‍ය Functions *** ⬇️
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- 2. Global Variables ---
const IMAGE_PROXY_URL = '/api/generate-image';
const CAPTION_PROXY_URL = '/api/generate-caption';

document.addEventListener("DOMContentLoaded", () => {
    
    // --- HTML Elements ---
    const generateBtn = document.getElementById("generate-btn");
    const savePostBtn = document.getElementById("save-post-btn"); 
    const ideaInput = document.getElementById("idea-input");
    const loadingSpinner = document.getElementById("loading-spinner");
    const resultsContainer = document.getElementById("results-container");
    const imageContainer = document.getElementById("post-image");
    
    const captionSinhala = document.getElementById("caption-sinhala");
    const captionEnglish = document.getElementById("caption-english");
    const hashtagsOutput = document.getElementById("hashtags-output");
    
    let currentImagePrompt = ""; 

    if (!generateBtn) return; 
    if (savePostBtn) savePostBtn.style.display = "none"; 


    // --- FUNCTION: JSON Cleanup (Final Polish) ---
    function cleanAndParseJson(text) {
        let cleanedText = text.trim();
        if (cleanedText.startsWith("```json")) {
            cleanedText = cleanedText.substring(7, cleanedText.length - 3).trim();
        }
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
        // ... (Generating and Capturing data logic remains the same) ...

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
            if (!imgResponse.ok) { throw new Error(imgData.error || 'Image Server එකෙන් දෝෂයක් පැමිණියා.'); }
            const base64Image = imgData.base64Image;
            imageContainer.src = `data:image/jpeg;base64,${base64Image}`; 

            // 2. CAPTION Proxy වෙත කතා කිරීම
            const capResponse = await fetch(CAPTION_PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: currentImagePrompt }), 
            });
            const capData = await capResponse.json();
            if (!capResponse.ok) { throw new Error(capData.error || 'Caption Server එකෙන් දෝෂයක් පැමිණියා.'); }

            // 3. JSON ප්‍රතිඵලය කියවීම සහ Clean කිරීම
            let rawText = capData.generated_text || "{}"; 
            try {
                const aiResponse = cleanAndParseJson(rawText);
                captionEnglish.innerText = aiResponse.english;
                hashtagsOutput.innerText = aiResponse.hashtags;
                captionSinhala.innerText = aiResponse.english; // සිංහල Unicode දෝෂය නිසා, එය ඉංග්‍රීසියෙන්ම සකස් කරමු

            } catch(e) {
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
            
            if (!user || base64Image.includes('data:image/jpeg;base64,') === false) {
                alert("Login වී නැත, නැතහොත් Image එකක් සාදා නැත.");
                return;
            }

            savePostBtn.disabled = true;
            savePostBtn.innerText = "Saving...";

            try {
                // ⬇️ *** db.collection වෙනුවට V9/V10 functions භාවිත කිරීම *** ⬇️
                await addDoc(collection(db, 'posts'), {
                    userId: user.uid,
                    base64Image: base64Image,
                    sinhalaCaption: captionSinhala.innerText,
                    englishCaption: captionEnglish.innerText,
                    hashtags: hashtagsOutput.innerText,
                    timestamp: serverTimestamp() // Firestore Server Timestamp භාවිත කිරීම
                });

                alert("Post එක සාර්ථකව Save කරන ලදී!");
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
