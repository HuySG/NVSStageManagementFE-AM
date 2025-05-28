import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBy2aruewGmoLCqLdjunl2qCcAmLYYPM5A",
  authDomain: "nvs-system.firebaseapp.com",
  projectId: "nvs-system",
  storageBucket: "nvs-system.firebasestorage.app",
  messagingSenderId: "118651694305",
  appId: "1:118651694305:web:b52a1cecb3e2b42af5dba0",
  measurementId: "G-116ZZ51XPY",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// ⚠️ messaging chỉ hoạt động ở môi trường trình duyệt
let messaging: Messaging | null = null;
if (typeof window !== "undefined") {
  messaging = getMessaging(app);
}

// Hàm lấy token FCM
const getFcmToken = async (): Promise<string | null> => {
  if (!messaging) return null;
  try {
    const token = await getToken(messaging, {
      vapidKey:
        "BAb25KLxXsFSTVaj5DkRMrkYGi9G67wRCXUkEtB2RsCxc0f3merD3zSTrs2YH4-FHpkcL5-6eMHh4UVnnKzxINs	", // thay bằng VAPID key từ Firebase Console
    });
    return token;
  } catch (error) {
    console.error("Lỗi lấy FCM token:", error);
    return null;
  }
};

//  Lắng nghe thông báo khi web đang mở
const listenToMessages = (callback: (payload: any) => void) => {
  if (messaging) {
    onMessage(messaging, callback);
  }
};

export { storage, getFcmToken, listenToMessages };
