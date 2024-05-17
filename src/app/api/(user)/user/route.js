import AuthService from "@/services/authService";
import { connect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import User from "@/models/user";

connect();

export async function GET(req) {
  try {
    const { user, error } = await AuthService.verifyToken();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.searchParams);

    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return NextResponse.json({ error: "Invalid page or limit parameters" }, { status: 400 });
    }

    const [totalUsers, fetchedUsers] = await Promise.all([
      User.countDocuments({ _id: { $ne: user._id } }),
      User.find({ _id: { $ne: user._id } }, { password: 0 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json(
      {
        message: "Users fetched successfully",
        data: fetchedUsers,
        pageInfo: {
          currentPage: page,
          totalPages,
          totalUsers,
        },
      },
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
