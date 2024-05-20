import AuthService from "@/src/services/authService";
import { connect } from "@/src/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Follower from "@/src/models/follower";
import Joi from "joi";

connect();

export async function POST(req) {
  try {
    const { error, value } = Joi.object({
      followeeId: Joi.string().required(),
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
    const existingRequest = await Follower.findOne({
      follower_id: user._id,
      following_id: value.followeeId,
    });
// console.log(existingRequest)
    if (existingRequest && existingRequest.status === "pending") {
      return NextResponse.json(
        { error: "Following request already pending" },
        { status: 409 }
      );
    } else if (existingRequest && existingRequest.status === "accepted") {
      return NextResponse.json(
        { error: "You are already following this user" },
        { status: 409 }
      );
    }

    const follower = new Follower({
      follower_id: user._id,
      following_id: value.followeeId,
      status: "pending",
    });

    await follower.save();

    return NextResponse.json(
      { message: "Following request sent successfully", success: true },
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