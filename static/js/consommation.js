document.addEventListener('DOMContentLoaded', () => {
    const logementSelect = document.getElementById('logementSelect');
    const chartContainer = document.getElementById('chartContainer');
    const evolutionChartContainer = document.getElementById('evolutionChartContainer');
    const individualChartsContainer = document.getElementById('individualChartsContainer');

    // Charger les logements dans le sélecteur
    function loadLogements() {
        fetch("http://127.0.0.1:8000/api/logements")
            .then(response => response.json())
            .then(data => {
                logementSelect.innerHTML = '<option value="" disabled selected>Choisir un logement</option>';
                data.forEach(logement => {
                    const option = document.createElement('option');
                    option.value = logement.id;
                    option.textContent = logement.nom;
                    logementSelect.appendChild(option);
                });
            })
            .catch(error => console.error("Erreur lors du chargement des logements :", error));
    }

    // Fonction pour formater les mois de manière abrégée (jan, fév, mar, etc.)
    function formatMonth(month) {
        const monthsAbbr = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
        return monthsAbbr[month - 1]; // Pour une date comme "2024-01", cela renverra "jan"
    }

    // Afficher le graphique pour un logement donné
    function displayChart(logementId) {
        fetch(`http://127.0.0.1:8000/api/factures/${logementId}`)
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    chartContainer.style.display = 'none';
                    console.warn("Aucune donnée disponible pour ce logement.");
                    return;
                }

                chartContainer.style.display = 'block';

                const chartData = [['Type', 'Montant']];
                data.forEach(item => {
                    chartData.push([item.type, item.total]);
                });

                const dataTable = google.visualization.arrayToDataTable(chartData);

                const options = {
                    title: 'Répartition des Montants des Factures',
                    pieHole: 0.4,
                    chartArea: { width: '80%', height: '80%' },
                };

                const chart = new google.visualization.PieChart(document.getElementById('piechart'));
                chart.draw(dataTable, options);
            })
            .catch(error => console.error("Erreur lors du chargement des données pour le graphique :", error));
    }

    // Afficher les graphiques individuels pour chaque type
    function displayIndividualCharts(logementId) {
        fetch(`http://127.0.0.1:8000/api/logements/${logementId}`)
            .then(response => response.json())
            .then(data => {
                if (!data.factures || Object.keys(data.factures).length === 0) {
                    individualChartsContainer.style.display = 'none';
                    console.warn("Aucune donnée disponible pour les graphiques individuels.");
                    return;
                }

                // Configurer une disposition en grille pour deux graphiques par ligne
                individualChartsContainer.style.display = 'grid';
                individualChartsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
                individualChartsContainer.style.gap = '20px';
                individualChartsContainer.innerHTML = '';

                const types = ['Déchets', 'Eau', 'Gaz', 'WiFi', 'Électricité'];

                // Couleurs plus discrètes pour chaque graphique
                const colors = ['#8fa3b1', '#a5c9a0', '#d0b4ff', '#ffb3b3', '#c9d9e1'];

                types.forEach((type, index) => {
                    const chartDiv = document.createElement('div');
                    chartDiv.id = `${type.toLowerCase()}Chart`;
                    chartDiv.style.height = '300px';
                    individualChartsContainer.appendChild(chartDiv);

                    const chartData = [['Mois', type]];
                    for (const [mois, factures] of Object.entries(data.factures)) {
                        const date = new Date(mois); // Créer un objet Date à partir de la date
                        const month = formatMonth(date.getMonth() + 1); // Extraire le mois sous forme abrégée
                        const facture = factures.find(f => f.type.toLowerCase() === type.toLowerCase());
                        const total = facture ? facture.total : 0;
                        chartData.push([month, total]); // Utiliser le mois formatté
                    }

                    const dataTable = google.visualization.arrayToDataTable(chartData);

                    const options = {
                        title: `Consommation Mensuelle - ${type}`,
                        hAxis: { title: 'Mois', slantedText: true },
                        vAxis: { title: 'Montant (€)' },
                        legend: { position: 'none' },
                        colors: [colors[index]], // Applique la couleur spécifique pour chaque graphique
                        chartArea: { width: '70%', height: '70%' },
                    };

                    const chart = new google.visualization.ColumnChart(chartDiv);
                    chart.draw(dataTable, options);
                });
            })
            .catch(error => console.error("Erreur lors du chargement des graphiques individuels :", error));
    }

    // Écouteur pour le changement de sélection de logement
    logementSelect.addEventListener('change', () => {
        const selectedId = logementSelect.value;
        if (selectedId) {
            displayChart(selectedId);
            displayIndividualCharts(selectedId);
        }
    });

    // Charger les logements au chargement de la page
    google.charts.load('current', { 'packages': ['corechart'] });
    loadLogements();
});
