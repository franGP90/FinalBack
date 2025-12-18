import { IResolvers } from "@graphql-tools/utils";
import { createPokemon, catchPokemon, getPokemons, getPokemonById  } from "../collections/pokemonsPokeSystem";
import { createTrainer, validateTrainer } from "../collections/pokemonTrainersPokeSystem";
import { signToken } from "../auth";
import { pokemonTrainer } from "../types";
import { getDB } from "../db/mongo";
import { ObjectId } from "mongodb";





export const resolvers: IResolvers = {
    Query: {
        pokemons: async (_, { page, size }) => {
            return await getPokemons(page, size);
        },
        pokemon: async (_, { id }) => {
            return await getPokemonById(id);
        },
        me: async (_, __, { trainer }) => {
            if(!trainer) return null;
            return {
                _id: trainer._id.toString(),
                ...trainer
            }
        }
    },
    Mutation: {
        createPokemon: async (_, { name, description, height, weight, types }) => {
            return await createPokemon(name, description, height, weight, types );
        },
        catchPokemon: async (_, { pokemonId }, { trainer }) => {
            if(!trainer) throw new Error("You must be logged in to catch pokemons");
            return await catchPokemon(pokemonId, trainer._id.toString());
        },
        startJourney: async (_, { name, password }) => {
            const trainerId = await createTrainer(name, password);
            return signToken(trainerId);
        },
        login: async (_, { name, password }) => {
            const user = await validateTrainer(name, password);
            if(!user) throw new Error("Invalid credentials");
            return signToken(user._id.toString());
        },
        freePokemon: async (_, {ownedPokemonId}) => {

        }
    },
    Trainer: {
        pokemons: async (parent: pokemonTrainer) => {
            const db = getDB();
            const pokemonIdsList = parent.pokemons;
            if(!pokemonIdsList) return [];
            const objectIds = pokemonIdsList.map((id) => new ObjectId(id));
            return db
                .collection("pokemonsPokeSystem")
                .find({ _id: { $in: objectIds } })
                .toArray();
        }
    }
}