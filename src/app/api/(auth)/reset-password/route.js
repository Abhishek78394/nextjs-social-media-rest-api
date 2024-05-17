import bcryptUtils from "@/services/hashService";
import { connect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Helper from "@/services/helper";
import User from "@/models/user";
import Otp from "@/models/otp";
import Joi from "joi";

connect();
export async function POST(req) {
  try {
    const { error, value } = Joi.object({
      email: Joi.string().required(),
      otpNumber: Joi.string().required(),
      newPassword: Joi.string().required(),
      confirmNewPassword: Joi.any()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
          "any.only": "New password and confirm password must match",
        }),
    }).validate(await req.json());

    if (error)
      return NextResponse.json(
        { error: error.details[0].message },
        { status: 400 }
      );

      const [user, otpRecord] = await Promise.all([
        User.findOne({ email: value.email }),
        Otp.findOne({ otp_type: "FORGETPASSWORD", email: value.email }).sort({ created_at: -1 }),
      ]);
  
      if (!user) {
        return NextResponse.json({ message: "Email not found" }, { status: 400 });
      }

    if (!otpRecord || otpRecord.otp_number != value.otpNumber) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
      }
  
      if (Helper.isOtpExpired(otpRecord.otp_expiry)) {
        return NextResponse.json({ error: "OTP Expired" }, { status: 400 });
      }
  
      const hashPass = await bcryptUtils.hashPwd(value.newPassword);
      user.password = hashPass;
      await user.save();
  
      return NextResponse.json({ message: "Password Changed Successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error:++", error);

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
