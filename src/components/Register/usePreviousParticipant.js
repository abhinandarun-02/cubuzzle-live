import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import useDebounce from "../../hooks/useDebounce";
import { getUserProfile, isCompetitorIdAvailable } from "../../lib/firebase/firestore";
import { normalizeUserId } from "../../lib/registration";
import { COMPETITION_ID } from "./constants";

const MIN_USER_ID_LENGTH = 3;
const DEBOUNCE_MS = 500;

// Looks up whether `userId` belongs to a returning participant and whether
// it's still available to claim. Calls `onProfileLoaded` once when a match
// is found, and `onLookupReset` when the id changes and no photo is set.
function usePreviousParticipant({
  userId,
  enabled,
  hasLocalPhoto,
  onProfileLoaded,
  onLookupReset,
}) {
  const normalizedUserId = normalizeUserId(userId || "");
  const debouncedUserId = useDebounce(normalizedUserId, DEBOUNCE_MS);

  const lastAppliedProfileIdRef = useRef(null);
  const hasLocalPhotoRef = useRef(hasLocalPhoto);
  const onProfileLoadedRef = useRef(onProfileLoaded);
  const onLookupResetRef = useRef(onLookupReset);

  hasLocalPhotoRef.current = hasLocalPhoto;
  onProfileLoadedRef.current = onProfileLoaded;
  onLookupResetRef.current = onLookupReset;

  const isIdLongEnough = debouncedUserId.length >= MIN_USER_ID_LENGTH;

  const { data: isAvailable, isLoading: checkingAvailability } = useQuery({
    queryKey: ["competitor-id-availability", COMPETITION_ID, debouncedUserId],
    queryFn: () => isCompetitorIdAvailable(COMPETITION_ID, debouncedUserId),
    enabled: Boolean(enabled && isIdLongEnough),
    staleTime: 10_000,
  });

  const {
    data: previousProfile,
    isLoading: loadingProfile,
    isFetched: profileFetched,
  } = useQuery({
    queryKey: ["user-profile", debouncedUserId],
    queryFn: () => getUserProfile(debouncedUserId),
    enabled: Boolean(enabled && isIdLongEnough),
    staleTime: 60_000,
  });

  // Raw id changed: forget the last-applied profile and reset the caller.
  useEffect(() => {
    lastAppliedProfileIdRef.current = null;
    if (!hasLocalPhotoRef.current) {
      onLookupResetRef.current?.();
    }
  }, [normalizedUserId, enabled]);

  // Apply a matching profile once it resolves.
  useEffect(() => {
    if (!enabled || !previousProfile) return;
    if (previousProfile.id !== debouncedUserId) return;
    if (debouncedUserId !== normalizedUserId) return;
    if (lastAppliedProfileIdRef.current === previousProfile.id) return;

    lastAppliedProfileIdRef.current = previousProfile.id;
    onProfileLoadedRef.current?.(previousProfile);
  }, [previousProfile, enabled, debouncedUserId, normalizedUserId]);

  const previousIdMissing =
    enabled &&
    isIdLongEnough &&
    debouncedUserId === normalizedUserId &&
    profileFetched &&
    !loadingProfile &&
    !previousProfile;

  const status = getLookupStatus({ enabled, normalizedUserId, checkingAvailability, loadingProfile, previousIdMissing, isAvailable });

  return { status, profile: previousProfile };
}

/**
 * Derives the user-facing lookup status from the raw query/derived state.
 * Pulled out as a plain function so the branching is easy to scan (and easy
 * to unit test) without React in the loop.
 */
function getLookupStatus({
  enabled,
  normalizedUserId,
  checkingAvailability,
  loadingProfile,
  previousIdMissing,
  isAvailable,
}) {
  if (!enabled || normalizedUserId.length < MIN_USER_ID_LENGTH) return null;
  if (checkingAvailability || loadingProfile) return "checking";
  if (previousIdMissing) return "missing";
  return isAvailable ? "available" : "taken";
}

export default usePreviousParticipant;