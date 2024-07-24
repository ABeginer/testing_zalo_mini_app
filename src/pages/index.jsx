import React, { useState, useEffect, Suspense } from "react";
import { List, Page, Icon, useNavigate } from "zmp-ui";
import { openPhone } from "zmp-sdk/apis";
import axios from "axios";
import UserCard from "../components/user-card";
import "../css/index.css";
import {
  GoogleMap,
  InfoWindow,
  LoadScript,
  Marker,
} from "@react-google-maps/api";
import ChargeStation from "../chargeStation.js";
import { redirect } from "react-router-dom";

const fetchData = async (setLocations) => {
  try {
    const res = await axios.get(
      "http://172.16.11.139:14000/api/v1/locations?page_size=10000"
    );
    const chargeStationCollection = res.data.founds.map(
      (d) =>
        new ChargeStation(
          d.street,
          d.district,
          d.city,
          d.city,
          d.country,
          d.postal_code,
          d.latitude,
          d.longitude,
          d.description,
          d.working_day_id,
          d.pricing,
          d.phone_number,
          d.parking_level,
          d.ordering,
          d.page,
          d.page_size,
          d.order_by
        )
    );
    setLocations(chargeStationCollection);
  } catch (err) {
    console.error(err);
  }
};

const fetchNearbyStationData = async (
  currentLat,
  currentLong,
  setNearByLocation
) => {
  try {
    const res = await axios.get(
      `http://172.16.11.139:14000/api/v1/locations/by_radius?user_lat=${currentLat}&user_long=${currentLong}&radius=1`
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
};

const HomePage = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: -3.745, lng: -38.523 });
  const [buttonStyle, setButtonStyle] = useState({}); //the search button style
  const [findNearbyButtonStyle, setFindNearbyButtonStyle] = useState({});
  const [navButtonColor, setNavButtonColor] = useState("#a9cfe4");
  const [currentLat, setCurrentLat] = useState(null);
  const [currentLong, setCurrentLong] = useState(null);
  const [locations, setLocations] = useState([]);
  const [nearByLocation, setNearByLocation] = useState([]);
  const [isFoundNearBy, setIsFoundNearBy] = useState(false);
  const [isNearByStationVisible, setIsNearByStationVisible] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);

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

    fetchData(setLocations);
  }, []);

  const handleSearch = async () => {
    setButtonStyle({ backgroundColor: navButtonColor })
    
    setTimeout(
      function() {
        setButtonStyle({})
      }
      .bind(this),
      80
  );
    if(searchInput != ""){
      setIsNearByStationVisible(true);
    const encodedQuery = encodeURIComponent(searchInput.trim());
    console.log(encodedQuery);
    const searchUrl =
      "http://172.16.11.139:14000/api/v1/locations/search?query=" +
      encodedQuery;

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
      console.log(searchResults);
      console.log(searchResults);
      setNearByLocation(searchResults);
    } catch (err) {
      console.error(err);
    }
    }
  };

  const handleFindNearby = async () => {
    setFindNearbyButtonStyle({ backgroundColor: "#a9cfe4" })
    
    setTimeout(
      function() {
        setFindNearbyButtonStyle({})
      }
      .bind(this),
      80
  );
    setIsNearByStationVisible(true);
    if (currentLat !== null && currentLong !== null) {
      await fetchNearbyStationData(currentLat, currentLong, setNearByLocation);
      setIsFoundNearBy(true);
    }
  };

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
  };

  const handleCallButton = (phone_number) => {
    console.log("calling number: " + phone_number);
    openPhone({
      phoneNumber: phone_number,
      success: () => console.log("call success"),
      fail: (error) => console.log("call fail", error),
    });
  };

  const handleDirectionButton = (address) => {
    console.log("Directing...");
    try {
      const encodedAddress = encodeURIComponent(address);
      window.open(
        "https://www.google.com/maps/search/?api=1&query=" + encodedAddress
      );
    } catch (error) {
      console.log(error);
    }
  };

  const containerStyle = {
    width: "100%",
    height: "550px",
  };

  return (
    <Page className="page">
      <Suspense>
        <div className="section-container" onClick={() => navigate("/user")}>
          <UserCard />
        </div>
      </Suspense>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "335px",
          height: "40px",
          margin: "20px 0",
        }}
      >
        <input
          className="search_bar"
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Enter location"
          style={{
            borderRadius: "5px",
          }}
        />
        <button
          className="button"
          style={buttonStyle}
          onClick={handleSearch}
        >
          Search
        </button>
        <button
          className="button"
          style={findNearbyButtonStyle}
          
          onClick={handleFindNearby}
        >
          Find Nearby
        </button>
      </div>
      <div>
        <LoadScript googleMapsApiKey={process.env.REACT_APP_API_KEY}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={15}
          >
            <Marker
              position={mapCenter}
              icon={{
                url: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
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
                <div
                className="info_window_container"
                >
                  
                  <div
                  className="info_window_container_header"
                    
                  >
                    <h2
                      className="info_window_container_header_text"
                    >
                      {selectedLocation.location_name}
                    </h2>
                  </div>
                  <div
                    style={{
                      padding: "0px",
                      color: "#333",
                    }}
                  >
                    <p >
                      {selectedLocation.description}
                    </p>
                    <p >
                      <strong>Phone:</strong> {selectedLocation.phone_number}
                    </p>
                    <div
                      className="info_win_button"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <button
                      className="info_window_container_call_button"
                        
                        onClick={() =>
                          handleCallButton(selectedLocation.phone_number)
                        }
                      >
                        <i className="fas fa-phone"></i> Call
                      </button>
                      <button
                      className="info_window_container_direction_button"
                        
                        onClick={() =>
                          handleDirectionButton(selectedLocation.description)
                        }
                      >
                        <i className="fas fa-directions"></i> Direction
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
