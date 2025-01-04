document.addEventListener('DOMContentLoaded', () => {
    const sensorList = document.getElementById('sensorList');

    // Charger les capteurs regroupés par logement et pièce
    function loadSensors() {
        fetch("http://127.0.0.1:8000/api/capteurs-groupes")
            .then(response => response.json())
            .then(data => {
                sensorList.innerHTML = ''; // Effacer les anciennes données

                data.forEach(logement => {
                    // Créer une carte pour le logement
                    const logementCard = document.createElement('div');
                    logementCard.classList.add('col-md-6', 'mb-4');

                    const card = document.createElement('div');
                    card.classList.add('card', 'shadow-sm', 'border-light');

                    // Image du logement
                    const cardImg = document.createElement('img');
                    cardImg.classList.add('card-img-top');
                    cardImg.src = logement.image || '/static/images/maison.png';
                    cardImg.alt = `Image de ${logement.nom}`;

                    // Corps de la carte
                    const cardBody = document.createElement('div');
                    cardBody.classList.add('card-body');

                    // Titre du logement
                    const cardTitle = document.createElement('h5');
                    cardTitle.classList.add('card-title', 'text-success');
                    cardTitle.textContent = logement.nom;
                    cardBody.appendChild(cardTitle);

                    // Affichage de l'adresse du logement
                    const cardAddress = document.createElement('p');
                    cardAddress.classList.add('text-muted', 'small');
                    cardAddress.textContent = `Adresse : ${logement.adresse || 'Non spécifiée'}`;
                    cardBody.appendChild(cardAddress);

                    // Liste des capteurs par pièce
                    logement.pieces.forEach(piece => {
                        const pieceTitle = document.createElement('h6');
                        pieceTitle.classList.add('text-secondary', 'mt-3');
                        pieceTitle.textContent = piece.nom;
                        cardBody.appendChild(pieceTitle);

                        // Assurez-vous que chaque capteur est bien lié à la pièce correspondante
                        piece.capteurs.forEach(sensor => {
                            const sensorItem = document.createElement('div');
                            sensorItem.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-2', 'border-bottom', 'pb-2');

                            const sensorInfo = document.createElement('div');

                            // Nom du capteur
                            const sensorName = document.createElement('span');
                            sensorName.classList.add('fw-bold');
                            sensorName.textContent = sensor.nom;
                            sensorInfo.appendChild(sensorName);

                            // Mesure du capteur ou "pas de mesure" si inactif
                            const sensorMeasure = document.createElement('div');
                            sensorMeasure.classList.add('text-muted', 'small');
                            const mesureText = sensor.etat === 'actif' ? `Mesure : ${sensor.mesure}` : 'Mesure : pas de mesure';
                            sensorMeasure.textContent = mesureText;
                            sensorInfo.appendChild(sensorMeasure);

                            sensorItem.appendChild(sensorInfo);

                            // Bouton On/Off
                            const toggleButton = document.createElement('button');
                            toggleButton.textContent = sensor.etat === 'actif' ? 'On' : 'Off';
                            toggleButton.classList.add('btn', sensor.etat === 'actif' ? 'btn-success' : 'btn-danger');
                            toggleButton.addEventListener('click', () => {
                                toggleSensorState(sensor.id, toggleButton, sensorMeasure);
                            });
                            sensorItem.appendChild(toggleButton);

                            cardBody.appendChild(sensorItem);
                        });
                    });

                    card.appendChild(cardImg);
                    card.appendChild(cardBody);
                    logementCard.appendChild(card);
                    sensorList.appendChild(logementCard);
                });
            })
            .catch(error => console.error("Erreur lors du chargement des capteurs :", error));
    }

    // Changer l'état d'un capteur
    function toggleSensorState(sensorId, button, sensorMeasure) {
        const newState = button.textContent === 'On' ? 'inactif' : 'actif';
        fetch(`http://127.0.0.1:8000/api/capteurs/${sensorId}/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ etat: newState })
        })
        .then(response => {
            if (response.ok) {
                // Mettre à jour dynamiquement le bouton
                button.textContent = newState === 'actif' ? 'On' : 'Off';
                button.classList.toggle('btn-success', newState === 'actif');
                button.classList.toggle('btn-danger', newState === 'inactif');
                
                // Mettre à jour la mesure en fonction de l'état du capteur
                if (newState === 'actif') {
                    // Récupérer la mesure actuelle depuis l'API
                    fetch(`http://127.0.0.1:8000/api/capteurs/${sensorId}/mesure`)
                        .then(response => response.json())
                        .then(data => {
                            // Afficher la mesure dans le capteur
                            sensorMeasure.textContent = `Mesure : ${data.mesure}`;
                        })
                        .catch(error => console.error("Erreur lors de la récupération de la mesure :", error));
                } else {
                    sensorMeasure.textContent = 'Mesure : pas de mesure';
                }
            } else {
                throw new Error("Erreur lors de la mise à jour de l'état du capteur");
            }
        })
        .catch(error => console.error("Erreur :", error));
    }

    // Charger les capteurs au démarrage
    loadSensors();
});
