import AuthService from "@/src/services/authService";
import { connect } from "@/src/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Follower from "@/src/models/follower";
import Joi from "joi";

connect();

export async function DELETE(req) {
  try {
    const { error, value } = Joi.object({
        followerId: Joi.string().required(),
    }).validate(await req.json());

    if (error)
      return NextResponse.json(
        { error: error.details[0].message },
        { status: 400 }
      );

    const { user, error: authError } = await AuthService.verifyToken();

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }
    const deletedCount = await Follower.deleteOne({
      follower_id: value.followerId,
      following_id: user._id,
      status: "accepted",
    });

    if (deletedCount.deletedCount === 0) {
      return NextResponse.json(
        { error: "User not found in your Follower list" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "User removed from your Follower list", success: true },
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