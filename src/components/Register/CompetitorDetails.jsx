import { Box, Divider, Grid, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import { format, isValid, subYears } from "date-fns";
import {
  GENDERS,
  getCategoryFromDob,
  getCategoryLabel,
  parseDob,
} from "../../lib/registration";
import ChoiceGroup from "./ChoiceGroup";
import CountrySelect from "./CountrySelect";
import FormSection from "./FormSection";
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

function CompetitorDetails({ form, hiddenFields = [], step = 2 }) {
  const {
    values,
    errors,
    fieldProps,
    photoPreview,
    photoFile,
    existingImageUrl,
    photoUploadStatus,
    setPhoto,
    removePhoto,
  } = form;

  const dobField = fieldProps("dob");
  const isHidden = (field) => hiddenFields.includes(field);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <FormSection
        id="section-details"
        step={step}
        title="Your Details"
        description="A clear photo and the details we need for check-in, ranking, and your Cubuzzle ID."
      >
        <PhotoUpload
          preview={photoPreview}
          hasFile={Boolean(photoFile || existingImageUrl)}
          error={errors.photo}
          uploading={photoUploadStatus === "uploading"}
          onChange={setPhoto}
          onRemove={removePhoto}
        />

        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Divider sx={{ mb: -0.5 }}>
              <Typography sx={styles.sectionCaption}>
                Personal information
              </Typography>
            </Divider>
          </Grid>

          {!isHidden("name") && (
            <Grid item xs={12} md={6}>
              <TextInput
                label="Name"
                icon={PersonOutlineIcon}
                autoComplete="name"
                {...fieldProps("name")}
              />
            </Grid>
          )}

          {!isHidden("email") && (
            <Grid item xs={12} md={6}>
              <TextInput
                label="Email"
                type="email"
                icon={EmailOutlinedIcon}
                autoComplete="email"
                {...fieldProps("email")}
              />
            </Grid>
          )}

          {!isHidden("phoneNo") && (
            <Grid item xs={12} md={6}>
              <TextInput
                label="Phone Number"
                type="tel"
                icon={LocalPhoneOutlinedIcon}
                autoComplete="tel"
                {...fieldProps("phoneNo")}
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <SchoolSelect label="School" {...fieldProps("school")} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box data-field="dob">
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
            </Box>
          </Grid>

          {!isHidden("gender") && (
            <Grid item xs={12} md={6}>
              <ChoiceGroup
                label="Gender"
                options={GENDERS}
                columns={{ xs: 1, sm: 3 }}
                cardSx={{ justifyContent: "center", minHeight: 48 }}
                {...fieldProps("gender")}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ mb: -0.5, mt: 0.5 }}>
              <Typography sx={styles.sectionCaption}>
                Registration details
              </Typography>
            </Divider>
          </Grid>

          <Grid item xs={12}>
            <TextInput
              label="Order ID"
              icon={ConfirmationNumberOutlinedIcon}
              autoComplete="off"
              spellCheck={false}
              placeholder="CBZL…"
              {...fieldProps("orderId")}
              helperText={
                errors.orderId || "Cubuzzle Order ID (starting with CBZL**)"
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <CountrySelect
              label="Country of Residence"
              {...fieldProps("country")}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <CountrySelect label="Nationality" {...fieldProps("nationality")} />
          </Grid>
        </Grid>
      </FormSection>
    </LocalizationProvider>
  );
}

export default CompetitorDetails;
