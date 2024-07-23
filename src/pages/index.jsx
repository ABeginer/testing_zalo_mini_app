import React, { useState, useEffect, Suspense } from "react";
import { List, Page, Icon, useNavigate } from "zmp-ui";
import { openPhone } from "zmp-sdk/apis";
import axios from "axios";
import UserCard from "../components/user-card";
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
  const [buttonStyle, setButtonStyle] = useState({
    backgroundColor: "green",
    borderRadius: "5px",
  });
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
        street: d.street,
        description: d.description,
        phone_number: d.phone_number,
      }));
      console.log(searchResults);
      setNearByLocation(searchResults);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFindNearby = async () => {
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
      console.log(error)
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
          height: "30px",
        }}
      >
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Enter location"
        />
        <button style={buttonStyle} onClick={handleSearch}>
          Search
        </button>
        <button style={buttonStyle} onClick={handleFindNearby}>
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
                  width: 300,
                }}
                onCloseClick={() => setSelectedLocation(null)}
              >
                <div
                  style={{
                    width: 250,
                    padding: "0px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 1)",
                    backgroundColor: "#fff",
                    fontSize: "14px",
                    lineHeight: "1.5",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "16px",
                      margin: "0 0 10px 0",
                      color: "#333",
                    }}
                  >
                    {selectedLocation.name}
                  </h2>
                  <p style={{ margin: "0 0 10px 0", color: "#666" }}>
                    {selectedLocation.description}
                  </p>
                  <p style={{ margin: "0 0 10px 0", color: "#666" }}>
                    <strong>Phone:</strong> {selectedLocation.phone_number}
                  </p>
                  <div
                    className="info_win_button"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "205px",
                      height: "30px",
                    }}
                  >
                    <button
                      style={{
                        textAlign: "center",
                        width: "45%",
                        padding: "5px",
                        border: "none",
                        borderRadius: "5px",
                        backgroundColor: "#28a745",
                        color: "#fff",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleCallButton(selectedLocation.phone_number)
                      }
                    >
                      Call
                    </button>
                    <button
                      style={{
                        textAlign: "center",
                        width: "45%",
                        padding: "5px",
                        border: "none",
                        borderRadius: "5px",
                        backgroundColor: "#28a745",
                        color: "#fff",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleDirectionButton(selectedLocation.description)
                      }
                    >
                      Direction
                    </button>
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
