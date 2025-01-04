-- Suppression de la table des mesures
DROP TABLE IF EXISTS Mesure;

-- Suppression de la table des capteurs/actionneurs
DROP TABLE IF EXISTS Capteur_Actionneur;

-- Suppression de la table des types de capteurs/actionneurs
DROP TABLE IF EXISTS Type_Capteur_Actionneur;

-- Suppression de la table des pièces
DROP TABLE IF EXISTS Piece;

-- Suppression de la table des factures
DROP TABLE IF EXISTS Facture;

-- Suppression de la table des logements
DROP TABLE IF EXISTS Logement;

-- Table des logements
CREATE TABLE Logement (
    id_logement INTEGER PRIMARY KEY AUTOINCREMENT, --Je donne a chaque logement une id pour les differencier 
    adresse TEXT NOT NULL,
    telephone TEXT,
    adresse_ip TEXT,
    date_insertion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des pièces
CREATE TABLE Piece (
    id_piece INTEGER PRIMARY KEY AUTOINCREMENT,--chaque piece une id 
    nom_piece TEXT NOT NULL,
    coordonnees TEXT,
    id_logement INTEGER,
    FOREIGN KEY (id_logement) REFERENCES Logement(id_logement)
);

-- Table des types de capteurs/actionneurs
CREATE TABLE Type_Capteur_Actionneur (
    id_type INTEGER PRIMARY KEY AUTOINCREMENT,
    nom_type TEXT NOT NULL,
    unite_mesure TEXT,
    precision REAL,
    description TEXT
);

-- Table des capteurs/actionneurs
CREATE TABLE Capteur_Actionneur (
    id_capteur_actionneur INTEGER PRIMARY KEY AUTOINCREMENT,
    reference_commerciale TEXT,
    port_communication TEXT,
    date_insertion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_type INTEGER,
    id_piece INTEGER,
    FOREIGN KEY (id_type) REFERENCES Type_Capteur_Actionneur(id_type),
    FOREIGN KEY (id_piece) REFERENCES Piece(id_piece)
);

-- Table des mesures
CREATE TABLE Mesure (
    id_mesure INTEGER PRIMARY KEY AUTOINCREMENT,
    valeur REAL,
    date_mesure TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_capteur_actionneur INTEGER,
    FOREIGN KEY (id_capteur_actionneur) REFERENCES Capteur_Actionneur(id_capteur_actionneur)
);

-- Table des factures
CREATE TABLE Facture (
    id_facture INTEGER PRIMARY KEY AUTOINCREMENT,
    type_facture TEXT,
    date_facture DATE,
    montant REAL,
    valeur_consommation REAL,
    id_logement INTEGER,
    FOREIGN KEY (id_logement) REFERENCES Logement(id_logement)
);

-- Insertion d'un logement
INSERT INTO Logement (adresse, telephone, adresse_ip) 
VALUES ('123 Avenue de la Republique', '0125487963', '172.168.10.2');

-- Récupération de l'ID du logement inséré
-- Supposons que l'ID généré est 1 (si c'est la première insertion)

-- Insertion de 4 pièces pour ce logement
INSERT INTO Piece (nom_piece, coordonnees, id_logement) VALUES ('Salon', '0,0,0', 1);
INSERT INTO Piece (nom_piece, coordonnees, id_logement) VALUES ('Cuisine', '0,1,0', 1);
INSERT INTO Piece (nom_piece, coordonnees, id_logement) VALUES ('Chambre', '1,0,0', 1);
INSERT INTO Piece (nom_piece, coordonnees, id_logement) VALUES ('Salle de bain', '1,1,0', 1);

-- Insertion de types de capteurs/actionneurs

INSERT INTO Type_Capteur_Actionneur (nom_type, unite_mesure, precision, description) 
VALUES ('Température', '°C', 0.1, 'Capteur de température ambiante');

INSERT INTO Type_Capteur_Actionneur (nom_type, unite_mesure, precision, description) 
VALUES ('Humidité', '%', 0.5, 'Capteur humidité et air');

INSERT INTO Type_Capteur_Actionneur (nom_type, unite_mesure, precision, description) 
VALUES ('Luminosite', 'lux', 0.001, 'Capteur de Luminosite');

INSERT INTO Type_Capteur_Actionneur (nom_type, unite_mesure, precision, description) 
VALUES ('Consommation Électrique', 'kWh', 0.01, 'Capteur de consommation électrique');

-- Insertion de capteurs/actionneurs
-- Insertion d'un capteur de Luminosite dans le Salon (id_piece = 1)
INSERT INTO Capteur_Actionneur (reference_commerciale, port_communication, id_type, id_piece)
VALUES ('LUM11', 'COM1', 3, 1);

-- Insertion d'un capteur de Temperature dans la Cuisine (id_piece = 2)
INSERT INTO Capteur_Actionneur (reference_commerciale, port_communication, id_type, id_piece)
VALUES ('DHT11', 'COM2', 1, 2);

-- Insertion de mesures pour les capteurs/actionneurs

-- Mesures pour le capteur de température (id_capteur_actionneur = 1)
INSERT INTO Mesure (valeur, id_capteur_actionneur) VALUES (22.5, 1);
INSERT INTO Mesure (valeur, id_capteur_actionneur) VALUES (23.0, 1);

-- Mesures pour le capteur de luminosité (id_capteur_actionneur = 3)
INSERT INTO Mesure (valeur, id_capteur_actionneur) VALUES (300, 3);
INSERT INTO Mesure (valeur, id_capteur_actionneur) VALUES (350, 3);

--Insertion de factures

-- Facture d'électricité pour le logement (id_logement = 1)
INSERT INTO Facture (type_facture, date_facture, montant, valeur_consommation, id_logement)
VALUES ('Électricité', '2024-11-01', 50.75, 100.5, 1);

-- Facture d'eau pour le logement (id_logement = 1)
INSERT INTO Facture (type_facture, date_facture, montant, valeur_consommation, id_logement)
VALUES ('Eau', '2024-11-01', 30.00, 25.0, 1);

-- Facture d'Internet pour le logement (id_logement = 1)
INSERT INTO Facture (type_facture, date_facture, montant, valeur_consommation, id_logement)
VALUES ('Internet', '2024-10-15', 15.50, 5.0, 1);

-- Facture d'électricité pour le mois précédent (id_logement = 1)
INSERT INTO Facture (type_facture, date_facture, montant, valeur_consommation, id_logement)
VALUES ('Électricité', '2024-10-01', 48.60, 95.0, 1);

