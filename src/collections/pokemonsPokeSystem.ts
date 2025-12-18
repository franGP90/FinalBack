import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo"
import {COLLECTION_POKEMONS, COLLECTION_TRAINERS } from "../utils";

export const getPokemons = async (page?: number, size?: number) => {
    const db = getDB();
    page = page || 1;
    size = size || 10;
    return await db.collection(COLLECTION_POKEMONS).find().skip((page - 1) * size).limit(size).toArray();
};

export const getPokemonById = async (id: string) => {
    const db = getDB();
    return await db.collection(COLLECTION_POKEMONS).findOne({_id: new ObjectId(id)});
};

export const createPokemon = async (name: string, description: string, height: number, weight: number, types: string) => {
    const db = getDB();
    const result = await db.collection(COLLECTION_POKEMONS).insertOne({
        name,
        description,
        height,
        weight,
        types
    });
    const newPokemon = await getPokemonById(result.insertedId.toString());
    return newPokemon;
};

export const catchPokemon = async (pokemonId: string, trainerId: string) => {
    const db = getDB();
    const localTrainerId = new ObjectId(trainerId);
    const localPokemonId = new ObjectId(pokemonId);

    const pokemonToAdd = await db.collection(COLLECTION_POKEMONS).findOne({_id: localPokemonId});
    if(!pokemonToAdd) throw new Error("Pokemon not found");

    await db.collection(COLLECTION_TRAINERS).updateOne(
        { _id: localTrainerId },
        {
            $addToSet: {pokemons: pokemonId }
        }
    );

    const updatedTrainer = await db.collection(COLLECTION_TRAINERS).findOne({_id: localTrainerId});
    return updatedTrainer;
}

export const freePokemon = async (ownedPokemonId:string, trainerId:string) =>{
    const db = getDB();
    const localTrainerId = new ObjectId(trainerId);
    const localOwnedPokemonId = new ObjectId(ownedPokemonId);

    const pokemonToDelete = await db.collection(COLLECTION_POKEMONS).findOne({_id: localOwnedPokemonId});
    if(!pokemonToDelete) throw new Error("Pokemon not found");

    await db.collection(COLLECTION_TRAINERS).updateOne(
        { _id: localTrainerId },
        {
            $delete:{pokemons: ownedPokemonId}
        }
    );

    const updatedTrainer = await db.collection(COLLECTION_TRAINERS).findOne({_id: localTrainerId});
    return updatedTrainer;
}