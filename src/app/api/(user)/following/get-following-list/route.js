import AuthService from "@/src/services/authService";
import { connect } from "@/src/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Follower from "@/src/models/follower";

connect();

export async function GET(req) {
  try {
    const { user, error: authError } = await AuthService.verifyToken();
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }

    const followingList = await Follower.find({
      follower_id: user._id,
      status: "accepted",
    }).populate("following_id", "-password");

    return NextResponse.json(
      { message: "Following list retrieved successfully", data: followingList },
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