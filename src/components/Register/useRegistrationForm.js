import { useRef, useState } from "react";
import { useSnackbar } from "notistack";
import {
  RETURNING_HIDDEN_FIELDS,
  normalizeUserId,
  resolveCountry,
  validateImageFile,
  validateRegistration,
} from "../../lib/registration";
import { deleteTempImage, uploadTempImage } from "../../lib/firebase/storage";
import { INITIAL_VALUES } from "./constants";

function useRegistrationForm() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [tempImagePath, setTempImagePath] = useState(null);
  const [photoUploadStatus, setPhotoUploadStatus] = useState("idle");
  const [errors, setErrors] = useState({});
  // Which of RETURNING_HIDDEN_FIELDS the matched profile actually supplied a
  // value for. `null` means no profile has resolved yet (still hide
  // everything); once a profile applies, only the fields it actually
  // supplied stay hidden, so a sparse profile reveals what's missing instead
  // of silently submitting it blank.
  const [profileSuppliedFields, setProfileSuppliedFields] = useState(null);
  // Whether a previous 3x3 division was derived for the current returning
  // participant, set externally by Register.jsx once the lookup resolves.
  const [skipDivision, setSkipDivision] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const uploadGenerationRef = useRef(0);
  const tempImagePathRef = useRef(null);
  const previewUrlRef = useRef(null);
  const hasLocalUploadRef = useRef(false);

  const hiddenFields =
    values.isPreviousParticipant === true
      ? profileSuppliedFields === null
        ? RETURNING_HIDDEN_FIELDS
        : RETURNING_HIDDEN_FIELDS.filter((field) => profileSuppliedFields.has(field))
      : [];

  const revokePreview = () => {
    if (previewUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = null;
  };

  const discardTempPath = (path) => {
    if (path) {
      deleteTempImage(path);
    }
  };

  const clearLocalPhoto = () => {
    uploadGenerationRef.current += 1;
    discardTempPath(tempImagePathRef.current);
    tempImagePathRef.current = null;
    hasLocalUploadRef.current = false;
    setTempImagePath(null);
    setPhotoFile(null);
    setPhotoUploadStatus("idle");
    revokePreview();
    setPhotoPreview(null);
  };

  const setField = (field, value) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "userId") {
        next.userId = normalizeUserId(value);
      }

      if (field === "isPreviousParticipant" && value !== true) {
        next.userId = "";

        // Switching away from "previous participant" after a profile was
        // applied should not leave someone else's identity behind.
        if (profileSuppliedFields !== null) {
          next.name = INITIAL_VALUES.name;
          next.email = INITIAL_VALUES.email;
          next.phoneNo = INITIAL_VALUES.phoneNo;
          next.gender = INITIAL_VALUES.gender;
          next.country = INITIAL_VALUES.country;
          next.nationality = INITIAL_VALUES.nationality;
        }
      }

      return next;
    });

    if (field === "isPreviousParticipant" && value !== true && profileSuppliedFields !== null) {
      setProfileSuppliedFields(null);
      setSkipDivision(false);
      if (!hasLocalUploadRef.current) {
        setExistingImageUrl(null);
        setPhotoPreview(null);
      }
    }

    setErrors((prev) => {
      if (!prev[field] && !(field === "isPreviousParticipant" && prev.userId)) {
        return prev;
      }

      const next = { ...prev };
      delete next[field];
      if (field === "isPreviousParticipant") {
        delete next.userId;
      }
      return next;
    });
  };

  const handleBlur = (field) => {
    const validationErrors = validateRegistration(values, { hiddenFields, skipDivision });
    if (validationErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validationErrors[field] }));
    }
  };

  const fieldProps = (name) => ({
    value: values[name],
    onChange: (value) => setField(name, value),
    onBlur: () => handleBlur(name),
    error: errors[name],
    helperText: errors[name],
  });

  const setPhoto = (file) => {
    const error = validateImageFile(file);
    if (error) {
      enqueueSnackbar(error, { variant: "error" });
      return;
    }

    const generation = ++uploadGenerationRef.current;
    const previousPath = tempImagePathRef.current;
    tempImagePathRef.current = null;
    hasLocalUploadRef.current = true;

    revokePreview();
    const preview = URL.createObjectURL(file);
    previewUrlRef.current = preview;

    setPhotoFile(file);
    setPhotoPreview(preview);
    setExistingImageUrl(null);
    setTempImagePath(null);
    setPhotoUploadStatus("uploading");
    setErrors((prev) => {
      if (!prev.photo) return prev;
      const next = { ...prev };
      delete next.photo;
      return next;
    });

    discardTempPath(previousPath);

    uploadTempImage(file)
      .then(({ path }) => {
        if (generation !== uploadGenerationRef.current) {
          discardTempPath(path);
          return;
        }
        tempImagePathRef.current = path;
        setTempImagePath(path);
        setPhotoUploadStatus("ready");
      })
      .catch((uploadError) => {
        if (generation !== uploadGenerationRef.current) return;
        console.error("Error uploading temp image: ", uploadError);
        tempImagePathRef.current = null;
        setTempImagePath(null);
        setPhotoUploadStatus("error");
        enqueueSnackbar("Photo upload failed. Please try again.", { variant: "error" });
      });
  };

  const removePhoto = () => {
    clearLocalPhoto();
    setExistingImageUrl(null);
    setErrors((prev) => ({ ...prev, photo: "Photo is required" }));
  };

  // Called when the Cubuzzle ID changes and no matching profile is (yet)
  // applied: clears any previously-loaded profile photo and hidden-field
  // bookkeeping so stale data from a different ID doesn't linger, and the
  // hidden-fields default back to "hide everything until resolved".
  const clearExistingPhoto = () => {
    if (hasLocalUploadRef.current) return;
    setExistingImageUrl(null);
    setPhotoPreview(null);
    setProfileSuppliedFields(null);
    setSkipDivision(false);
  };

  const applyProfile = (profile) => {
    const supplied = new Set();

    setValues((prev) => {
      const next = { ...prev };

      if (profile.name) {
        next.name = profile.name;
        supplied.add("name");
      }
      if (profile.email) {
        next.email = profile.email;
        supplied.add("email");
      }
      if (profile.phoneNo) {
        next.phoneNo = profile.phoneNo;
        supplied.add("phoneNo");
      }
      if (profile.gender) {
        next.gender = String(profile.gender).toLowerCase();
        supplied.add("gender");
      }

      next.country = resolveCountry(profile.country) ?? prev.country;
      next.nationality =
        resolveCountry(profile.nationality) ??
        resolveCountry(profile.country) ??
        prev.nationality;

      return next;
    });

    setProfileSuppliedFields(supplied);

    if (!hasLocalUploadRef.current && profile.imageUrl) {
      setExistingImageUrl(profile.imageUrl);
      setPhotoPreview(profile.imageUrl);
    }
  };

  const validate = () => {
    const validationErrors = validateRegistration(values, { hiddenFields, skipDivision });
    if (photoUploadStatus === "uploading") {
      validationErrors.photo = "Photo is still uploading";
    } else if (photoUploadStatus === "error") {
      validationErrors.photo = "Photo upload failed. Please choose the file again.";
    } else if (!tempImagePath && !existingImageUrl) {
      validationErrors.photo = "Photo is required";
    }
    setErrors(validationErrors);
    return validationErrors;
  };

  const reset = () => {
    clearLocalPhoto();
    setValues(INITIAL_VALUES);
    setExistingImageUrl(null);
    setErrors({});
    setProfileSuppliedFields(null);
    setSkipDivision(false);
  };

  const setError = (field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  return {
    values,
    errors,
    photoFile,
    photoPreview,
    existingImageUrl,
    tempImagePath,
    photoUploadStatus,
    hiddenFields,
    skipDivision,
    setSkipDivision,
    fieldProps,
    setPhoto,
    removePhoto,
    clearExistingPhoto,
    applyProfile,
    validate,
    reset,
    setError,
    setField,
  };
}

export default useRegistrationForm;
