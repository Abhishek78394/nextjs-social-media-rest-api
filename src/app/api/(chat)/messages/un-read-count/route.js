import AuthService from "@/src/services/authService";
import { NextResponse } from "next/server";
import Chat from "@/src/models/chat";
import Message from "@/src/models/message";
import { connect } from "@/src/dbConfig/dbConfig";
import { ObjectId } from "mongodb";

connect();

export async function GET(req) {
  try {
    const { user, error: authError } = await AuthService.verifyToken();
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const chat_id = searchParams.get('chat_id');
    if (!chat_id) {
      return NextResponse.json({ error: "Chat_id is required" }, { status: 400 });
    }

    let chatID;
    try {
      chatID = new ObjectId(chat_id);
    } catch (e) {
      return NextResponse.json({ error: "Invalid chat_id format" }, { status: 400 });
    }

    const chat = await Chat.findById(chatID);
    if (!chat) {
      return NextResponse.json({ error: "Chat channel does not exist" }, { status: 404 });
    }

    const unseenMessageCount = await Message.countDocuments({
      chat_channel_id: chatID,
      receiver_id: user._id,
      is_seen: false
    });

    return NextResponse.json({ message: "Unseen message count retrieved successfully", data: unseenMessageCount }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
