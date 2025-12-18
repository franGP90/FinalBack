import { getDB } from "../db/mongo";
import bcrypt from "bcryptjs";
import { COLLECTION_TRAINERS } from "../utils";
import { ObjectId } from "mongodb";





export const createTrainer = async (name: string, password: string) => {
    const db = getDB();
    const encriptedPassword = await bcrypt.hash(password, 10);

    const result = await db.collection(COLLECTION_TRAINERS).insertOne({
        name,
        password: encriptedPassword
    });

    return result.insertedId.toString();
};

export const validateTrainer = async (name: string, password: string) => {
    const db = getDB();
    const trainer = await db.collection(COLLECTION_TRAINERS).findOne({name});
    if( !trainer ) return null;

    const passwordValidate = await bcrypt.compare(password, trainer.password);
    if(!passwordValidate) return null;

    return trainer;
};

export const findTrainerById = async (id: string) => {
    const db = getDB();
    return await db.collection(COLLECTION_TRAINERS).findOne({_id: new ObjectId(id)})
}