import { Double, ObjectId } from "mongodb";

enum enumComportamiento {
    bueno = 1,
    malo = 0
};

export type coordenadasLugar = {
    latitud: Double, 
    longitud: Double
};

export type ninos = {
    _id: string,
    nombre: string,
    comportamiento: enumComportamiento,
    ubicacion: string
};

export type ninosModel = {
    _id: ObjectId,
    nombre: string,
    comportamiento: string,
    ubicacion: string
};

export type lugares = {
    _id: string,
    nombre: string,
    coordenadas: coordenadasLugar,
    ninosBuenos: ninosModel[]
};

export type lugaresModel = {
    _id: ObjectId,
    nombre: string,
    coordenadas: string,
    ninosBuenos: ObjectId[]
};