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


export const getUbicacionesOrdenadas = async (
    lugaresCollection: Collection<lugaresModel>,
    ninosCollection: Collection<ninosModel>
): Promise<Response> => {
    const lugares = await lugaresCollection.find().toArray();
    const ubicacionesNinosBuenos = await Promise.all(
        lugares.map(async (lugar) => {
            const numeroNinosBuenos = await ninosCollection.find({
                comportamiento: "bueno",
                ubicacion: lugar.nombre,
            }).count();
            return { ubicacion: lugar.nombre, numeroNinosBuenos };
        })
    );

    ubicacionesNinosBuenos.sort((a, b) => b.numeroNinosBuenos - a.numeroNinosBuenos);

    return new Response(JSON.stringify(ubicacionesNinosBuenos));
};