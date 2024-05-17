import AuthService from "@/services/authService";
import Helper from "@/services/helper";
import { connect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Post from "@/models/post"; 

connect();

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.searchParams);

    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 5;

    const { user, error: authError } = await AuthService.verifyToken();

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }

    const filter = { $or: [{ privacy: "public" }] };
    
    const followingList = await Helper.getFollowing(user._id);
    const followingIds = followingList.map(item => item.following_id);
    filter.$or.push({ user_id: { $in: followingIds } });

    const [totalPosts, fetchedPosts] = await Promise.all([
      Post.countDocuments(filter),
      Post.find(filter).skip((page - 1) * limit).limit(limit),
    ]);

    const totalPages = Math.ceil(totalPosts / limit);

    return NextResponse.json(
      {
        message: "Posts fetched successfully",
        data: fetchedPosts,
        pageInfo: {
          currentPage: parseInt(page),
          totalPages,
          totalPosts,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
