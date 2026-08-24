import {
  Avatar,
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";
import { styles as sharedStyles } from "./styles";

const styles = {
  photoUpload: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 1.25,
    mb: 3.5,
  },
  photoDropzone: {
    position: "relative",
    width: 128,
    height: 128,
    borderRadius: "50%",
    cursor: "pointer",
    "&:hover .photo-overlay": {
      opacity: 1,
    },
  },
  photoOverlay: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 0.5,
    color: "#fff",
    bgcolor: "rgba(0,0,0,0.55)",
    opacity: 0,
    transition: "opacity 0.15s",
    pointerEvents: "none",
  },
  photoRemoveBtn: {
    position: "absolute",
    top: -4,
    right: -4,
    bgcolor: "background.paper",
    boxShadow: 1,
    "&:hover": {
      bgcolor: "error.main",
      color: "#fff",
    },
  },
};

function PhotoUpload({ preview, hasFile, error, onChange, onRemove }) {
  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const handleRemove = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onRemove();
  };

  return (
    <FormControl required error={Boolean(error)} sx={styles.photoUpload}>
      <FormLabel sx={sharedStyles.fieldLabel}>Photo</FormLabel>
      <Box component="label" sx={styles.photoDropzone}>
        <Avatar
          src={preview}
          sx={{
            width: 128,
            height: 128,
            borderWidth: 3,
            borderStyle: error || preview ? "solid" : "dashed",
            borderColor: error ? "error.main" : "divider",
          }}
        >
          <PhotoCameraIcon sx={{ fontSize: 40, color: "text.disabled" }} />
        </Avatar>
        <Box className="photo-overlay" sx={styles.photoOverlay}>
          <PhotoCameraIcon fontSize="small" />
          <Typography variant="caption" fontWeight={600}>
            {hasFile ? "Change" : "Upload"}
          </Typography>
        </Box>
        {(hasFile || preview) && (
          <Tooltip title="Remove photo">
            <IconButton
              size="small"
              sx={styles.photoRemoveBtn}
              onClick={handleRemove}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <input
          type="file"
          hidden
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
        />
      </Box>
      <Typography variant="caption" color="text.secondary">
        JPEG, PNG or WebP, up to 5&nbsp;MB
      </Typography>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}

export default PhotoUpload;
