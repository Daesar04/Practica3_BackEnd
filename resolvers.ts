import { type Collection, MongoClient } from "mongodb";
import { lugaresModel, ninosModel } from "./types.ts";

export const buscarNinosComportamiento = async (
    ninosCollection: Collection<ninosModel>,
    comportamiento: string
): Promise<Response> => {
    const ninosBuenos = await ninosCollection.find({ comportamiento: comportamiento }).toArray();

    if(ninosBuenos.length === 0)
    {
        return new Response(`No se han encontrado niños ${comportamiento}s`, { status: 404 });
    }
    return new Response(JSON.stringify(ninosBuenos));
};  