// Create a map instance
const map = L.map('map').setView([0, 0], 2);

// Definie the colorScale and depthRange variables
const depthRange = [0, 700]; 
const colorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain(depthRange);


// Add a tile layer (you can use different map providers)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Fetch USGS earthquake data
// Function to map depth to color using a gradient scale
function depthToColor(depth) {
    // Map depth to color
    return colorScale(depth);
}

// Fetch GeoJSON earthquake data using D3.js
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson')
    .then(data => {
        // Loop through earthquake data and create markers
        data.features.forEach(feature => {
            const coords = feature.geometry.coordinates;
            const magnitude = feature.properties.mag;
            const depth = coords[2]; // Depth in kilometers
            const title = feature.properties.title;

            // Calculate marker size based on magnitude
            const markerSize = magnitude * 5;

            // Create a marker for each earthquake
            const marker = L.circleMarker([coords[1], coords[0]], {
                radius: markerSize,
                fillColor: depthToColor(depth), // Set the marker color based on depth
                color: 'black', // Border color
                weight: 1, // Border weight
                opacity: 1, // Border opacity
                fillOpacity: 0.7, // Fill opacity
            }).addTo(map);

            marker.bindPopup(`Magnitude: ${magnitude}<br>Depth: ${depth} km<br>${title}`);
        });
    })
    .catch(error => console.error('Error fetching earthquake data:', error));

    // Function to create the legend
function createLegend(colorScale, depthRange) {
    const legend = d3.select("#legend");

    const legendData = d3.range(depthRange[0], depthRange[1] + 1, (depthRange[1] - depthRange[0]) / 5); // Divide the depth range into 5 intervals

    const legendItems = legend.selectAll(".legend-item")
        .data(legendData)
        .enter().append("div")
        .attr("class", "legend-item");

    legendItems.append("div")
        .attr("class", "legend-color-box")
        .style("background-color", d => colorScale(d));

    legendItems.append("div")
        .text(d => `${d} km`);
}

// Call the createLegend function after fetching earthquake data and creating the map
// Ensure that it's called when the map and color scale are ready
createLegend(colorScale, depthRange);

// Listen for the 'zoomend' event on the map
map.on('zoomend', () => {
    const currentZoom = map.getZoom();

    // Check the current zoom level and adjust the legend position accordingly
    if (currentZoom < 5) {
        // Move the legend to the top left corner when zoomed out
        legend.style.left = '20px';
        legend.style.top = '20px';
    } else {
        // Move the legend to a different position when zoomed in
        legend.style.left = '20px'; // Adjust these values to your desired position
        legend.style.top = '100px';
    }
});
