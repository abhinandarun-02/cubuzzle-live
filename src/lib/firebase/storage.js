import { deleteObject, ref, uploadBytes } from "firebase/storage";
import { httpsCallable } from "firebase/functions";

import { functions, storage } from "./firebase";

const extensionByType = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const TEMP_PATH_PATTERN =
  /^temp\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/i;

const isTempImagePath = (path) => typeof path === "string" && TEMP_PATH_PATTERN.test(path);

export const uploadTempImage = async (file) => {
  try {
    const extension = extensionByType[file.type] ?? "jpg";
    const path = `temp/${crypto.randomUUID()}.${extension}`;
    const imageRef = ref(storage, path);
    await uploadBytes(imageRef, file, { contentType: file.type });
    return { path, contentType: file.type };
  } catch (error) {
    console.error("Error uploading temp image: ", error);
    throw error;
  }
};

export const deleteTempImage = async (path) => {
  if (!isTempImagePath(path)) return;

  try {
    await deleteObject(ref(storage, path));
  } catch (error) {
    if (error.code === "storage/object-not-found") return;
    console.error("Error deleting temp image: ", error);
  }
};

export const copyTempImageToUser = async ({ competitionId, userId }) => {
  const copyTempImage = httpsCallable(functions, "copyTempImageToUser");
  const { data } = await copyTempImage({ competitionId, userId });
  return data.imageUrl;
};
