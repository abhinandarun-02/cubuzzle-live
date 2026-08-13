import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { storage } from "./firebase";

const extensionByType = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const uploadCompetitorImage = async (
  competitionId,
  competitorId,
  file,
) => {
  try {
    const extension = extensionByType[file.type] ?? "jpg";
    const imageRef = ref(
      storage,
      `competitions/${competitionId}/competitors/${competitorId}.${extension}`,
    );
    await uploadBytes(imageRef, file, { contentType: file.type });
    return getDownloadURL(imageRef);
  } catch (error) {
    console.error("Error uploading competitor image: ", error);
    throw error;
  }
};
