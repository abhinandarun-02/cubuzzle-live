import {
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import { format, isValid, subYears } from "date-fns";
import {
  GENDERS,
  getCategoryFromDob,
  getCategoryLabel,
  parseDob,
} from "../../lib/registration";
import ChoiceGroup from "./ChoiceGroup";
import CountrySelect from "./CountrySelect";
import PhotoUpload from "./PhotoUpload";
import SchoolSelect from "./SchoolSelect";
import TextInput from "./TextInput";
import { styles } from "./styles";

function getDobHelperText(dob) {
  const category = getCategoryFromDob(dob);
  if (!category) {
    return "Age category is determined from date of birth";
  }
  return `Category : ${getCategoryLabel(category)}`;
}

function UserIdStatusAdornment({ status }) {
  if (!status) return null;

  return (
    <InputAdornment position="end">
      {status === "checking" && <CircularProgress size={20} />}
      {status === "available" && (
        <CheckCircleIcon color="success" fontSize="small" />
      )}
      {(status === "taken" || status === "missing") && (
        <ErrorIcon color="error" fontSize="small" />
      )}
    </InputAdornment>
  );
}

function CompetitorDetails({ form, userIdStatus }) {
  const {
    values,
    errors,
    fieldProps,
    photoPreview,
    photoFile,
    existingImageUrl,
    setPhoto,
    removePhoto,
  } = form;

  const dobField = fieldProps("dob");

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card sx={styles.card}>
        <CardContent>
          <Typography variant="h6" sx={styles.sectionTitle}>
            Competitor Details
          </Typography>

          <PhotoUpload
            preview={photoPreview}
            hasFile={Boolean(photoFile || existingImageUrl)}
            error={errors.photo}
            onChange={setPhoto}
            onRemove={removePhoto}
          />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ChoiceGroup
                label="Are you a previous Cubuzzle participant?"
                options={[
                  { value: true, label: "Yes" },
                  { value: false, label: "No" },
                ]}
                columns="repeat(2, minmax(0, 200px))"
                cardSx={{ justifyContent: "center", minHeight: 44 }}
                {...fieldProps("isPreviousParticipant")}
              />
            </Grid>

            {values.isPreviousParticipant === true && (
              <Grid item xs={12}>
                <TextInput
                  label="Cubuzzle ID"
                  icon={HowToRegOutlinedIcon}
                  {...fieldProps("userId")}
                  error={Boolean(errors.userId) || userIdStatus === "missing"}
                  helperText={
                    errors.userId ||
                    (userIdStatus === "missing"
                      ? "No previous Cubuzzle profile found for this ID"
                      : "Use the same Cubuzzle ID from previous seasons")
                  }
                  endAdornment={<UserIdStatusAdornment status={userIdStatus} />}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider sx={{ mb: -1 }}>
                <Typography sx={styles.sectionCaption}>
                  Personal Information
                </Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextInput
                label="Name"
                icon={PersonOutlineIcon}
                {...fieldProps("name")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextInput
                label="Email"
                type="email"
                icon={EmailOutlinedIcon}
                {...fieldProps("email")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextInput
                label="Phone Number"
                icon={LocalPhoneOutlinedIcon}
                {...fieldProps("phoneNo")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SchoolSelect label="School" {...fieldProps("school")} />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Date of Birth"
                format="dd/MM/yyyy"
                value={parseDob(values.dob)}
                onChange={(date) =>
                  dobField.onChange(
                    date && isValid(date) ? format(date, "yyyy-MM-dd") : "",
                  )
                }
                disableFuture
                minDate={subYears(new Date(), 100)}
                openTo="year"
                views={["year", "month", "day"]}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: Boolean(errors.dob),
                    helperText: errors.dob || getDobHelperText(values.dob),
                    onBlur: dobField.onBlur,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <ChoiceGroup
                label="Gender"
                options={GENDERS}
                columns={{ xs: 1, sm: 3 }}
                cardSx={{ justifyContent: "center", minHeight: 44 }}
                {...fieldProps("gender")}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ mb: -1 }}>
                <Typography sx={styles.sectionCaption}>
                  Registration Details
                </Typography>
              </Divider>
            </Grid>

            <Grid item xs={12}>
              <TextInput
                label="Order ID"
                icon={ConfirmationNumberOutlinedIcon}
                {...fieldProps("orderId")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CountrySelect label="Country" {...fieldProps("country")} />
            </Grid>

            <Grid item xs={12} md={6}>
              <CountrySelect
                label="Nationality"
                {...fieldProps("nationality")}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}

export default CompetitorDetails;
