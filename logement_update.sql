--TIMESTAMP DEFAULT CURRENT_TIMESTAMP

-- Suppression de toutes les tables de la base de données
DROP TABLE IF EXISTS logement;
DROP TABLE IF EXISTS piece;
DROP TABLE IF EXISTS capteur_actionneur;
DROP TABLE IF EXISTS type_capteur_actionneur;
DROP TABLE IF EXISTS mesure;
DROP TABLE IF EXISTS facture;

-- Supprimer les données existantes pour repartir à neuf
DELETE FROM mesure;
DELETE FROM facture;
DELETE FROM capteur_actionneur;
DELETE FROM piece;
DELETE FROM logement;
DELETE FROM type_facture;
DELETE FROM type_capteur_actionneur;

-- Ajouter les propriétaires et leurs logements
INSERT INTO logement (id, nom, adresse) VALUES
(1, 'Papa Talla DIOUM', 'Dakar, Sénégal'),
(2, 'Ayoub LADJICI', 'Alger, Algérie'),
(3, 'Marrion SETH', 'Paris, France'),
(4, 'Ilyes AMSAL', 'Casablanca, Maroc'),
(5, 'Nadir KAREM', 'Tunis, Tunisie');

-- Ajouter des pièces pour chaque logement
INSERT INTO piece (id, id_logement, nom) VALUES
(1, 1, 'Salon'),
(2, 1, 'Cuisine'),
(3, 2, 'Chambre'),
(4, 2, 'Salle de bain'),
(5, 3, 'Salon'),
(6, 3, 'Terrasse'),
(7, 4, 'Bureau'),
(8, 4, 'Cuisine'),
(9, 5, 'Salon'),
(10, 5, 'Garage');

-- Ajouter des types de capteurs/actionneurs
INSERT INTO type_capteur_actionneur (id, nom) VALUES
(1, 'Capteur de température'),
(2, 'Capteur de mouvement'),
(3, 'Détecteur de fumée'),
(4, 'Capteur de lumière'),
(5, 'Actionneur de porte');

-- Ajouter des capteurs/actionneurs dans les pièces
INSERT INTO capteur_actionneur (id, nom, port_communication, etat, id_piece, id_logement, id_type) VALUES
(1, 'ThermoSalon', 'COM1', 'actif', 1, 1, 1),
(2, 'MouvementCuisine', 'COM2', 'inactif', 2, 1, 2),
(3, 'FuméeChambre', 'COM3', 'actif', 3, 2, 3),
(4, 'LumièreSalleDeBain', 'COM4', 'inactif', 4, 2, 4),
(5, 'PortGarage', 'COM5', 'actif', 10, 5, 5);

-- Ajouter des types de factures
INSERT INTO type_facture (id, nom) VALUES
(1, 'Électricité'),
(2, 'Eau'),
(3, 'Gaz'),
(4, 'Déchets'),
(5, 'Internet');

-- Ajouter des factures pour chaque logement
INSERT INTO facture (id, mois, montant, id_logement, id_type) VALUES
(1, '2025-01', 15000, 1, 1),
(2, '2025-01', 5000, 1, 2),
(3, '2025-01', 7000, 2, 3),
(4, '2025-01', 3000, 3, 4),
(5, '2025-01', 10000, 4, 5),
(6, '2025-02', 14000, 1, 1),
(7, '2025-02', 6000, 2, 2),
(8, '2025-02', 8000, 3, 3),
(9, '2025-02', 4000, 4, 4),
(10, '2025-02', 12000, 5, 5);

-- Ajouter des mesures pour les capteurs
INSERT INTO mesure (id, id_capteur_actionneur, valeur, date) VALUES
(1, 1, 25.5, '2025-01-01 10:00:00'),
(2, 2, 1, '2025-01-01 11:00:00'),
(3, 3, 0, '2025-01-01 12:00:00'),
(4, 4, 350, '2025-01-01 13:00:00'),
(5, 5, 1, '2025-01-01 14:00:00');
