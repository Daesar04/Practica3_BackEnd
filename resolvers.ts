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

export const agregarNino = async (
    ninosCollection: Collection<ninosModel>,
    lugaresCollection: Collection<lugaresModel>,
    nuevoNino: ninosModel
): Promise<Response> => {
    const lugarExistente = await lugaresCollection.findOne({ nombre: nuevoNino.ubicacion });
    if(!lugarExistente)
    {
        return new Response("El lugar no existe.", { status: 404 });
    }

    if (nuevoNino.comportamiento !== "bueno" && nuevoNino.comportamiento !== "malo") 
    {
        return new Response("El comportamiento debe ser 'bueno' o 'malo'.", { status: 404 });
    }

    const ninoExistente = await ninosCollection.findOne({ nombre: nuevoNino.nombre });

    if (ninoExistente) 
    {
        return new Response("El nombre del niño/a ya existe.", { status: 404 });
    }

    await ninosCollection.insertOne(nuevoNino);

    if (nuevoNino.comportamiento === "bueno") {
        await lugaresCollection.updateOne(
            { nombre: nuevoNino.ubicacion },
            { $push: { ninosBuenos: nuevoNino._id } }
        );
    }

    return new Response("Niño/a agregado con éxito.", { status: 200 });
};

export const agregarLugar = async (
    lugaresCollection: Collection<lugaresModel>,
    nuevoLugar: lugaresModel
): Promise<Response> => {
    const lugarExistente = await lugaresCollection.findOne({ nombre: nuevoLugar.nombre });
    if (lugarExistente) 
    {
        return new Response("El nombre del lugar ya existe.", { status: 404 });
    }

    if (!nuevoLugar.coordenadas || typeof nuevoLugar.coordenadas.latitud !== 'number' || typeof nuevoLugar.coordenadas.longitud !== 'number') {
        return new Response("Las coordenadas no son válidas.", { status: 400 });
    }

    await lugaresCollection.insertOne(nuevoLugar);
    return new Response("Lugar agregado con éxito.", { status: 200 });
};