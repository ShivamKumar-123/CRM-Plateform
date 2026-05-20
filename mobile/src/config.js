import { Platform } from "react-native";

// IMPORTANT: pick the URL that matches where you're running the Expo app:
//   - iOS simulator        → http://localhost:8000
//   - Android emulator     → http://10.0.2.2:8000
//   - Physical phone (Expo Go) → http://<your-PC-LAN-IP>:8000
//     (find with `ipconfig`; e.g. http://192.168.1.5:8000)
//
// Override at runtime via app.json -> "extra": { "apiUrl": "..." } if you like.
import Constants from "expo-constants";

const extraApiUrl = Constants?.expoConfig?.extra?.apiUrl;

// CRM backend lives on port 8001 (8000 reserved for other Django projects).
const fallback =
  Platform.OS === "android" ? "http://10.0.2.2:8001" : "http://localhost:8001";

export const API_URL = extraApiUrl || fallback;
