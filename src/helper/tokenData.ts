import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import ApiError from "@/helper/ApiError";

export async function getTokenData(req: NextRequest) {
    try {
        const token = await req.cookies.get("token")?.value;

        if (!token) {
            throw new ApiError(401, "You are not logged in!");
        }

        const { id } = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        return { userId: id };


    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Something went wrong!", status: 500 });
    }
}