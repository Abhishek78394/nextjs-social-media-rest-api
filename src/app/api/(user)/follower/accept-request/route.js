import AuthService from "@/services/authService";
    import { connect } from "@/dbConfig/dbConfig";
    import { NextResponse } from "next/server";
    import Follower from "@/models/follower";
    import Joi from 'joi'

    connect();

    export async function PUT(req) {
    try {
        const { error, value } = Joi.object({
            requestId: Joi.string().required(),
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

        const updatedRequest = await Follower.findOneAndUpdate(
            { follower_id: value.requestId, following_id: user._id, status: 'pending' }, 
            { $set: { status: 'accepted' } }, 
            { new: true } 
        );

        if (!updatedRequest) {
            return NextResponse.json({ error: 'Follow request not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Follow request accepted', success: true }, { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
        { error: error.message || "Internal server error" },
        { status: 500 }
        );
    }
    }