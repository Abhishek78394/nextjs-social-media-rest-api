import AuthService from "@/services/authService";
import { connect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Follower from "@/models/follower";

connect();

export async function GET(req) {
  try {
    const { user, error: authError } = await AuthService.verifyToken();
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }

    const followerList = await Follower.find({
      following_id: user._id,
      status: "accepted",
      }).populate("follower_id", "-password");

    return NextResponse.json(
      { message: "Follower list retrieved successfully", data: followerList },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}