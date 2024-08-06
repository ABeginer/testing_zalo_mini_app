import React, { useState, useEffect, Suspense, useCallback } from "react";
import { Page } from "zmp-ui";
import { openPhone } from "zmp-sdk/apis";
import axios from "axios";
import UserCard from "../components/user-card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getLocation } from "zmp-sdk/apis";
import {
  faLocationArrow,
  faMagnifyingGlass,
  faPhone,
  faXmark,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import {
  GoogleMap,
  InfoWindow,
  LoadScript,
  Marker,
} from "@react-google-maps/api";
import "../css/index.css";
import { number } from "prop-types";
const HomePage = () => {
  const [searchInput, setSearchInput] = useState("");
   const [radiusInput, setRadiusInput] = useState(1);
  const [mapCenter, setMapCenter] = useState({ lat: -3.745, lng: -38.523 });
  const [buttonStyle, setButtonStyle] = useState({});
  const [findNearbyButtonStyle, setFindNearbyButtonStyle] = useState({});
  const [navButtonColor, setNavButtonColor] = useState("#a9cfe4");
  const [currentLat, setCurrentLat] = useState(null);
  const [currentLong, setCurrentLong] = useState(null);
  const [nearByLocation, setNearByLocation] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapZoom, setMapZoom] = useState(14);
  const [isTabVisible, setIsTabVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [isUserInfoVisible, setIsUserInfoVisible] = useState(false);
  const [isOptionMenuVisible, setIsOptionMenuVisible] = useState(true);
  const [isUserInfoAnimationVisible, setIsUserInfoAnimatonVisible] =
    useState(false);
  useEffect(() => {
    getLocation({
      success: async (data) => {
        let token = data;
      },
      fail: (error) => {
        // xử lý khi gọi api thất bại
        console.log(error);
      },
    });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLat(Number(latitude));
        setCurrentLong(Number(longitude));

        setMapCenter({ lat: latitude, lng: longitude });
      },
      (error) => console.error("Error getting location: ", error)
    );
  }, []);

  const fetchNearbyStationData = useCallback(
    async (lat, long) => {
      try {
        const response = await axios.get(
          `http://172.16.11.139:14000/api/v1/locations/by_radius`,
          {
            params: { user_lat: lat, user_long: long, radius: radiusInput },
          }
        );

        const nearByStation = await Promise.all(
          response.data.map(async (station) => {
            const stationDetails = await axios.get(
              `http://172.16.11.139:14000/api/v1/locations/${station.id}`
            );
            return {
              ...stationDetails.data,
              lat: stationDetails.data.latitude,
              lng: stationDetails.data.longitude,
            };
          })
        );
        if (nearByStation == "") {
          alert(
            `seem like there is no charge station within radius of ${radiusInput} km near you\nPlease find again with a larger radius`
          );
        }
        setNearByLocation(nearByStation);
      } catch (err) {
        alert(
          "ERROR CONNECT TO SERVER!!! \nMake sure that you connect to TPP internal wifi for best experience"
        );
        console.error(err);
      }
    },
    [radiusInput]
  );

    const handleSearch = async () => {
      setButtonStyle({ backgroundColor: navButtonColor });
      setTimeout(() => setButtonStyle({}), 80);

      if (searchInput.trim() !== "") {
        try {
          const res = await axios.get(
            `http://172.16.11.139:14000/api/v1/locations/search`,
            {
              params: { query: searchInput.trim() },
            }
          );

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
          alert(
            "ERROR CONNECT TO SERVER!!! \nMake sure that you connect to TPP internal wifi for best experience"
          );
          console.error(err);
        }
      } else {
        alert("Please enter your destination");
      }
      setMapCenter({ lat: currentLat, lng: currentLong });
    };

    const handleFindNearby = async () => {
      setFindNearbyButtonStyle({ backgroundColor: "#a9cfe4" });
      setTimeout(() => setFindNearbyButtonStyle({}), 80);

      const radius = Number(radiusInput);
      if (radius > 0 && currentLat !== null && currentLong !== null) {
        await fetchNearbyStationData(currentLat, currentLong);
      } else {
        alert("Invalid Radius value. Please enter another number");
      }
    };

  const handleMarkerClick = (location) => setSelectedLocation(location);

  const handleCallButton = (phoneNumber) => {
    openPhone({
      phoneNumber,
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

  const toggleMenuVisibility = () => {
    if (isTabVisible) {
      setIsMenuVisible(true);
      setTimeout(() => setIsTabVisible(false), 500);
      setTimeout(() => setIsOptionMenuVisible(true), 500);
    } else {
      setIsMenuVisible(false);
      setIsTabVisible(true);
      setIsOptionMenuVisible(false);
    }
  };
  const toggleUserInfoVisibility = () => {
    if (isUserInfoVisible) {
      setIsUserInfoAnimatonVisible(true);
      setTimeout(() => setIsUserInfoVisible(false), 500);
      setTimeout(() => setIsOptionMenuVisible(true), 500);
    } else {
      setIsUserInfoAnimatonVisible(false);
      setIsUserInfoVisible(true);
      setIsOptionMenuVisible(false);
    }
  };
  const openSearchOption = (evt, tabName) => {
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
  };

  return (
    <Page className="page" style={{ backgroundColor: "#b0d5ea" }}>
       <div style={{ width: "380px", height: "100px", display: "flex" }}>
        {isOptionMenuVisible && (
          <div className="option-menu-button">
            <h1 style={{fontSize: "2em", margin: "auto", fontWeight: "bold", fontStyle: "-moz-initial"}}>Charger Navigator </h1>
            <div style={{ margin: "auto", marginTop: "0px" }}>
              {/* {!isTabVisible && ( */}
                <button
                  className="menu-open-button"
                  onClick={toggleMenuVisibility}
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} size="2x" />
                </button>
              {/* )} */}
            </div>
            <div style={{ margin: "auto", marginTop: "0px" }}>
              {/* {!isUserInfoVisible && ( */}
                <button
                  className="menu-open-button"
                  onClick={toggleUserInfoVisibility}
                >
                  <FontAwesomeIcon icon={faUser} size="2x" />
                </button>
              {/* )} */}
            </div>
          </div>
        )}

        {isUserInfoVisible && (
          <Suspense>
            <div
              style={{ display: "flex", height: "80px" }}
              className={`r ${
                isUserInfoAnimationVisible ? "slide-out" : "slide-in"
              }`}
            >
              <div
                style={{
                  borderRadius: "100px",
                  width: "340px",
                  backgroundColor: "#829ba9",
                  border: "3px solid #01050a",
                  display: "flex",
                }}
              >
                <div>
                  <UserCard />
                </div>
              </div>

              <button
                className="menu-close-button"
                style={{ marginBottom: "20px" }}
                onClick={toggleUserInfoVisibility}
              >
                <FontAwesomeIcon
                  icon={faXmark}
                  size="2x"
                  style={{ opacity: "0.9" }}
                />
              </button>
            </div>
          </Suspense>
        )}

        {isTabVisible && (
          <div className={`menu ${isMenuVisible ? "slide-out" : "slide-in"}`}>
            <div>
              <div className="tab">
                <button
                  className="tablinks"
                  style={{
                    borderTopLeftRadius: "20px",
                    borderBottomLeftRadius: "20px",
                  }}
                  onClick={(event) => openSearchOption(event, "Search")}
                >
                  Search
                </button>
                <button
                  className="tablinks"
                  style={{
                    borderTopRightRadius: "20px",
                    borderBottomRightRadius: "20px",
                  }}
                  onClick={(event) => openSearchOption(event, "FindNearby")}
                >
                  Find nearby station
                </button>
              </div>
              <div className="menu-container">
                <div id="Search" className="tabcontent">
                  <div className="search_container">
                    <input
                      className="search_bar"
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Enter location"
                    />
                    <button
                      className="button"
                      style={buttonStyle}
                      onClick={handleSearch}
                    >
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </button>
                  </div>
                </div>
                <div id="FindNearby" className="tabcontent">
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
                      className="find-nearby-button"
                      style={findNearbyButtonStyle}
                      onClick={handleFindNearby}
                    >
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button
              className="menu-close-button"
              onClick={toggleMenuVisibility}
            >
              <FontAwesomeIcon icon={faXmark} size="2x" />
            </button>
          </div>
        )}
      </div> 
      <div className="wrapper" style={{position: "relative"}}>
       <div>
        <LoadScript googleMapsApiKey={process.env.REACT_APP_API_KEY}>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "550px" }}
            center={mapCenter}
            zoom={mapZoom}
          >
            <div>
              <h1>THIS IS SOME TEXT</h1>
            </div>

            <Marker
              position={mapCenter}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/micons/man.png",
              }}
            />
            {nearByLocation.map((location) => (
              <Marker
                key={location.id}
                description={location.id} //TESTING MARKER DESCIPTION
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
                        <FontAwesomeIcon icon={faPhone} size="2x" />
                      </button>
                      <button
                        className="info_window_container_direction_button"
                        onClick={() =>
                          handleDirectionButton(selectedLocation.location_name)
                        }
                      >
                        <FontAwesomeIcon icon={faLocationArrow} size="2x" />
                      </button>
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div> 
      <div className="over-map" style={{position: "absolute", top: "10px", left: "10px", zIndex: "99",margin: "auto"}}>
        <h1>this is sth</h1>
      </div>
      </div>
      
    </Page>
  );
};

export default HomePage;
