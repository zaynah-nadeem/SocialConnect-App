import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage, isFirebaseConfigured } from '../config/firebase';

function guessContentType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

export async function uploadImage(
  localUri: string,
  storagePath: string,
): Promise<string> {
  if (!localUri) {
    throw new Error('No image selected');
  }

  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    return localUri;
  }

  if (isFirebaseConfigured()) {
    const storage = getFirebaseStorage()!;
    const response = await fetch(localUri);
    const blob = await response.blob();
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, blob, {
      contentType: guessContentType(localUri),
    });
    return getDownloadURL(storageRef);
  }

  return localUri;
}
