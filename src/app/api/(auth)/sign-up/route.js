import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/user";
import Joi from "joi";
import { NextResponse } from "next/server";
import bcryptUtils from "@/services/hashService";
import AuthService from "@/services/authService";
import { cookies } from "next/headers";

connect();
export async function POST(req) {
  try {
    const { error, value } = Joi.object({
      username: Joi.string().alphanum().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    }).validate(await req.json());

    if (error)
      return NextResponse.json(
        { error: error.details[0].message },
        { status: 400 }
      );

    const existingUser = await User.findOne({
      $or: [{ email: value.email }, { username: value.username }],
    });

    if (existingUser) {
      const errorField =
        existingUser.email === value.email ? "email" : "username";
      return NextResponse.json(
        { error: `"${errorField}" already in use` },
        { status: 400 }
      );
    }

    const hashPass = await bcryptUtils.hashPwd(value.password);
    const newUser = new User({
      username: value.username,
      email: value.email,
      password: hashPass,
    });
    const token = await AuthService.issueToken({
      _id: newUser._id,
      email: newUser.email,
    });
    newUser.reset_token = token;
    await newUser.save();
    delete newUser._doc.password;
    cookies().set('token', token);

    return NextResponse.json(
      { message: "User registered successfully", data: newUser },
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
