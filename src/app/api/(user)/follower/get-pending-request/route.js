import AuthService from "@/services/authService";
import { connect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Follower from "@/models/follower";

connect();

export async function GET(req) {
  try {
    const { user, error } = await AuthService.verifyToken();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

      const pendingRequest =  await Follower.find({following_id: user._id, status: 'pending',}).populate('follower_id','-password')

    return NextResponse.json(
      { message: "Pending Request fetched successfully",success:true, data: pendingRequest  },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}