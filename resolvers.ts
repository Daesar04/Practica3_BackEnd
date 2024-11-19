import { type Collection, MongoClient } from "mongodb";
import { lugaresModel, ninosModel, coordenadasLugar } from "./types.ts";
import { convertirModeloLugarALugar, haversine } from "./utils.ts";

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

export const getDistanciaTotal = async (
    lugaresCollection: Collection<lugaresModel>,
    ninosCollection: Collection<ninosModel>
): Promise<Response> => {
    const ubicacionesOrdenadasResponse = await getUbicacionesOrdenadas(lugaresCollection, ninosCollection);
    const ubicacionesOrdenadas = await ubicacionesOrdenadasResponse.json();

    if (ubicacionesOrdenadas.length < 2) {
        return new Response("No hay suficientes ubicaciones para calcular la distancia.", { status: 400 });
    }

    let distanciaTotal = 0;
    for (let i = 0; i < ubicacionesOrdenadas.length - 1; i++) 
    {
        const ubicacionActual = ubicacionesOrdenadas[i];
        const ubicacionSiguiente = ubicacionesOrdenadas[i + 1];
        const lugarActualModel = await lugaresCollection.findOne({ nombre: ubicacionActual.ubicacion });
        const lugarSiguienteModel = await lugaresCollection.findOne({ nombre: ubicacionSiguiente.ubicacion });

        if (lugarActualModel && lugarSiguienteModel) 
        {
            const lugarActual = convertirModeloLugarALugar(lugarActualModel);
            const lugarSiguiente = convertirModeloLugarALugar(lugarSiguienteModel);
            distanciaTotal += haversine(lugarActual.coordenadas.latitud, lugarActual.coordenadas.longitud, 
                                        lugarSiguiente.coordenadas.latitud, lugarSiguiente.coordenadas.longitud);
        }
    }

    return new Response(`Distancia total: ${distanciaTotal} Km`, { status: 200 });
};