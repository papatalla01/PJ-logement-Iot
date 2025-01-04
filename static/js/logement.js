document.addEventListener('DOMContentLoaded', () => {
    const logementList = document.getElementById('logementList');

    // Charger les logements
    function loadLogements() {
        fetch("http://127.0.0.1:8000/api/logements")
            .then(response => response.json())
            .then(data => {
                logementList.innerHTML = ''; // Effacer les anciens contenus

                // Créer une ligne pour contenir plusieurs maisons
                let row;
                
                data.forEach((logement, index) => {
                    if (index % 3 === 0) {
                        // Créer une nouvelle ligne après chaque 3 maisons
                        row = document.createElement('div');
                        row.classList.add('row', 'mb-4');
                        logementList.appendChild(row);
                    }

                    const logementItem = document.createElement('div');
                    logementItem.classList.add('col-md-4'); // Pour 3 maisons par ligne

                    const card = document.createElement('div');
                    card.classList.add('card', 'shadow-sm', 'border-light');
                    
                    // Image du logement (si disponible)
                    const cardImg = document.createElement('img');
                    cardImg.classList.add('card-img-top');
                    cardImg.src = logement.image || '/static/images/maison.png'; // Image par défaut si aucune image
                    cardImg.alt = `${logement.nom}`;

                    // Corps de la carte
                    const cardBody = document.createElement('div');
                    cardBody.classList.add('card-body');

                    // Titre et adresse
                    const cardTitle = document.createElement('h5');
                    cardTitle.classList.add('card-title');
                    cardTitle.textContent = logement.nom;

                    const cardAddress = document.createElement('p');
                    cardAddress.classList.add('card-text', 'text-muted');
                    cardAddress.textContent = logement.adresse;

                    // Nombre de pièces avec une icône
                    const cardPieces = document.createElement('p');
                    cardPieces.classList.add('text-secondary');
                    cardPieces.innerHTML = `<i class="bi bi-house-door"></i> ${logement.nb_pieces} pièces`;

                    // Bouton pour afficher/masquer les détails
                    const detailsButton = document.createElement('button');
                    detailsButton.textContent = "Afficher les détails";
                    detailsButton.classList.add('btn', 'btn-primary', 'btn-sm', 'mt-3');

                    // Conteneur pour les détails
                    const detailsDiv = document.createElement('div');
                    detailsDiv.classList.add('mt-3', 'details-container');
                    detailsDiv.style.display = 'none'; // Masqué par défaut

                    detailsButton.addEventListener('click', () => {
                        if (detailsDiv.style.display === 'none') {
                            if (detailsDiv.innerHTML === '') {
                                loadDetails(logement.id, detailsDiv);
                            }
                            detailsDiv.style.display = 'block';
                            detailsButton.textContent = "Masquer les détails";
                        } else {
                            detailsDiv.style.display = 'none';
                            detailsButton.textContent = "Afficher les détails";
                        }
                    });

                    // Ajout des éléments dans la carte
                    cardBody.appendChild(cardTitle);
                    cardBody.appendChild(cardAddress);
                    cardBody.appendChild(cardPieces);
                    cardBody.appendChild(detailsButton);
                    cardBody.appendChild(detailsDiv);

                    card.appendChild(cardImg);
                    card.appendChild(cardBody);

                    logementItem.appendChild(card);
                    row.appendChild(logementItem);
                });
            })
            .catch(error => console.error("Erreur lors du chargement des logements :", error));
    }

    // Charger les détails d'un logement (seulement les pièces)
    function loadDetails(logementId, detailsContainer) {
        fetch(`http://127.0.0.1:8000/api/logements/${logementId}`)
            .then(response => response.json())
            .then(data => {
                console.log("Données du logement pour ID " + logementId, data); // Débogage : voir les données dans la console

                // Charger les pièces
                const piecesList = document.createElement('ul');
                piecesList.classList.add('list-group', 'mt-3');
                piecesList.innerHTML = '<li class="list-group-item active">Pièces</li>';
                data.pieces.forEach(piece => {
                    const pieceItem = document.createElement('li');
                    pieceItem.textContent = piece.nom;
                    pieceItem.classList.add('list-group-item');
                    piecesList.appendChild(pieceItem);
                });

                detailsContainer.appendChild(piecesList);
            })
            .catch(error => console.error("Erreur lors du chargement des détails :", error));
    }

    // Charger les logements au démarrage
    loadLogements();
});
