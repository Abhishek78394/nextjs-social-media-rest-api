import AuthService from "@/services/authService";
import { connect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Comment from "@/models/comment";
import Helper from "@/services/helper";
import Post from "@/models/post";
import Joi from "joi";
import Like from "@/models/like";

connect();
export async function PUT(req, context) {
  try {
    const { id } = context.params;
    if (!Helper.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid Post ID format" },
        { status: 400 }
      );
    }
    const { user, error: authError } = await AuthService.verifyToken();

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }

  

    const post = await Post.findById(id).populate("user_id");
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 400 });
    }

    const isAuthorized =
      post.user_id.privacy.toString() === "public" ||
      post.user_id._id === user._id ||
      (await Helper.isFollowing(user._id, post.user_id._id));

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "You are not authorized to like on this Post" },
        { status: 403 }
      );
    }

    const isLiked = await Like.findOne({ user_id: post.user_id._id, post_id: id});

    if(!isLiked) {
      await Like.create({user_id: post.user_id._id, post_id: id});
      post.like_count++;
      await post.save();
      return NextResponse.json(
        { message: "Like a Post successfully" },
        { status: 200 }
      );
    }else{
        await Like.deleteOne({ user_id: post.user_id._id, post_id: id});
        post.like_count--;
        await post.save();

        return NextResponse.json(
            { message: "DisLike a Post successfully" },
            { status: 200 }
          );
    }

  } catch (error) {
    console.error("Error:", error);

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


export async function GET (req, context) {
  try {
    const { id } = context.params;
    if (!Helper.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid Post ID format" },
        { status: 400 }
      );
    }
    const { user, error: authError } = await AuthService.verifyToken();

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }

    const post = await Post.findById(id).populate("user_id");
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 400 });
    }

    const isAuthorized =
      post.user_id.privacy.toString() === "public" ||
      post.user_id._id === user._id ||
      (await Helper.isFollowing(user._id, post.user_id._id));

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "You are not authorized to like on this Post" },
        { status: 403 }
      );
    }

    const likeUser = await Like.find({ post_id: id}).populate('user_id','username email gender name avatar bio phone')

        return NextResponse.json(
            { message: "Like a User Fetched successfully" , data:likeUser},
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
