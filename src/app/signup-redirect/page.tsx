import { Box, Typography } from "@mantine/core";

export default function ConfirmEmailPage() {
  return (
    <Box>
      <Typography variant="h4">Confirm your email</Typography>
      <Typography variant="body1">
        An email has been sent to your address. Please check your inbox and click the confirmation link to verify your email.
      </Typography>
    </Box>
  );
}