export async function sendVerificationOtp(email, otp) {
  const {
    BREVO_API_KEY,
    BREVO_SENDER_EMAIL,
    BREVO_SENDER_NAME,
  } = process.env

  if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
    throw new Error('Brevo email configuration is missing')
  }

  const response = await fetch(
    'https://api.brevo.com/v3/smtp/email',
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: BREVO_SENDER_NAME || 'Findit',
          email: BREVO_SENDER_EMAIL,
        },
        to: [{ email }],
        subject: 'Your Findit verification code',
        textContent:
          `Your Findit verification code is ${otp}. ` +
          'It expires in 10 minutes. If you did not request ' +
          'this code, you can ignore this email.',
      }),
    }
  )

  if (!response.ok) {
    // Do not log credentials or the OTP.
    console.error('Brevo email request failed:', response.status)
    throw new Error('Could not send verification email')
  }
}