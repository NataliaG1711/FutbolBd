import pymysql
from pymongo import MongoClient
import datetime

class Heroe:
    def __init__(self, id: int, nombre: str, bio: str, img: str, aparicion, casa: str):
        self.id = id
        self.nombre = nombre
        self.bio = bio
        self.img = img
        if isinstance(aparicion, datetime.date) and not isinstance(aparicion, datetime.datetime):
            self.aparicion = datetime.datetime.combine(aparicion, datetime.datetime.min.time())
        else:
            self.aparicion = aparicion
        self.casa = casa

    def toDBCollection(self):
        return {
            "nombre": self.nombre,
            "bio": self.bio,
            "img": self.img,
            "aparicion": self.aparicion,
            "casa": self.casa
        }


class Pelicula:
    def __init__(self, id: int, nombre: str, descripcion: str):
        self.id = id
        self.nombre = nombre
        self.descripcion = descripcion

    def toDBCollection(self):
        return {
            "nombre": self.nombre,
            "descripcion": self.descripcion
        }


class Protagonista:
    def __init__(self, idheroe: int, idpelicula: int, papel: str, descripcion_rol: str, actor: str):
        self.idheroe = idheroe
        self.idpelicula = idpelicula
        self.papel = papel
        self.descripcion_rol = descripcion_rol
        self.actor = actor

    def toDBCollection(self, idheroe_mongo, idpelicula_mongo):
        return {
            "idheroe": idheroe_mongo,
            "idpelicula": idpelicula_mongo,
            "papel": self.papel,
            "descripcion_rol": self.descripcion_rol,
            "actor": self.actor
        }



# MongoDB
mongodb_cnn = "mongodb+srv://root:root@cluster0.1fwvq.mongodb.net/migration"
mongo_client = MongoClient(mongodb_cnn)
mongo_db = mongo_client["migration"]
mongo_collection_peliculas = mongo_db['PeliculasSql']
mongo_collection_protagonistas = mongo_db['ProtagonistasSql']
mongo_collection_heroes = mongo_db['HeroesSql']

# MySQL
mysql_conn = pymysql.connect(
    host="localhost",
    user="root",
    password="",
    database="test"
)
mysql_cursor = mysql_conn.cursor(pymysql.cursors.DictCursor)

# HEROES
mysql_cursor.execute("SELECT * FROM heroes")
heroes_mysql = mysql_cursor.fetchall()
heroes_id = {}

for heroe_row in heroes_mysql:
    heroe = Heroe(**heroe_row)
    result = mongo_collection_heroes.insert_one(heroe.toDBCollection())
    heroes_id[heroe.id] = result.inserted_id

# PELICULAS
mysql_cursor.execute("SELECT * FROM peliculas")
peliculas_mysql = mysql_cursor.fetchall()
peliculas_id = {}

for pelicula_row in peliculas_mysql:
    pelicula = Pelicula(**pelicula_row)
    result = mongo_collection_peliculas.insert_one(pelicula.toDBCollection())
    peliculas_id[pelicula.id] = result.inserted_id

# PROTAGONISTAS
mysql_cursor.execute("""
    SELECT p.idpelicula, p.idheroe, p.papel, p.descripcion_rol, p.actor
    FROM protagonistas p
""")
protagonistas_mysql = mysql_cursor.fetchall()

for prot_row in protagonistas_mysql:
    protagonista = Protagonista(**prot_row)
    doc = protagonista.toDBCollection(
        idheroe_mongo=heroes_id[protagonista.idheroe],
        idpelicula_mongo=peliculas_id[protagonista.idpelicula]
    )
    mongo_collection_protagonistas.insert_one(doc)

print("Datos migrados a MongoDB.")
