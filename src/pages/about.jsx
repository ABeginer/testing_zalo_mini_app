import React, {
  useState,
  useEffect,
  Suspense,
  useCallback,
  useRef,
} from "react";
import { Page, Avatar } from "zmp-ui";
import { useRecoilValue } from "recoil";
import { userState } from "../state";
import { useNavigate } from "zmp-ui";

import { openPhone } from "zmp-sdk/apis";
import axios from "axios";
import UserCard from "../components/user-card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getLocation } from "zmp-sdk/apis";
import LongPressButton from "../components/long-press-button";
import SlidingPane from "react-sliding-pane";
import {
  faLocationArrow,
  faMagnifyingGlass,
  faPhone,
  faXmark,
  faUser,
  faChargingStation,
  faCaretUp,
  faCaretDown,
  faDiamondTurnRight,
  faCaretLeft,
  faGear,
  faRightFromBracket,
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
  const { userInfo } = useRecoilValue(userState);
  const navigate = useNavigate();

  const [value, setValue] = useState(33);
  const numbers = Array.from({ length: 100 }, (_, i) => i + 1); // Numbers from 1 to 100
  const divRef = useRef(null);
  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    const itemHeight = 40; // Height of each item
    const currentIndex = Math.round(scrollTop / itemHeight);
    setRadiusInput(numbers[currentIndex]);
  };

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
  
  const [state, setState] = useState({isUserInfoOpen : false, isSearchOpen: true, isSelectedLocationOpen: false} ) 

  const [isSearchMenuVisible, setIsSearchMenuVisible] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [isUserInfoVisible, setIsUserInfoVisible] = useState(false);
  const [isOptionMenuVisible, setIsOptionMenuVisible] = useState(true);
  const [isScrollBarVisible, setIsScrollBarVisible] = useState(false);
  const [isUserMenuVisible, setIsUserMenuVisible] = useState(false);
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
          "ERROR CONNECTING TO SERVER!!! \nMake sure that you connect to TPP internal wifi for best experience"
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
    setIsScrollBarVisible(false);
    setTimeout(() => setFindNearbyButtonStyle({}), 80);

    const radius = Number(radiusInput);
    if (radius > 0 && currentLat !== null && currentLong !== null) {
      await fetchNearbyStationData(currentLat, currentLong);
    } else {
      alert("Invalid Radius value. Please enter another number");
    }
  };

  const handleMarkerClick = (location) => {
    // setMapCenter({ lat: location.lat + 0.009, lng: location.lng  });
    setSelectedLocation(location);
  };

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
  const handleSlideButton = () => {

    setIsSearchMenuVisible(false);
    

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
  const handleOpenSearchMenu = () => {
    setIsSearchMenuVisible(true)

   }
  
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
      <div className="wrapper">
        <div>
          <LoadScript googleMapsApiKey={process.env.REACT_APP_API_KEY}>
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100vh" }}
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
                  key={location.id}
                  description="this is the desciption" //TESTING MARKER DESCIPTION
                  position={{ lat: location.lat, lng: location.lng }}
                  onClick={() => handleMarkerClick(location)}
                />
              ))}
              {selectedLocation && (
                <InfoWindow
                  className="info"
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
                            handleDirectionButton(
                              selectedLocation.location_name
                            )
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

        {isSearchMenuVisible ? (
          <div
            className={`over-map-container-collection ${
              isSearchMenuVisible ? "slide-out" : "slide-in"
            }`}
          >
            {isScrollBarVisible && (
              <div className="picker-container" onScroll={handleScroll}>
                <div className="number-picker">
                  {numbers.map((num) => (
                    <div
                      key={num}
                      className={`picker-item ${
                        num === radiusInput ? "active" : ""
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="over-map-slide-button-container">
              <button className="slide-button">
                {" "}
                <FontAwesomeIcon
                  className="slide-button-icon"
                  icon={faCaretDown}
                  size="2x"
                  onClick={handleSlideButton}
                />
              </button>
            </div>
            <div className="over-map-info-container">
              <div className="search-symbol">
                <FontAwesomeIcon
                  icon={faChargingStation}
                  size="2x"
                  color="#262930"
                  style={{ marginLeft: "10px",margin: "auto" }}
                />
                <p
                  style={{
                    margin: "auto",
                    fontSize: "1.3em",
                    fontStyle: "poppins",
                    color: "#262930"
                  }}
                >
                  EV charge station
                </p>
              </div>
            </div>
            <div className="over-map-search-container">
              <div className="search_container">
                <input
                  className="search_bar"
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="Enter location"
                />
                <LongPressButton
                  className="button"
                  style={buttonStyle}
                  onClick={handleFindNearby}
                  onLongPress={() => setIsScrollBarVisible(!isScrollBarVisible)} // set long press
                  delay={700}
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </LongPressButton>
              </div>
              <ul style={{ margin: "auto", width: "300px" }}>
                {nearByLocation.map((location) => (
                  <li key={location.id} className="list-item">
                    <div className="list-info-container">
                      <span style={{ display: "block" }}>
                        {location.location_name}
                      </span>
                      <span style={{ fontSize: "0.8em", display: "block" }}>
                        {location.street}
                      </span>
                    </div>
                    <div className="list-icon-container">
                      <FontAwesomeIcon
                        icon={faDiamondTurnRight}
                        size="2x"
                        className="list-icon-container-icon"
                        onClick={() => handleMarkerClick(location)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="over-map-slide-up-button-container">
            <button
              className="over-map-slide-up-button"
              onClick={handleOpenSearchMenu}
            >
              {" "}
              <FontAwesomeIcon
                className="slide-button-icon"
                icon={faCaretUp}
                size="2x"
              />
            </button>
          </div>
        )}
        {isUserMenuVisible ? (
          <div
            className={`over-map-user-info-container ${
              isUserMenuVisible ? "slide-right" : "slide-left"
            }`}
          >
            <div className="over-map-user-info">
              <UserCard></UserCard>
              <div className="over-map-container-button-container">
                <button
                  className="over-map-button"
                  onClick={() => {
                    navigate("/user");
                  }}
                >
                  Setting 
                  <FontAwesomeIcon icon ={faGear} style={{paddingLeft: "7%",marginTop: "1%"}}/>
                </button>
                <button
                  className="over-map-button"
                  onClick={() => {
                    navigate("/");
                  }}
                >
                  Exit
                  <FontAwesomeIcon icon ={faRightFromBracket} style={{paddingLeft: "7%",marginTop: "1%"}}/>

                </button>
              </div>
            </div>
            <div className="over-map-info-slide-button-container">
              <button
                className="over-map-info-slide-button"
                onClick={() => setIsUserMenuVisible(false)}
              >
                <FontAwesomeIcon
                  className="slide-button-icon"
                  icon={faCaretLeft}
                  size="2x"
                />
              </button>
            </div>
          </div>
        ) : (
          <div className="avatar-container">
            <Avatar
              style={{ display: "flex", marginLeft: "0px", margin: "auto" }}
              onClick={() => setIsUserMenuVisible(true)}
              story="default"
              online
              src={
                userInfo.avatar.startsWith("http") ? userInfo.avatar : undefined
              }
            >
              {userInfo.avatar}
            </Avatar>
          </div>
        )}
      </div>
    </Page>
  );
};

export default HomePage;
