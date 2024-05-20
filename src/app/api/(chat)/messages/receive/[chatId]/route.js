import AuthService from "@/src/services/authService";
import { connect } from "@/src/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Chat from "@/src/models/chat";
import Joi from "joi";
import Message from "@/src/models/message";
import { ObjectId } from "mongodb";

connect();

export async function GET(req,content) {
  try {
    const { chatId } = content.params;
    const { user, error: authError } = await AuthService.verifyToken();

    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }
  
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.searchParams);

    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 5;
    const chatID = new ObjectId(chatId);
    const userID = new ObjectId(user._id);
    const chat = await Chat.findById(chatID);
    if (!chat) {
      return NextResponse.json(
        { error: "Chat channel does not exist" },
        { status: 400 }
      );
    }
    await Message.updateMany(
      {
        receiver_id:  userID ,
        chat_channel_id: chatID,
        is_seen: false
      },
      {
        $set: { is_seen: true }
      }
    );

    const message = await Message.find({
      receiver_id:  userID ,
      chat_channel_id: chatID,
    })

    return NextResponse.json(
      { message: "Chat messages fetched successfully", data: message},
      { status: 500 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
