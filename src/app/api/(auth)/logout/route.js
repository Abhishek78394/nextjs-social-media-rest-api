import bcryptUtils from "@/services/hashService";
import AuthService from "@/services/authService";
import { connect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import User from "@/models/user";
import Joi from "joi";

connect();
export async function GET(req) {
  try {
    const { user, error } = await AuthService.verifyToken();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const fetchedUser = await User.findOne({
        email: user.email,
        _id: user._id,
      });
  
      if (!fetchedUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      fetchedUser.reset_token =  null;
      await fetchedUser.save();
      cookies().delete('token')

    return NextResponse.json(
      { message: "User LogOut successfully" },
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
