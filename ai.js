// --- Firestore Logic සඳහා අවශ්‍ය Libraries Import කිරීම ---
import { db, auth } from "./firebase-config.js"; 

// [Image Proxy URL, Caption Proxy URL]
const IMAGE_PROXY_URL = '/api/generate-image';
const CAPTION_PROXY_URL = '/api/generate-caption';

// 🚨🚨 ඉතුරු ai.js කේතය මෙහිදී ඇතුළත් කළ යුතුය 🚨🚨
// ... (මම මීට පෙර දුන් ai.js කේතයේ ඉතිරි කොටස - Line 17 සිට අවසානය දක්වා) ...
