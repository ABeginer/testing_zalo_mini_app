import React, { useState, useEffect, Suspense, useCallback } from "react";
import { List, Page, Icon, useNavigate } from "zmp-ui";
import { openPhone } from "zmp-sdk/apis";
import axios from "axios";
import UserCard from "../components/user-card";

import "../css/index.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationArrow,faMagnifyingGlass, faPhone } from '@fortawesome/free-solid-svg-icons'  
import {
  GoogleMap,
  InfoWindow,
  LoadScript,
  Marker,
} from "@react-google-maps/api";
const HomePage = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [radiusInput, setRadiusInput] = useState(1);
  const [mapCenter, setMapCenter] = useState({ lat: -3.745, lng: -38.523 });
  const [buttonStyle, setButtonStyle] = useState({});
  const [findNearbyButtonStyle, setFindNearbyButtonStyle] = useState({});
  const [navButtonColor, setNavButtonColor] = useState("#a9cfe4");
  const [currentLat, setCurrentLat] = useState(null);
  const [currentLong, setCurrentLong] = useState(null);
  const [locations, setLocations] = useState([]);
  const [nearByLocation, setNearByLocation] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapZoom, setMapZoom] = useState(14);
  const [isFoundNearBy, setIsFoundNearBy] = useState(false);
  const [isNearByStationVisible, setIsNearByStationVisible] = useState(true);
  const [isFindNearbyPressed, setIsFindNearbyPressed] = useState(false);

  const fetchNearbyStationData = useCallback(
    async (lat, long) => {
      try {
        const res = await axios.get(
          `http://172.16.11.139:14000/api/v1/locations/by_radius?user_lat=${lat}&user_long=${long}&radius=${radiusInput}`
        );
        const nearByStation = await Promise.all(
          res.data.map(async (station) => {
            const stationDetails = await axios.get(
              `http://172.16.11.139:14000/api/v1/locations/${station.id}`
            );

            return stationDetails.data;
          })
        );
        setNearByLocation(
          nearByStation.map((c, index) => ({
            id: index,
            location_name: c.location_name,
            lat: c.latitude,
            lng: c.longitude,
            street: c.street,
            description: c.description,
            phone_number: c.phone_number,
          }))
        );
      } catch (err) {
        console.error(err);
      }
      setIsFindNearbyPressed(false);
    },
    [radiusInput]
  );

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLat(latitude);
          setCurrentLong(longitude);
          setMapCenter({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting location: ", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  function openCity(evt, cityName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
  }

  const handleSearch = async () => {
    setButtonStyle({ backgroundColor: navButtonColor });
    setTimeout(() => setButtonStyle({}), 80);

    if (searchInput.trim() !== "") {
      setIsNearByStationVisible(true);
      const encodedQuery = encodeURIComponent(searchInput.trim());
      const searchUrl = `http://172.16.11.139:14000/api/v1/locations/search?query=${encodedQuery}`;

      try {
        const res = await axios.get(searchUrl);
        const searchResults = res.data.map((d, index) => ({
          id: index,
          lat: d.latitude,
          lng: d.longitude,
          location_name: d.location_name,
          street: d.street,
          description: d.description,
          phone_number: d.phone_number,
        }));
        if (searchResults.length > 0) {
          setNearByLocation(searchResults);
        } else {
          alert("Cannot find any place that fits your search");
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("Please enter your destination");
    }
  };

  const handleFindNearby = async () => {
    setFindNearbyButtonStyle({ backgroundColor: "#a9cfe4" });
    setTimeout(() => setFindNearbyButtonStyle({}), 80);

    const radius = Number(radiusInput);
    if (radius > 0) {
      setMapCenter({ lat: currentLat, lng: currentLong });

      setMapZoom(15 - radius * 0.5);
      setIsNearByStationVisible(true);

      if (currentLat !== null && currentLong !== null) {
        await fetchNearbyStationData(currentLat, currentLong);
        setIsFoundNearBy(true);
      }
    } else {
      alert("Invalid Radius value. Please enter another number");
    }
  };

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
  };

  const handleCallButton = (phone_number) => {
    openPhone({
      phoneNumber: phone_number,
      success: () => console.log("Call success"),
      fail: (error) => console.log("Call fail", error),
    });
  };

  const handleDirectionButton = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
    );
  };

  const containerStyle = {
    width: "100%",
    height: "550px",
  };

  return (
    <Page className="page" >
      
      <Suspense>
        <div className="section-container" onClick={() => navigate("/user")} style={{backgroundColor: "none"}}>
          <UserCard />
        </div>
      </Suspense>



      <div className="tab">
      
        <button
          className="tablinks"
          onClick={(event) => openCity(event, "London")}
        >
          Search
        </button>
        <button
          className="tablinks"
          onClick={(event) => openCity(event, "Paris")}
        >
          Find nearby station
        </button>
      </div>
      <div id="London" className="tabcontent">
        <div className="search_container">
          <input
            className="search_bar"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter location"
          />
          <button className="button" style={buttonStyle} onClick={handleSearch}>
          <FontAwesomeIcon icon={faMagnifyingGlass} /> 

          </button>
        </div>
      </div>

      <div id="Paris" className="tabcontent">
        <div className="find_nearby_container">
          <input
            className="find_nearby_radius_input"
            type="number"
            min="0.1"
            value={radiusInput}
            onChange={(e) => setRadiusInput(e.target.value)}
          />
          <span className="find_nearby_radius_unit">Km</span>
          <button
            className="button"
            style={findNearbyButtonStyle}
            onClick={handleFindNearby}
          >
          <FontAwesomeIcon icon={faMagnifyingGlass} /> 

          </button>
        </div>
      </div>
      <div>
        <LoadScript googleMapsApiKey={process.env.REACT_APP_API_KEY}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={mapZoom}
          >
            <Marker
              position={mapCenter}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/micons/man.png",
              }}
            />
            {nearByLocation.map((location) => (
              <Marker
                visible={isNearByStationVisible}
                key={location.id}
                position={{ lat: location.lat, lng: location.lng }}
                onClick={() => handleMarkerClick(location)}
              />
            ))}
            {selectedLocation && (
              <InfoWindow 
                position={{
                  lat: selectedLocation.lat,
                  lng: selectedLocation.lng,
                }}
                onCloseClick={() => setSelectedLocation(null)}
              >
                <div className="info_window_container">
                  <div className="info_window_container_header">
                    <h2 className="info_window_container_header_text">
                      {selectedLocation.location_name}
                    </h2>
                  </div>
                  <div className="info_window_container_body">
                    <p>{selectedLocation.description}</p>
                    <p>
                      <strong>Phone:</strong> {selectedLocation.phone_number}
                    </p>
                    <div className="info_window_container_all_buttons">
                      <button
                        className="info_window_container_call_button"
                        onClick={() =>
                          handleCallButton(selectedLocation.phone_number)
                        }
                      >
                        <i className="fas fa-phone"></i> <FontAwesomeIcon icon={faPhone} size="2x" />
                      </button>
                      <button
                        className="info_window_container_direction_button"
                        onClick={() =>
                          handleDirectionButton(selectedLocation.description)
                        }
                      >
                        <i className="fas fa-directions"></i>  <FontAwesomeIcon icon={faLocationArrow} size="2x" />
                      </button>
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </Page>
  );
};

export default HomePage;
