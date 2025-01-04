from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import sqlite3
from pydantic import BaseModel
from fastapi.responses import HTMLResponse




app = FastAPI()

# Middleware pour autoriser les requêtes CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir les fichiers statiques
app.mount("/static", StaticFiles(directory="static"), name="static")

# Routes HTML
@app.get("/", response_class=HTMLResponse)
async def home():
    with open("index.html", "r", encoding="utf-8") as file:
        return HTMLResponse(content=file.read())

@app.get("/consommation", response_class=HTMLResponse)
async def consommation():
    with open("consommation.html", "r", encoding="utf-8") as file:
        return HTMLResponse(content=file.read())

@app.get("/capteurs", response_class=HTMLResponse)
async def capteurs():
    with open("capteurs.html", "r", encoding="utf-8") as file:
        return HTMLResponse(content=file.read())

@app.get("/configuration", response_class=HTMLResponse)
async def configuration():
    with open("configuration.html", "r", encoding="utf-8") as file:
        return HTMLResponse(content=file.read())
    
@app.get("/economies", response_class=HTMLResponse)
async def economies():
    with open("economie.html", "r", encoding="utf-8") as file:
        content = file.read()
        return HTMLResponse(content=content)

# Modèles Pydantic
class Logement(BaseModel):
    nom: str
    adresse: str

class Facture(BaseModel):
    id_logement: int
    id_type: int
    montant: float

class Capteur(BaseModel):
    nom: str
    #reference: str
    port_communication: str
    id_logement: int
    id_piece: int
    id_type: int

class Piece(BaseModel):
    id_logement: int
    nom: str




