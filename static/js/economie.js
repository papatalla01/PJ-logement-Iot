document.addEventListener('DOMContentLoaded', () => {
    const logementSelect = document.getElementById('logementSelect');
    const chartContainer = document.getElementById('chartContainer');

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

    // Calculer les économies et afficher le graphique
    function displayEconomiesChart(logementId) {
        fetch(`http://127.0.0.1:8000/api/factures/${logementId}`)
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    console.warn("Aucune donnée de factures disponible pour ce logement.");
                    return;
                }
    
                // Préparer les données pour Google Charts
                const chartData = [['Type', 'Montant (en €)']];
                data.forEach(item => {
                    chartData.push([item.type, item.total]);
                });
    
                const dataTable = google.visualization.arrayToDataTable(chartData);
    
                const options = {
                    title: 'Économies Réalisées par Type de Dépense',
                    hAxis: { title: 'Type de Dépense' },
                    vAxis: { title: 'Montant (en €)' },
                    legend: { position: 'none' },
                    chartArea: { width: '70%', height: '70%' },
                };
    
                // Dessiner le graphique
                const chart = new google.visualization.ColumnChart(document.getElementById('economiesChart'));
                chart.draw(dataTable, options);
            })
            .catch(error => console.error("Erreur lors du chargement des données :", error));
    }
    

    // Écouteur pour le changement de sélection de logement
    logementSelect.addEventListener('change', () => {
        const selectedId = logementSelect.value;
        if (selectedId) {
            displayEconomiesChart(selectedId);
        }
    });

    // Charger les logements au chargement de la page
    loadLogements();
});
