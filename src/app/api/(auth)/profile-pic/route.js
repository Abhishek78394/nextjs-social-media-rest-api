import AuthService from "@/services/authService";
import { connect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import { writeFile } from 'fs/promises'
import User from "@/models/user";

connect();

export async function POST(req) {
try {

    const { user, error: authError } = await AuthService.verifyToken();

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }

    const data = await req.formData();
    const file = data.get('image');

    if (!file) {
      return NextResponse.json({ message: "No Image found", success: false }, { status: 400 });
    }

    const fetchedUser = await User.findOneAndUpdate(
      { email: user.email, _id: user._id },
      { $set: { avatar: file.name } },
      { new: true } // Return the updated user
    );

    if (!fetchedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const byteData = await file.arrayBuffer();
    const buffer = Buffer.from(byteData);
    const path = `./public/user/${file.name}`;
    await writeFile(path, buffer);

    return NextResponse.json({ message: "Profile Picture Upload Successful", success: true, data: fetchedUser }, { status: 200 });
} catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}