import AuthService from "@/services/authService";
import { connect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Helper from "@/services/helper";
import Post from "@/models/post";


connect();

export async function POST(req) {
  try {
    const data = await req.formData();
    const image = data.get('image');
    const content = data.get('content');

    if (!image || !content) {
        return NextResponse.json({ message: "Image and content are required", success: false }, { status: 400 });
      }
    const { user, error: authError } = await AuthService.verifyToken();

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }
    
    const uploadSuccess = await Helper.uploadFile(image, `./public/post/${image.name}`);
    if (!uploadSuccess) {
      return NextResponse.json({ message: "Failed to upload image", success: false }, { status: 500 });
    }

  const post = await Post.create({
        user_id: user._id,
        content: content,
        image: image.name
    });

    return NextResponse.json(
      { message: "Post Upload successfully", data: post },
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

  const post = await Post.find({user_id: user._id}).skip((page - 1) * limit)
  .limit(limit)
  const [totalPosts, fetchedPosts] = await Promise.all([
    Post.countDocuments({ user_id: user._id }),
    Post.find({ user_id: user._id })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  const totalPages = Math.ceil(totalPosts / limit);

    return NextResponse.json(
      { message: "Post Fetch successfully", data: fetchedPosts, pageInfo: {
        currentPage: page,
        totalPages,
        totalPosts,
      }, },
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