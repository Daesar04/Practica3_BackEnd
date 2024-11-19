import { Double, ObjectId } from "mongodb";

export type coordenadasLugar = {
    latitud: Double, 
    longitud: Double
};

export type ninosModel = {
    _id: ObjectId,
    nombre: string,
    comportamiento: string,
    ubicacion: string
};

export type lugaresModel = {
    _id: ObjectId,
    nombre: string,
    coordenadas: string,
    ninosBuenos: ObjectId[]
};