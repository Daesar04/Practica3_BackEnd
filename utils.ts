import { Double } from "mongodb";
import { lugaresModel, coordenadasLugar } from "./types.ts";

export const haversine = (
    lat1: Double, 
    lon1: Double, 
    lat2: Double, 
    lon2: Double
) => {
    const R = 6371; // Radio de la Tierra en km
    const toRad = (deg: Double) => (deg * Math.PI) / 180.0; // Conversión a radianes
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);

    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en km
};

export const sonCoordenadasReales = (
    latitud: Double, 
    longitud: Double
): boolean => {
    return latitud.valueOf() >= -90.0 && latitud.valueOf() <= 90.0 && longitud.valueOf() >= -180.0 && longitud.valueOf() <= 180.0;
};

export const convertirModeloLugarALugar = (
    modeloLugar: lugaresModel
) => {
    return {
        nombre: modeloLugar.nombre,
        coordenadas: sacarLatitudYLongitud(modeloLugar.coordenadas),
        ninosBuenos: modeloLugar.ninosBuenos
    };
};

export const sacarLatitudYLongitud = (
    coords: string
): coordenadasLugar => {
    const [lat, lon] = coords.split(',').map(coord => parseFloat(coord.trim()));
    return {
        latitud: new Double(lat),
        longitud: new Double(lon),
    };
};
