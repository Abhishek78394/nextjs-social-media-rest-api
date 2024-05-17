import bcryptUtils from "@/services/hashService";
import AuthService from "@/services/authService";
import { connect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Helper from "@/services/helper";
import User from "@/models/user";
import Joi from "joi";

connect();
export async function POST(req) {
  try {
    const { error, value } = Joi.object({
      identifier: Joi.string().required(),
      password: Joi.string().min(6).required(),
    }).validate(await req.json());

    if (error)
      return NextResponse.json(
        { error: error.details[0].message },
        { status: 400 }
      );

    const user = await User.findOne({
      $or: [{ email: value.identifier }, { username: value.identifier }],
    });

    if (!user)
      return NextResponse.json(
        { error: `Invalid email/username or password` },
        { status: 401 }
      );

    const isMatch = await bcryptUtils.comparePwd(value.password, user.password);
    if (!isMatch)
      return NextResponse.json(
        { error: `Invalid email/username or password` },
        { status: 401 }
      );
    const token = await AuthService.issueToken({
      _id: user._id,
      email: user.email,
    });
    user.reset_token = token;
    await user.save();
    delete user._doc.password;
    // cookies().set('token', token);
    Helper.setCookie('token', token);
    return NextResponse.json(
      { message: "User login successfully", data: user },
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
