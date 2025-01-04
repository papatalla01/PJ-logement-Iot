// scripts.js

// Exemple de graphique de consommation avec Chart.js
const ctx = document.getElementById('consumptionChart');

if (ctx) {
    const consumptionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Électricité', 'Eau', 'Déchets'],
            datasets: [{
                label: 'Consommation (kWh)',
                data: [120, 80, 30],
                backgroundColor: ['#007bff', '#28a745', '#ffc107'],
                borderColor: ['#0056b3', '#1e7e34', '#d39e00'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Ajout d'un comportement interactif sur les boutons
const buttons = document.querySelectorAll('.btn-primary');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        alert('Vous avez cliqué sur un bouton !');
    });
});

// Ajouter la classe active à la page en cours
document.addEventListener('DOMContentLoaded', () => {
    const currentLocation = window.location.pathname.replace(/\/$/, ""); // Supprimer le / final
    const menuItems = document.querySelectorAll('.navbar-nav .nav-link');

    menuItems.forEach(item => {
        const itemPath = item.getAttribute('href').replace(/\/$/, ""); // Supprimer le / final
        if (itemPath === currentLocation) {
            item.classList.add('active'); // Ajouter la classe active au lien correspondant
        } else {
            item.classList.remove('active'); // Retirer des autres liens
        }
    });

    // Log pour vérifier si le fetch commence
    console.log("Fetching data from /api/capteurs...");

    fetch("http://127.0.0.1:8000/api/capteurs")
        .then(response => {
            // Log pour vérifier la réponse brute
            console.log("Response status:", response.status);
            return response.json();
        })
        .then(data => {
            console.log("Data received:", data); // Log des données reçues
            const list = document.getElementById('sensorList');
            list.innerHTML = ''; // Effacer les anciennes données
            data.forEach(sensor => {
                const item = document.createElement('li');
                item.textContent = `ID: ${sensor.id}, Référence: ${sensor.reference}, Date: ${sensor.date_insertion}`;
                item.classList.add('list-group-item');
                list.appendChild(item);
            });
        })
        .catch(error => console.error("Erreur lors du chargement des capteurs :", error));
        
    });

// Charger Google Charts
console.log("Chargement de Google Charts...");
google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    console.log("Tentative de récupération des données...");
    fetch("http://127.0.0.1:8000/api/facture-montants")
        .then(response => {
            console.log("Statut de la réponse :", response.status);
            return response.json();
        })
        .then(data => {
            console.log("Données reçues :", data);
            const chartData = [['Type', 'Montant']];
            data.forEach(item => {
                chartData.push([item.type, item.montant]);
            });

            var dataTable = google.visualization.arrayToDataTable(chartData);

            var options = {
                title: 'Répartition des Montants des Factures',
                pieHole: 0.4,
                chartArea: { width: '80%', height: '80%' }
            };

            var chart = new google.visualization.PieChart(document.getElementById('piechart'));
            chart.draw(dataTable, options);
        })
        .catch(error => console.error("Erreur lors du chargement des données :", error));
}

document.addEventListener('DOMContentLoaded', () => {
    const logementSelect = document.getElementById('logementSelect');
    const chartContainer = document.getElementById('chartContainer');

    // Charger les logements
    /*fetch("http://127.0.0.1:8000/api/logements")
        .then(response => response.json())
        .then(data => {
            data.forEach(logement => {
                const option = document.createElement('option');
                option.value = logement.id;
                option.textContent = logement.nom;
                logementSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Erreur lors du chargement des logements :", error));
    */
    // Charger les données de consommation lorsque le logement est sélectionné
    logementSelect.addEventListener('change', () => {
        const logementId = logementSelect.value;

        fetch(`http://127.0.0.1:8000/api/factures/${logementId}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    chartContainer.style.display = 'block';

                    // Charger Google Charts
                    google.charts.load('current', { 'packages': ['corechart'] });
                    google.charts.setOnLoadCallback(() => {
                        const chartData = [['Type', 'Montant']];
                        data.forEach(item => {
                            chartData.push([item.type, item.total]);
                        });

                        const chart = new google.visualization.PieChart(document.getElementById('piechart'));
                        const options = {
                            title: 'Répartition des Montants des Factures'
                        };
                        chart.draw(google.visualization.arrayToDataTable(chartData), options);
                    });
                } else {
                    chartContainer.style.display = 'none';
                    alert("Aucune donnée disponible pour ce logement.");
                }
            })
            .catch(error => console.error("Erreur lors du chargement des factures :", error));
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Fonction pour gérer le changement d'état
    function toggleCapteur(id, button) {
        fetch(`http://127.0.0.1:8000/api/capteurs/${id}/toggle`, {
            method: "POST"
        })
        .then(response => response.json())
        .then(data => {
            if (data.new_state) {
                // Mettre à jour dynamiquement l'affichage du bouton
                button.textContent = data.new_state === "actif" ? "Actif" : "Inactif";
                button.className = data.new_state === "actif" ? "btn btn-success" : "btn btn-danger";
            } else {
                console.error("Erreur :", data.error);
            }
        })
        .catch(error => console.error("Erreur lors de la mise à jour de l'état :", error));
    }

    // Ajouter des gestionnaires d'événements à chaque bouton
    document.querySelectorAll('.toggle-button').forEach(button => {
        button.addEventListener('click', () => {
            const capteurId = button.dataset.id; // Récupérer l'ID du capteur
            toggleCapteur(capteurId, button); // Appeler la fonction de basculee
        });
    });
});
