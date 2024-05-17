import AuthService from "@/services/authService";
import { connect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Helper from "@/services/helper";
import User from "@/models/user";
import Joi from "joi";
import { ObjectId } from "mongodb";


connect();

export async function GET(req) {
  try {
    const { user:authUser, error } = await AuthService.verifyToken();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const userId = new ObjectId(authUser._id);

    // const [fetchedUserWithPostsAndFollowing] = await Promise.all([
    //   User.aggregate([
    //     {
    //       $match: { _id: userId }
    //     },
    //     {
    //       $lookup: {
    //         from: 'posts',
    //         localField: '_id',
    //         foreignField: 'user_id',
    //         as: 'posts'
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: 'followers',
    //         let: { userId: '$_id' },
    //         pipeline: [
    //           {
    //             $match: {
    //               $expr: {
    //                 $and: [
    //                   { $eq: ['$following_id', '$$userId'] },
    //                   { $eq: ['$status', 'accepted'] }
    //                 ]
    //               }
    //             }
    //           },
    //           {
    //             $lookup: {
    //               from: 'users',
    //               localField: 'follower_id',
    //               foreignField: '_id',
    //               as: 'follower'
    //             }
    //           },
    //           {
    //             $unwind: '$follower'
    //           },
    //           {
    //             $project: {
    //               _id: '$follower._id',
    //               username: '$follower.username',
    //               email: '$follower.email',
    //               avatar: '$follower.avatar',
    //               name: '$follower.name',
    //             }
    //           }
    //         ],
    //         as: 'followers'
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: 'followers',
    //         let: { userId: '$_id' },
    //         pipeline: [
    //           {
    //             $match: {
    //               $expr: {
    //                 $and: [
    //                   { $eq: ['$follower_id', '$$userId'] },
    //                   { $eq: ['$status', 'accepted'] }
    //                 ]
    //               }
    //             }
    //           },
    //           {
    //             $lookup: {
    //               from: 'users',
    //               localField: 'following_id',
    //               foreignField: '_id',
    //               as: 'following'
    //             }
    //           },
    //           {
    //             $unwind: '$following'
    //           },
    //           {
    //             $project: {
    //               _id: '$following._id',
    //               username: '$following.username',
    //               email: '$following.email',
    //               avatar: '$following.avatar',
    //               name: '$following.name',
    //             }
    //           }
    //         ],
    //         as: 'followings'
    //       }
    //     }
    //   ])
    // ]);

    // if (!fetchedUserWithPostsAndFollowing) {
    //   return NextResponse.json({ error: "User not found" }, { status: 404 });
    // }

    const user = await User.findById(userId)

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }


    return NextResponse.json(
      { message: "User Profile successfully", data: user },
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
      name: Joi.string().optional(),
      gender: Joi.string().valid("male", "female").optional(),
      username: Joi.string().optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().min(10).max(10).optional(),
      bio: Joi.string().optional(),
    }).validate(await req.json());
    

    if (error)
      return NextResponse.json(
        { error: error.details[0].message },
        { status: 400 }
      );

      const { user, error:authError } = await AuthService.verifyToken();

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 401 });
      }

    const fetchedUser = await User.findOne({
      email: user.email,
      _id: user._id,
    });

    if (!fetchedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    fetchedUser.username = value.username;
    fetchedUser.gender = value.gender;
    fetchedUser.phone = value.phone;
    fetchedUser.email = value.email || user.email;
    fetchedUser.name = value.name;
    fetchedUser.bio = value.bio;
    await fetchedUser.save();

    delete fetchedUser._doc.password;

    return NextResponse.json(
      { message: "Profile updated successfully", data: fetchedUser },
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
