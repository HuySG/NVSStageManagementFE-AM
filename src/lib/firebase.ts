import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseConfig";

export const uploadToFirebase = async (
  file: File,
  allocationId: string,
): Promise<string> => {
  const storageRef = ref(
    storage,
    `prepare-assets/${allocationId}/${Date.now()}-${file.name}`,
  );

  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
};
