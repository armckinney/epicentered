// Epicentered
// Author: Andrew McKinney
// Creation Date: 3/21/2020

// DEV TOOLS //

// Data Timeframe ('hour', 'day, 'week','month')
tf = 'day'

urlQuake = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_${tf}.geojson`


// Creating map object
var myMap = L.map("map", {
    center: [40.0, -100.0],
    zoom: 4
  });

  // Adding tile layer to the map
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\">CARTO</a>",
    subdomains: "abcd",
    maxZoom: 20
  }).addTo(myMap);


optionMag = ['0-1', '1-2', '2-3', '3-4', '4-5', '5+', 'NA']
optionColor = ['rgb(0, 225, 0)','rgb(0, 175, 0)','rgb(225, 225, 0)','rgb(255, 180, 0)','rgb(255, 80, 0)','rgb(180, 0, 0)','rgb(180, 0, 180)']


// Marker Color Selector
function selectMagColor(magnitude) {
    if (magnitude <= 1) {return optionColor[0]}
    else if (magnitude <= 2)  {return optionColor[1]}
    else if (magnitude <= 3)  {return optionColor[2]}
    else if (magnitude <= 4)  {return optionColor[3]}
    else if (magnitude <= 5)  {return optionColor[4]}
    else if (magnitude <= 10) {return optionColor[5]}
    else {return optionColor[6]}
}

// Feature Sort Function (Largest to Smallest)
function sortFeatures(a, b) {
    magA = a.properties.mag
    magB = b.properties.mag
    comparison = 0
    return ((magA < magB) ? 1 : -1)
}


// useful data: title, mag, place, time, alert, felt, cdi, mmi, tsunami, sig

// Grabbing API data
d3.json(urlQuake, function(dataQuake) {
    console.log(dataQuake)

    // Defining dataset features
    featuresQuake = dataQuake.features

    // Sorting features (so smallest events will be on top/clickable)
    featuresQuake.sort(sortFeatures)

    // Looping through features to create event markers
    featuresQuake.forEach(features => {
        
        latitude = features.geometry.coordinates[1]
        longitude = features.geometry.coordinates[0]
        idQuake = features.properties.code
        mag = features.properties.mag
        place = features.properties.place
        time = features.properties.time
        // Convert UTC timestamp to readable date
        readableTime = new Date(time).toLocaleString()
        alertStatus = features.properties.alert
        significance = features.properties.sig

        // creating circle marker per event
        var circle = L.circle([latitude, longitude], {
            color: 'black',
            weight: 0.5,
            fillColor: selectMagColor(mag),
            fillOpacity: 0.5,
            radius: mag**2 * 5000
        }).addTo(myMap)

        // Binding Popup Information to each marker
        circle.bindPopup(
            `<h2><center> ${idQuake} </center></h2>
            <hr>
            <p>
            Place: ${place}
            <br>
            Time: ${readableTime}
            <br>
            Magnitude: ${mag}
            <br>
            Significance: ${significance}
            <br>
            Alert Status: ${alertStatus}
            </p>`
            )

        // Applying mouse hover opacity darken to each marker
        circle.on({
            mouseover: function(event) {
                layer = event.target
                layer.setStyle({
                    fillOpacity: 0.9
                })
            },
            mouseout: function(event) {
                layer = event.target;
                layer.setStyle({
                fillOpacity: 0.5
                })
            }
        })
    })

    // Set up the legend
    var legend = L.control({ position: "bottomright" })

    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend")
        var limits = optionMag
        var colors = optionColor
        var labels = []

        var legendInfo =
            `<div class="labels" style="background-color: grey"></div>`

        div.innerHTML = legendInfo

        limits.forEach(function(limit, index) {
            labels.push(`<p style="background-color: ${colors[index]}">   ${limit}   </p>`)
        })

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div
    }

        // Adding legend to the map
        legend.addTo(myMap)

})
