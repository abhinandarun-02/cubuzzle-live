import { useState } from "react";
import { useSnackbar } from "notistack";
import { normalizeUserId, resolveCountry, validateImageFile, validateRegistration} from "../../lib/registration";
import { INITIAL_VALUES } from "./constants";

function useRegistrationForm() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const { enqueueSnackbar } = useSnackbar();

  const setField = (field, value) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "userId") {
        next.userId = normalizeUserId(value);
      }

      if (field === "isPreviousParticipant" && value !== true) {
        next.userId = "";
      }

      return next;
    });

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
    const validationErrors = validateRegistration(values);
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

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrors((prev) => {
      if (!prev.photo) return prev;
      const next = { ...prev };
      delete next.photo;
      return next;
    });
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setExistingImageUrl(null);
    setErrors((prev) => ({ ...prev, photo: "Photo is required" }));
  };

  const clearExistingPhoto = () => {
    setExistingImageUrl(null);
    setPhotoPreview(null);
  };

  const applyProfile = (profile) => {
    setValues((prev) => ({
      ...prev,
      name: profile.name ?? prev.name,
      gender: profile.gender
        ? String(profile.gender).toLowerCase()
        : prev.gender,
      country: resolveCountry(profile.country) ?? prev.country,
      nationality:
        resolveCountry(profile.nationality) ??
        resolveCountry(profile.country) ??
        prev.nationality,
    }));

    if (!photoFile && profile.imageUrl) {
      setExistingImageUrl(profile.imageUrl);
      setPhotoPreview(profile.imageUrl);
    }
  };

  const validate = () => {
    const validationErrors = validateRegistration(values);
    if (!photoFile && !existingImageUrl) {
      validationErrors.photo = "Photo is required";
    }
    setErrors(validationErrors);
    return validationErrors;
  };

  const reset = () => {
    setValues(INITIAL_VALUES);
    setPhotoFile(null);
    setPhotoPreview(null);
    setExistingImageUrl(null);
    setErrors({});
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
    fieldProps,
    setPhoto,
    removePhoto,
    clearExistingPhoto,
    applyProfile,
    validate,
    reset,
    setError,
  };
}

export default useRegistrationForm;
