import { ObjectId } from "mongodb";

enum enumComportamiento {
    bueno = 1,
    malo = 0
};

export type ninosModel = {
    _id: ObjectId,
    nombre: string,
    comportamiento: enumComportamiento,
    ubicacion: string
};

export type lugaresModel = {
    _id: ObjectId,
    nombre: string,
    coordenadas: {latitud: number, longitud: number},
    ninosBuenos: ObjectId[]
};