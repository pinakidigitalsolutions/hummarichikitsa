import twilio from 'twilio'

const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendOTP(userid,otp) {
    try {
    const message = await client.messages.create({
      body: `Your verification code is ${otp}. It is valid for 5 minutes. Never share this code with anyone.`,
      to: '+'+91+userid,
    });
    return otp;
  } catch (error) {
    console.error("Failed to send OTP:", error.message);
    return null;
  }
}

