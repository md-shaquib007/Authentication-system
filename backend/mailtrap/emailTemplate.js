export const verificationEmailTemplate = (email, verificationToken) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
</head>

<body style="margin:0; padding:0; background-color:#f8f9fa; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:600px; background:#ffffff; border-radius:10px; box-shadow:0 6px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="padding:25px; text-align:center; background:#0d6efd; color:#ffffff; border-radius:10px 10px 0 0;">
              <h2 style="margin:0; font-size:22px;">Email Verification</h2>
              <p style="margin:8px 0 0; font-size:14px; opacity:0.9;">
                Confirm your email to activate your account
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:35px; color:#212529;">
              <p style="margin-top:0; font-size:16px;">
                Hello 👋,
              </p>

              <p style="font-size:15px; line-height:1.6;">
                Thanks for signing up! To complete your registration, please verify your email address.
              </p>

              <!-- Email -->
              <div style="margin:20px 0; font-size:14px;">
                <strong>Email:</strong>
                <span style="color:#0d6efd;">${email}</span>
              </div>

              <!-- Verification Code -->
              <div style="text-align:center; margin:30px 0;">
                <p style="margin-bottom:10px; font-size:14px; color:#6c757d;">
                  Your verification code
                </p>
                <div style="
                  display:inline-block;
                  padding:14px 28px;
                  font-size:20px;
                  letter-spacing:4px;
                  font-weight:bold;
                  color:#0d6efd;
                  background:#f1f5ff;
                  border:1px dashed #0d6efd;
                  border-radius:8px;">
                  ${verificationToken}
                </div>
              </div>

              <p style="font-size:14px; color:#6c757d; line-height:1.6;">
                This code is valid for a limited time.  
                If you didn’t create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px; text-align:center; background:#f1f3f5; color:#6c757d; border-radius:0 0 10px 10px;">
              <p style="margin:0; font-size:13px;">
                — The Team
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

export const passwordResetRequestTemplate = (email, resetUrl) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset Request</title>
</head>

<body style="margin:0; padding:0; background-color:#f8f9fa; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 15px;">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="padding:20px; text-align:center; background:#dc3545; color:#ffffff; border-radius:8px 8px 0 0;">
              <h2 style="margin:0;">Reset Your Password</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#212529;">
              <h3>Hello,</h3>

              <p style="font-size:15px; line-height:1.6;">
                We received a request to reset the password for your account
                <strong>${email}</strong>.
              </p>

              <p style="font-size:15px;">
                Click the button below to reset your password:
              </p>

              <!-- Reset Button -->
              <div style="text-align:center; margin:30px 0;">
                <a
                  href="${resetUrl}"
                  target="_blank"
                  style="
                    display:inline-block;
                    padding:14px 28px;
                    background:#dc3545;
                    color:#ffffff;
                    text-decoration:none;
                    font-size:16px;
                    border-radius:6px;
                    font-weight:bold;
                  "
                >
                  Reset Password
                </a>
              </div>

              <p style="font-size:14px; color:#6c757d;">
                This link will expire in <strong>10 minutes</strong>.
              </p>

              <p style="font-size:14px; color:#6c757d;">
                If you did not request this, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px; text-align:center; background:#f1f3f5; color:#6c757d; border-radius:0 0 8px 8px;">
              <p style="margin:0;">— The Team</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

export const passwordResetSuccessTemplate = (email) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset Successful</title>
</head>

<body style="margin:0; padding:0; background-color:#f8f9fa; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 15px;">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="padding:20px; text-align:center; background:#198754; color:#ffffff; border-radius:8px 8px 0 0;">
              <h2 style="margin:0;">Password Reset Successful</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#212529;">
              <h3>Hello,</h3>
              <p style="font-size:15px; line-height:1.6;">
                This is a confirmation that the password for your account
                <strong>${email}</strong> has been successfully changed.
              </p>

              <p style="font-size:15px;">
                If you made this change, no further action is required.
              </p>

              <p style="font-size:14px; color:#dc3545;">
                If you did NOT make this change, please reset your password immediately
                and contact our support team.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px; text-align:center; background:#f1f3f5; color:#6c757d; border-radius:0 0 8px 8px;">
              <p style="margin:0;">— The Team</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};