# API pour gérer les logements
@app.get("/api/logements")
async def get_logements():
    conn = sqlite3.connect("logement.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Récupérer les logements avec leurs adresses et le nombre de pièces
    cursor.execute("""
        SELECT 
            l.id, 
            l.nom, 
            l.adresse, 
            COUNT(p.id) AS nb_pieces
        FROM logement l
        LEFT JOIN piece p ON l.id = p.id_logement
        GROUP BY l.id
    """)
    logements = [{"id": row["id"], "nom": row["nom"], "adresse": row["adresse"], "nb_pieces": row["nb_pieces"]} for row in cursor.fetchall()]
    conn.close()
    return logements

@app.get("/api/logements/{id_logement}")
async def get_logement_details(id_logement: int):
    conn = sqlite3.connect("logement.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Récupérer les pièces du logement
    cursor.execute("SELECT nom FROM piece WHERE id_logement = ?", (id_logement,))
    pieces = [{"nom": row["nom"]} for row in cursor.fetchall()]

    # Récupérer les factures du logement, regroupées par mois
    cursor.execute("""
        SELECT f.mois, tf.nom AS type, SUM(f.montant) AS total
        FROM facture f
        JOIN type_facture tf ON f.id_type = tf.id
        WHERE f.id_logement = ?
        GROUP BY f.mois, tf.nom
        ORDER BY f.mois
    """, (id_logement,))
    factures = {}
    for row in cursor.fetchall():
        mois = row["mois"]
        if mois not in factures:
            factures[mois] = []
        factures[mois].append({"type": row["type"], "total": row["total"]})

    conn.close()
    return {"pieces": pieces, "factures": factures}



@app.post("/api/logement")
async def add_logement(logement: Logement):
    conn = sqlite3.connect("logement.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO logement (nom, adresse) VALUES (?, ?)", (logement.nom, logement.adresse))
    conn.commit()
    conn.close()
    return {"message": "Logement ajouté avec succès"}

# API pour gérer les factures
@app.get("/api/factures/{id_logement}")
async def get_factures(id_logement: int):
    conn = sqlite3.connect("logement.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    query = """
    SELECT tf.nom AS type, SUM(f.montant) AS total
    FROM facture f
    JOIN type_facture tf ON f.id_type = tf.id
    WHERE f.id_logement = ?
    GROUP BY tf.nom
    """
    cursor.execute(query, (id_logement,))
    results = cursor.fetchall()
    conn.close()
    return [{"type": row["type"], "total": row["total"]} for row in results]



@app.get("/api/facture-montants")
async def get_facture_montants(id_logement: int = None):
    conn = sqlite3.connect("logement.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Requête pour regrouper les montants des factures par type
    if id_logement:
        query = """
        SELECT tf.nom AS type, SUM(f.montant) AS total
        FROM facture f
        JOIN type_facture tf ON f.id_type = tf.id
        WHERE f.id_logement = ?
        GROUP BY tf.nom
        """
        cursor.execute(query, (id_logement,))
    else:
        query = """
        SELECT tf.nom AS type, SUM(f.montant) AS total
        FROM facture f
        JOIN type_facture tf ON f.id_type = tf.id
        GROUP BY tf.nom
        """
        cursor.execute(query)

    results = cursor.fetchall()
    conn.close()

    return [{"type": row["type"], "montant": row["total"]} for row in results]


@app.post("/api/facture")
async def add_facture(facture: Facture):
    conn = sqlite3.connect("logement.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO facture (montant, id_logement, id_type) VALUES (?, ?, ?)",
        (facture.montant, facture.id_logement, facture.id_type),
    )
    conn.commit()
    conn.close()
    return {"message": "Facture ajoutée avec succès"}

# API pour gérer les capteurs
@app.get("/api/capteurs")
async def get_capteurs():
    # Liste de types de capteurs pré-définis
    types_capteurs = {
        1: "Capteur de Température",
        2: "Capteur de Humidité",
        3: "Capteur de Lumière",
        # Ajoutez d'autres types de capteurs selon vos besoins
    }

    conn = sqlite3.connect("logement.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Sélection des capteurs
    cursor.execute("SELECT id, nom, etat, id_type FROM capteur_actionneur")
    capteurs = cursor.fetchall()
    conn.close()

    # Ajouter le type de capteur en fonction de l'id_type
    result = []
    for row in capteurs:
        # Utilisation de id_type pour récupérer le type correspondant dans le dictionnaire
        type_capteur = types_capteurs.get(row["id_type"], "Type inconnu")  # Valeur par défaut si id_type non trouvé
        result.append({
            "id": row["id"],
            "nom": row["nom"],
            "etat": row["etat"],
            "type": type_capteur
        })

    return result


@app.post("/api/capteurs/{capteur_id}/toggle")
async def toggle_capteur(capteur_id: int):
    conn = sqlite3.connect("logement.db")
    cursor = conn.cursor()

    # Récupérer l'état actuel du capteur
    cursor.execute("SELECT etat FROM capteur_actionneur WHERE id = ?", (capteur_id,))
    current_state = cursor.fetchone()

    if current_state is None:
        conn.close()
        return {"error": "Capteur non trouvé"}, 404

    # Basculer l'état
    new_state = "inactif" if current_state[0] == "actif" else "actif"

    # Mettre à jour la base de données
    cursor.execute("UPDATE capteur_actionneur SET etat = ? WHERE id = ?", (new_state, capteur_id))
    conn.commit()
    conn.close()

    return {"message": "État mis à jour avec succès", "new_state": new_state}


@app.post("/api/capteur")
async def add_capteur(capteur: Capteur):
    conn = sqlite3.connect("logement.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO capteur_actionneur (nom, etat, id_logement, id_piece, id_type) VALUES (?, ?, ?, 'actif', ?, ?, ?)",
        (capteur.nom, capteur.id_logement, capteur.id_piece, capteur.id_type),
    )
    conn.commit()
    conn.close()
    return {"message": "Capteur ajouté avec succès"}

@app.get("/api/capteurs-groupes")
async def get_capteurs_groupes():
    conn = sqlite3.connect("logement.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Requête pour récupérer les capteurs avec leurs logements, pièces, mesures et adresse
    query = """
    SELECT l.nom AS logement_nom, 
           l.adresse AS logement_adresse,  -- Ajout de l'adresse du logement
           p.nom AS piece_nom, 
           c.nom AS capteur_nom, 
           c.etat, 
           c.id AS capteur_id,
           c.mesure
    FROM capteur_actionneur c
    JOIN piece p ON c.id_piece = p.id
    JOIN logement l ON c.id_logement = l.id
    ORDER BY l.nom, p.nom, c.nom
    """
    cursor.execute(query)
    results = cursor.fetchall()

    # Regrouper les résultats par logement et par pièce
    logements = {}
    for row in results:
        logement_nom = row["logement_nom"]
        logement_adresse = row["logement_adresse"]  # Récupération de l'adresse
        piece_nom = row["piece_nom"]
        capteur_id = row["capteur_id"]
        capteur_type = row["capteur_nom"]

        # Ajouter la mesure dans la réponse
        mesure = row["mesure"]

        if logement_nom not in logements:
            logements[logement_nom] = {
                "adresse": logement_adresse,  # Ajouter l'adresse du logement
                "pieces": {}
            }

        if piece_nom not in logements[logement_nom]["pieces"]:
            logements[logement_nom]["pieces"][piece_nom] = []

        logements[logement_nom]["pieces"][piece_nom].append({
            "id": capteur_id,
            "type": capteur_type,
            "nom": row["capteur_nom"],
            "etat": row["etat"],
            "mesure": mesure,
        })

    # Structurer les données pour le frontend
    response = []
    for logement_nom, logement_data in logements.items():
        response.append({
            "nom": logement_nom,
            "adresse": logement_data["adresse"],  # Ajouter l'adresse dans la réponse
            "pieces": [
                {
                    "nom": piece_nom,
                    "capteurs": capteurs
                } for piece_nom, capteurs in logement_data["pieces"].items()
            ]
        })

    return response

@app.get("/api/capteurs/{sensor_id}/mesure")
async def get_mesure(sensor_id: int):
    conn = sqlite3.connect("logement.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    query = """
    SELECT mesure FROM capteur_actionneur WHERE id = ?
    """
    cursor.execute(query, (sensor_id,))
    result = cursor.fetchone()
    conn.close()

    if result:
        return {"mesure": result["mesure"]}
    else:
        raise HTTPException(status_code=404, detail="Capteur non trouvé")

# API pour gérer les types de capteurs
@app.get("/api/types-capteurs")
async def get_types_capteurs():
    conn = sqlite3.connect("logement.db")
    conn.row_factory = sqlite3.Row  # Pour pouvoir accéder aux colonnes par nom
    cursor = conn.cursor()

    # Sélectionner tous les types de capteurs dans la base de données
    cursor.execute("SELECT id, nom FROM types_capteurs")
    types_capteurs = cursor.fetchall()
    conn.close()

    # Retourner les types sous forme de liste de dictionnaires
    return [{"id": row["id"], "nom": row["nom"]} for row in types_capteurs]

# API pour gérer les types de factures
@app.get("/api/logements")
async def get_logements():
    conn = sqlite3.connect("logement.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, nom FROM logement")
    logements = cursor.fetchall()
    conn.close()
    return [{"id": row["id"], "nom": row["nom"]} for row in logements]

@app.get("/api/logements/{id_logement}/pieces")
async def get_pieces_par_logement(id_logement: int):
    conn = sqlite3.connect("logement.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, nom FROM piece WHERE id_logement = ?", (id_logement,))
    pieces = cursor.fetchall()
    conn.close()
    return [{"id": row["id"], "nom": row["nom"]} for row in pieces]

@app.get("/api/types-facture")
async def get_types_facture():
    conn = sqlite3.connect("logement.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, nom FROM type_facture")
    types_facture = cursor.fetchall()
    conn.close()
    return [{"id": row["id"], "nom": row["nom"]} for row in types_facture]




@app.post("/api/piece")
async def add_piece(piece: Piece):
    conn = sqlite3.connect("logement.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO piece (id_logement, nom) VALUES (?, ?)", (piece.id_logement, piece.nom))
    conn.commit()
    conn.close()
    return {"message": "Pièce ajoutée avec succès"}

#Route pour l'evolution de la consommation
@app.get("/api/evolution/{id_logement}")
async def get_evolution(id_logement: int):
    conn = sqlite3.connect("logement.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Récupérer les évolutions mensuelles des consommations
    cursor.execute("""
        SELECT f.mois, 
            SUM(CASE WHEN tf.nom = 'electricite' THEN f.montant ELSE 0 END) AS electricite,
            SUM(CASE WHEN tf.nom = 'eau' THEN f.montant ELSE 0 END) AS eau,
            SUM(CASE WHEN tf.nom = 'gaz' THEN f.montant ELSE 0 END) AS gaz,
            SUM(CASE WHEN tf.nom = 'dechets' THEN f.montant ELSE 0 END) AS dechets,
            SUM(CASE WHEN tf.nom = 'wifi' THEN f.montant ELSE 0 END) AS wifi
        FROM facture f
        JOIN type_facture tf ON f.id_type = tf.id
        WHERE f.id_logement = ?
        GROUP BY f.mois
        ORDER BY f.mois
    """, (id_logement,))
    
    results = cursor.fetchall()
    conn.close()

    # Retourner les résultats sous forme de JSON
    return [{"mois": row["mois"], "electricite": row["electricite"], "eau": row["eau"], "gaz": row["gaz"], "dechets": row["dechets"], "wifi": row["wifi"]} for row in results]

#Route pour les economies
@app.get("/api/economies/{id_logement}")
async def get_economies(id_logement: int):
    conn = sqlite3.connect("logement.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Récupérer les dépenses mensuelles pour chaque logement
    cursor.execute("""
        SELECT f.mois, SUM(f.montant) AS total_facture
        FROM facture f
        WHERE f.id_logement = ?
        GROUP BY f.mois
        ORDER BY f.mois
    """, (id_logement,))

    # Récupérer les résultats des factures mensuelles
    results = cursor.fetchall()

    # Calculer la moyenne annuelle des factures
    total_annuel = sum(row["total_facture"] for row in results)
    moyenne_annuelle = total_annuel / len(results) if results else 0

    # Calculer les économies réalisées par mois
    economies = []
    for row in results:
        economie = row["total_facture"] - moyenne_annuelle  # Différence entre la facture mensuelle et la moyenne annuelle
        economies.append({
            "mois": row["mois"],
            "economie": max(economie, 0)  # Si la différence est négative, on met 0 (pas d'économies)
        })

    conn.close()

    return economies
