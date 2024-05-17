import AuthService from "@/services/authService";
import { connect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Comment from "@/models/comment";
import Helper from "@/services/helper";
import Post from "@/models/post";
import Joi from "joi";

connect();
export async function POST(req) {
    try {
      const { error, value } = Joi.object({
        postId: Joi.string().required(),
        content: Joi.string().required()
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
      
      const post =  await Post.findById(value.postId);
      if (!post) {
        return NextResponse.json(
          { error: "Post not found"  },
          { status: 400 }
        );
      }

      const isAuthorized = post.user_id === user._id || (await Helper.isFollowing(user._id, post.user_id));

      if (!isAuthorized) {
        return NextResponse.json({ error: "You are not authorized to comment on this post" }, { status: 403 });
      }
     
      post.comment_count++
      await post.save();

      const comment = new Comment({
        user_id: user._id,
        post_id: value.postId,
        content: value.content
      });
  
      await comment.save();

      return NextResponse.json(
        { message: "Comment created successfully", data: comment },
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

export async function PUT(req) {
  try {
    const { error, value } = Joi.object({
      comment_id: Joi.string().required(),
      content: Joi.string().required()
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
    
    const comment =  await Comment.findById(value.comment_id);
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found"  },
        { status: 400 }
      );
    }

    const isAuthorized = comment.user_id.toString()=== user._id.toString();
    if (!isAuthorized) {
      return NextResponse.json({ error: "You are not authorized to comment on this post" }, { status: 403 });
    }
   
    comment.content = value.content;
    await comment.save();

    return NextResponse.json(
      { message: "Comment edited successfully", data: comment },
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

export async function DELETE(req) {
  try {
    const { error, value } = Joi.object({
      comment_id: Joi.string().required()
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
    
    const comment =  await Comment.findById(value.comment_id);
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found"  },
        { status: 400 }
      );
    }

    const post =  await Post.findById(comment.post_id);
    if (!post) {
      return NextResponse.json(
        { error: "Post not found"  },
        { status: 400 }
      );
    }

    const isAuthorized = comment.user_id.toString()=== user._id.toString() || post.user_id.toString()=== user._id.toString();
    if (!isAuthorized) {
      return NextResponse.json({ error: "You are not authorized to comment on this post" }, { status: 403 });
    }
   
    await Comment.deleteOne({ _id: value.comment_id });

    return NextResponse.json(
      { message: "Comment deleted successfully" },
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