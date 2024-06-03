import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/dbConfig/dbconfig";
import { z } from "zod";
import { loginSchema } from "@/types/zodSchemas";

export async function POST(request: NextRequest) {
    await dbConnect();

    try {
        const body = await request.json();
        const { email, password } = loginSchema.parse(body);

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ error: 'User does not exist!' }, { status: 400 });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return NextResponse.json({ error: "Invalid password!" }, { status: 400 });
        }

        const tokenData = {
            id: user._id,
            email: user.email,
        };

        const token = jwt.sign(tokenData, process.env.JWT_SECRET!, { expiresIn: "1d" });

        const response = NextResponse.json({ message: "Login successful!", status: 200 });

        response.cookies.set({
            name: "token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });

        return response;

    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessage = error.errors.map((err) => err.message).join(", ");
            return NextResponse.json({ message: errorMessage }, { status: 400 });
        } else {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
        }
    }
}
