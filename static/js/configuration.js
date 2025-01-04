document.addEventListener('DOMContentLoaded', () => {
    const addLogementForm = document.getElementById('addLogementForm');
    const addPieceForm = document.getElementById('addPieceForm');
    const addCapteurForm = document.getElementById('addCapteurForm');
    const addFactureForm = document.getElementById('addFactureForm');
    const addFactureTypeButton = document.getElementById('addFactureType');
    const logementPieceSelect = document.getElementById('logementPiece');
    const capteurLogementSelect = document.getElementById('capteurLogement');
    const capteurPieceSelect = document.getElementById('capteurPiece');
    const capteurTypeSelect = document.getElementById('capteurType');
    const factureLogementSelect = document.getElementById('factureLogement');
    const factureTypeSelect = document.getElementById('factureType');

    // Charger les logements pour les formulaires
    function loadLogementsForSelects() {
        fetch("http://127.0.0.1:8000/api/logements")
            .then(response => response.json())
            .then(data => {
                // Charger les logements pour les pièces
                logementPieceSelect.innerHTML = '<option value="" disabled selected>Choisir un logement</option>';
                capteurLogementSelect.innerHTML = '<option value="" disabled selected>Choisir un logement</option>';
                factureLogementSelect.innerHTML = '<option value="" disabled selected>Choisir un logement</option>';

                data.forEach(logement => {
                    const option = document.createElement('option');
                    option.value = logement.id;
                    option.textContent = logement.nom;

                    logementPieceSelect.appendChild(option);
                    capteurLogementSelect.appendChild(option.cloneNode(true));
                    factureLogementSelect.appendChild(option.cloneNode(true));
                });
            })
            .catch(error => console.error("Erreur lors du chargement des logements :", error));
    }

    // Charger les pièces pour les capteurs
    function loadPiecesForCapteurs(logementId) {
        fetch(`http://127.0.0.1:8000/api/logements/${logementId}/pieces`)
            .then(response => response.json())
            .then(data => {
                capteurPieceSelect.innerHTML = '<option value="" disabled selected>Choisir une pièce</option>';
                data.forEach(piece => {
                    const option = document.createElement('option');
                    option.value = piece.id;
                    option.textContent = piece.nom;
                    capteurPieceSelect.appendChild(option);
                });
            })
            .catch(error => console.error("Erreur lors du chargement des pièces :", error));
    }

    // Charger les types de factures
    function loadFactureTypes() {
        fetch("http://127.0.0.1:8000/api/types-facture")
            .then(response => response.json())
            .then(data => {
                factureTypeSelect.innerHTML = '<option value="" disabled selected>Choisir un type</option>';
                data.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.id;
                    option.textContent = type.nom;
                    factureTypeSelect.appendChild(option);
                });
            })
            .catch(error => console.error("Erreur lors du chargement des types de facture :", error));
    }
    
    // Charger les types de capteurs pour le formulaire
    function loadCapteurTypes() {
        fetch("http://127.0.0.1:8000/api/types-capteurs")
            .then(response => response.json())
            .then(data => {
                const capteurTypeSelect = document.getElementById('capteurType');
                capteurTypeSelect.innerHTML = '<option value="" disabled selected>Choisir un type de capteur</option>';
    
                // Ajouter les types au select
                data.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.id;  // On utilise l'ID du type pour l'option value
                    option.textContent = type.nom;  // Affiche le nom du type dans le texte de l'option
                    capteurTypeSelect.appendChild(option);
                });
            })
            .catch(error => console.error("Erreur lors du chargement des types de capteurs :", error));
    }
    
    // Charger les types de capteurs au démarrage
    document.addEventListener('DOMContentLoaded', function() {
        loadCapteurTypes(); // Appel de la fonction de chargement des types
    });



    // Ajouter un logement
    addLogementForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const nom = document.getElementById('nomLogement').value;
        const adresse = document.getElementById('adresseLogement').value;

        fetch("http://127.0.0.1:8000/api/logement", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nom, adresse })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadLogementsForSelects();
        })
        .catch(error => console.error("Erreur :", error));
    });

    // Ajouter une pièce
    addPieceForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const logementId = logementPieceSelect.value;
        const nom = document.getElementById('nomPiece').value;

        fetch("http://127.0.0.1:8000/api/piece", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_logement: logementId, nom })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => console.error("Erreur :", error));
    });


    // Ajouter un capteur
    addCapteurForm.addEventListener('submit', function (e) {
        e.preventDefault();
    
        const logementId = capteurLogementSelect.value;
        const pieceId = capteurPieceSelect.value;
        const nom = document.getElementById('capteurNom').value;
        const type = document.getElementById('capteurType').value;  // Inclure le type sélectionné
    
        // Vérifier que tous les champs requis sont remplis
        if (!logementId || !pieceId || !nom || !type) {
            alert("Veuillez remplir tous les champs requis.");
            return;
        }
    
        // Requête POST pour ajouter un capteur
        fetch("http://127.0.0.1:8000/api/capteurs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_logement: logementId,
                id_piece: pieceId,
                type: type,  // Inclure le type sélectionné
                nom: nom,
                etat: "actif"  // État par défaut
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur lors de l'ajout du capteur");
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);  // Afficher un message de succès
        })
        .catch(error => console.error("Erreur :", error));
    });
    
    // Charger les types de capteurs au démarrage
    document.addEventListener('DOMContentLoaded', () => {
        loadCapteurTypes();
    });

    // Ajouter une facture
    addFactureForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const logementId = factureLogementSelect.value;
        const typeId = factureTypeSelect.value;
        const montant = document.getElementById('factureMontant').value;

        fetch("http://127.0.0.1:8000/api/facture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_logement: logementId, id_type: typeId, montant })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => console.error("Erreur :", error));
    });

    // Ajouter un type de facture via le bouton "+"
    addFactureTypeButton.addEventListener('click', function () {
        const nom = prompt("Entrez le nom du type de facture :");
        if (nom) {
            fetch("http://127.0.0.1:8000/api/type-facture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nom })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                loadFactureTypes();
            })
            .catch(error => console.error("Erreur :", error));
        }
    });

    // Écouteur pour charger les pièces en fonction du logement sélectionné dans l'ajout de capteur
    capteurLogementSelect.addEventListener('change', function () {
        const logementId = this.value;
        loadPiecesForCapteurs(logementId);
    });

    // Charger les données au démarrage
    loadLogementsForSelects();
    loadFactureTypes();
});
