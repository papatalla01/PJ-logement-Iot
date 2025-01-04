# PJ-logement-Iot
Projet Logement Eco Responsable
Gestion de Logements et Consommations 🌟
Ce projet est une application web construite avec FastAPI qui permet de gérer les informations liées aux logements, aux capteurs, aux pièces, aux factures et à la consommation énergétique. L'application fournit une API complète ainsi qu'une interface utilisateur pour interagir avec les données.

📋 Fonctionnalités Principales
Frontend
Pages Web :
index.html : Page d'accueil.
consommation.html : Suivi des consommations par logement.
capteurs.html : Gestion des capteurs et actionneurs.
configuration.html : Configuration des logements et pièces.
economie.html : Suivi des économies réalisées.
Backend
Gestion des Logements :

Ajout, récupération et gestion des logements.
Affichage des détails : pièces, factures et informations regroupées.
Gestion des Factures :

Ajout et suivi des factures.
Consultation des montants par type et par mois.
Gestion des Capteurs :

Ajout, consultation et basculement des états des capteurs.
Regroupement des capteurs par logement et par pièce.
Statistiques & Évolutions :

Évolution des consommations mensuelles (électricité, eau, gaz, etc.).
Calcul des économies réalisées par rapport à la moyenne annuelle.

Pour Lancer le serveur :
uvicorn main:app --reload

📂 Structure du Projet
bash
Copier le code
/static               # Fichiers CSS, JS et images 
main.py               # Fichier principal contenant l'API et les routes
index.html            # Page d'accueil HTML
consommation.html     # Page pour la gestion des consommations
capteurs.html         # Page pour la gestion des capteurs
configuration.html    # Page pour la configuration des logements
economie.html         # Page pour les économies réalisées
logement.db           # Base de données SQLite
logement.sql          # Fichier sql pour créer les tables de la base de données

🧪 API Endpoints
Logements
GET /api/logements : Récupère tous les logements.
POST /api/logement : Ajoute un nouveau logement.
GET /api/logements/{id_logement} : Détails d'un logement (pièces, factures).
Factures
GET /api/factures/{id_logement} : Factures pour un logement donné.
POST /api/facture : Ajout d'une facture.
GET /api/evolution/{id_logement} : Évolution des consommations.
Capteurs
GET /api/capteurs : Liste des capteurs.
POST /api/capteurs/{capteur_id}/toggle : Bascule l'état d'un capteur.
Types
GET /api/types-capteurs : Liste des types de capteurs.
GET /api/types-facture : Liste des types de factures.

🎨 Sources & Contributions
 le site w3schools et ChatGPT pour apprendre les syntaxes html js et css 
 Copie de templates de sites 
 Collaboration de camarades et des encadrant sur certains bugs 

