import { connect } from "@/dbConfig/dbConfig";
import Otp from "@/models/otp";
import User from "@/models/user";
import Helper from "@/services/helper";
import { sendEmail } from "@/services/mailer";
import Joi from "joi";
import { NextResponse } from "next/server";

connect();
export async function POST(req) {
  try {
    const { error, value } = Joi.object({
      email: Joi.string().email().required(),
    }).validate(await req.json());

    if (error) {
      return NextResponse.json(
        { error: error.details[0].message },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: value.email });

    if (!user) {
      return NextResponse.json({ message: "Email not found" }, { status: 400 });
    }

    const currentTime = new Date();
    const otpExpiryTime = currentTime.setHours(currentTime.getHours() + 24); // Expires in 24 hours
    const otpNumber = Helper.makeRandomNumber(5);

    const otpData = {
      user_id: user.id,
      otp_number: otpNumber,
      otp_expiry: otpExpiryTime,
      email: value.email,
      otp_type: "FORGETPASSWORD",
    };

    await Otp.create(otpData);

    const emailSent = await sendEmail({
      toEmail: value.email,
      mailSubject: "Your Password Reset OTP",
      locale: { otpNumber },
    });

    if (!emailSent) {
      console.error("Error sending email");
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "OTP sent successfully. Check your email." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:++", error);

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
