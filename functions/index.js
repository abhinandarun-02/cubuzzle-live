const { randomUUID } = require("crypto");
const { initializeApp } = require("firebase-admin/app");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const { setGlobalOptions } = require("firebase-functions/v2");
const { HttpsError, onCall } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

initializeApp();

setGlobalOptions({ maxInstances: 10, region: "asia-south1" });

const TEMP_PATH_PATTERN = /^temp\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/i;
const USER_ID_PATTERN = /^\d{2}(0[1-9]|1[0-2])\d{3,}[A-Z]{2}$/;
const COMPETITION_ID_PATTERN = /^[a-z0-9-]+$/;

exports.copyTempImageToUser = onCall(
  { cors: true, invoker: "public" },
  async (request) => {
    const competitionId = request.data?.competitionId;
    const userId = request.data?.userId;

    if (
      typeof competitionId !== "string" ||
      !COMPETITION_ID_PATTERN.test(competitionId)
    ) {
      throw new HttpsError("invalid-argument", "Invalid competition ID.");
    }

    if (typeof userId !== "string" || !USER_ID_PATTERN.test(userId)) {
      throw new HttpsError("invalid-argument", "Invalid user ID.");
    }

    const db = getFirestore();
    const competitorRef = db.doc(
      `competitions/${competitionId}/competitors/${userId}`,
    );
    const competitorSnap = await competitorRef.get();

    if (!competitorSnap.exists) {
      throw new HttpsError(
        "failed-precondition",
        "Competitor registration was not found.",
      );
    }

    const competitor = competitorSnap.data() || {};
    const tempImagePath = competitor.tempImagePath;

    if (!tempImagePath) {
      return { imageUrl: competitor.imageUrl || null };
    }

    if (!TEMP_PATH_PATTERN.test(tempImagePath)) {
      throw new HttpsError("invalid-argument", "Invalid temp image path.");
    }

    const extension = tempImagePath.split(".").pop().toLowerCase();
    const destPath = `users/${userId}.${extension}`;
    const bucket = getStorage().bucket();
    const sourceFile = bucket.file(tempImagePath);
    const destFile = bucket.file(destPath);

    const [sourceExists] = await sourceFile.exists();
    if (!sourceExists) {
      throw new HttpsError("not-found", "Temp image was not found.");
    }

    const [sourceMetadata] = await sourceFile.getMetadata();
    const contentType = sourceMetadata.contentType || contentTypeFromExt(extension);
    const token = randomUUID();

    await sourceFile.copy(destFile);
    await destFile.setMetadata({
      contentType,
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    });

    const imageUrl =
      `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/` +
      `${encodeURIComponent(destPath)}?alt=media&token=${token}`;

    const userRef = db.doc(`users/${userId}`);
    const userSnap = await userRef.get();

    const writes = [
      competitorRef.update({
        imageUrl,
        tempImagePath: FieldValue.delete(),
      }),
    ];

    if (userSnap.exists) {
      writes.push(userRef.update({ imageUrl }));
    }

    await Promise.all(writes);

    try {
      await sourceFile.delete();
    } catch (error) {
      logger.warn("Failed to delete temp image after copy", {
        tempImagePath,
        error: error.message,
      });
    }

    logger.info("Copied temp image to user path", { userId, destPath });
    return { imageUrl };
  },
);

function contentTypeFromExt(extension) {
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  return "image/jpeg";
}
