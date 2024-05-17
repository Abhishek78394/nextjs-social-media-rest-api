import AuthService from "@/services/authService";
import Helper from "@/services/helper";
import { connect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Post from "@/models/post";
import Comment from "@/models/comment";

connect();

export async function GET(req,context) {
  try {
     const { postId } = context.params;
     if (!Helper.isValidObjectId(postId)) {
        return NextResponse.json(
          { error: "Invalid post ID format" },
          { status: 400 }
        );
      }

      const post =  await Post.findById(postId);
      if (!post) {
        return NextResponse.json(
          { error: "Post not found"  },
          { status: 400 }
        );
      };

      const comment = await Comment.find({post_id:post._id});

      return NextResponse.json(
        { message: "Comment fetched Successfully", data:comment },
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
