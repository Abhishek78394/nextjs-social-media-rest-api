import Follower from "@/models/follower";
import Following from "@/models/following";
import { writeFile } from "fs/promises";
import { cookies } from "next/headers";

const Helper = {
  makeRandomNumber: (numDigits) => {
    if (typeof numDigits !== "number" || numDigits <= 0) {
      throw new Error("Number of digits must be a positive integer.");
    }

    const min = Math.pow(10, numDigits - 1);
    const max = Math.pow(10, numDigits) - 1;
    const randomNumber = Math.floor(min + Math.random() * (max - min + 1));

    return randomNumber;
  },
  isOtpExpired: (otpRecord) => {
    const otpExpiryDate = new Date(otpRecord["otp_expiry"]);
    const currentDate = Date.now();
    return otpExpiryDate.getTime() < currentDate;
  },
  isValidObjectId: (id) => {
    if (!id || typeof id !== "string" || id.length !== 24) {
      return false;
    }

    const objectIdRegex = /^[0-9a-f]{24}$/;
    return objectIdRegex.test(id);
  },
  uploadFile: async (file, destination) => {
    try {
      const byteData = await file.arrayBuffer();
      const buffer = Buffer.from(byteData);

      await writeFile(destination, buffer);

      return true;
    } catch (error) {
      console.error("Error uploading file:", error);
      return false;
    }
  },
  getFollowing: async (userId) => {
    try {
      const followingList = await Following.find({
        me_id: userId,
        status: "accepted"
      }).populate("following", "-password");

      return followingList;
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Internal server error");
    }
  },
  getFollower: async (userId) => {
    try {
      const followerList = await Follower.find({
        me_id: userId,
        status: 'accepted',
        }).populate("follower", "-password");

      return followerList;
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Internal server error");
    }
  },
  isFollowing: async (userId, followingId) =>{
    const following = await Follower.findOne({
      follower_id: userId,
      following_id: followingId,
      status: "accepted"
    });
    return !!following;
  },
  setCookie: (key, value) => {
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    // const oneDayInMilliseconds = 1000
    const expires = new Date(Date.now() + oneDayInMilliseconds);
  
    cookies().set(key, value, {
      expires,
      path: '/',
      domain: process.env.NEXT_PUBLIC_DOMAIN || 'localhost',
      secure: process.env.NODE_ENV === 'production', 
      httpOnly: true, 
    });
  }
 
};

module.exports = Helper;
