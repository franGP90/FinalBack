import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import { getDB } from './db/mongo';
import { ObjectId } from 'mongodb';
import { COLLECTION_TRAINERS } from './utils';

dotenv.config()


const SECRET_KEY = process.env.SECRET;

type TokenPayload = {
    userId: string;
}

export const signToken = (userId: string) => jwt.sign({ userId }, SECRET_KEY!, { expiresIn: 6000 });

export const verifyToken = (token: string): TokenPayload | null => {
    try{
        if(!SECRET_KEY) throw new Error("SECRET is not defined in environment variables");
        return jwt.verify(token, SECRET_KEY) as TokenPayload;
    }catch (err){
        return null;
    }
};

export const getUserFromToken = async (token: string) => {
    const payload = verifyToken(token);
    if(!payload) return null;
    const db = getDB();
    return await db.collection(COLLECTION_TRAINERS).findOne({
        _id: new ObjectId(payload.userId)
    })
}