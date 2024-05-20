import AuthService from "@/src/services/authService";
import { connect } from "@/src/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Helper from "@/src/services/helper";
import Chat from "@/src/models/chat";
import User from "@/src/models/user";
import { ObjectId } from "mongodb";
import Joi from "joi";

connect();

export async function POST(req) {
  try {
    // Verify user token
    const { user, error: authError } = await AuthService.verifyToken();
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    // Validate request body
    const schema = Joi.object({
      receiver_id: Joi.string().required(),
    });
    const { error, value } = schema.validate(await req.json());
    if (error) {
      return NextResponse.json(
        { error: error.details[0].message },
        { status: 400 }
      );
    }

    // Check if the receiver ID is a valid ObjectId
    if (!Helper.isValidObjectId(value.receiver_id)) {
      return NextResponse.json(
        { error: "Invalid receiver_id format" },
        { status: 400 }
      );
    }

    const userID = new ObjectId(user._id);
    const receiverId = new ObjectId(value.receiver_id);

    // Prevent user from sending a message to themselves
    if (receiverId.equals(userID)) {
      return NextResponse.json(
        {
          error: `Receiver id ${receiverId} and sender id ${userID} must not be the same`,
        },
        { status: 403 }
      );
    }

    // Check if receiver exists
    const receiverExist = await User.findById(receiverId);
    if (!receiverExist) {
      return NextResponse.json(
        { error: `Receiver not found` },
        { status: 404 }
      );
    }

    // Find existing chat channel or create a new one
    const channelData = await Chat.findOne({
      $or: [
        { sender_id: userID, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: userID },
      ],
    })
      .populate({
        path: "sender_id",
        select: "_id name email username bio gender",
        model: "User",
      })
      .populate({
        path: "receiver_id",
        select: "_id name email username bio gender",
        model: "User",
      });

    if (channelData) {
      return NextResponse.json(
        {  message: "Chat channel fetched successfully", data: channelData},
        { status: 200 }
      );
    } else {
      const newChat = await Chat.create({
        sender_id: userID,
        receiver_id: receiverId,
      });
      const channelData = await Chat.findById(newChat._id)
        .populate({
          path: "receiver_id",
          select: "_id name email username bio gender",
          model: "User",
        })
        .populate({
          path: "sender_id",
          select: "_id name email username bio gender",
          model: "User",
        });
      return NextResponse.json(
        { message: "Chat channel created successfully", data: channelData },
        { status: 201 }
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
