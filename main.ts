import { MongoClient } from "mongodb";
import { lugaresModel, ninosModel } from "./types.ts";
import { buscarNinosComportamiento } from "./resolvers.ts";

const url = Deno.env.get("MONGO_URL");

if(!url) {
  console.log("No se ha podido conectar a la URL");
  Deno.exit(-1);
}

const client = new MongoClient(url);
const dbName = 'Practica3';

await client.connect();
console.log('Connected successfully to server');
const db = client.db(dbName);
const ninosCollection = db.collection<ninosModel>('ninos');
const lugaresCollection = db.collection<lugaresModel>('lugares');

const handler = async (
  req: Request
): Promise<Response> => {
  const method = req.method;
  const url = new URL(req.url);
  const path = url.pathname;

  if(method === "GET")
  {
    if(path === "/ninos/buenos")
    {
      return await buscarNinosComportamiento(ninosCollection, "bueno");
    }
    else if(path === "/ninos/malos")
    { 
      return await buscarNinosComportamiento(ninosCollection, "malo");
    }
    else if(path === "/entregas")
    {

    }
    else if(path === "/ruta")
    {

    }
  } 
  else if(method === "POST")
  {
    if(path === "/ubicacion")
    {
      
    }
    else if(path === "/ninos")
    { 
      
    }
  } 

  return new Response("Endpoint not found", { status: 400 });
};

Deno.serve({port: 6768}, handler);