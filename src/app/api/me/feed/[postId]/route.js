import AuthService from "@/services/authService";
import { connect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Helper from "@/services/helper";
import Post from "@/models/post";


connect();

export async function DELETE(req,content) {
  try {
    const { postId } = content.params;

    const { user, error: authError } = await AuthService.verifyToken();

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }
    
   const result  = await Post.deleteOne({user_id: user._id,_id:postId})

   if (result .deletedCount === 0) {
    return NextResponse.json(
      { error: "Post not found" },
      { status: 404 }
    );
  }
  
  return NextResponse.json(
    { message: "Post deleted successfully", success: true },
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