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
  InfoBox,
  LoadScript,
  Marker,
} from "@react-google-maps/api";
import "../css/index.css";
import "../css/google-map.css";
import "../css/sliding-pane.css";
import "../css/info-window.css";
import "../css/search-container.css";
import { stringify } from "postcss";

const HomePage = () => {
  const { userInfo } = useRecoilValue(userState);
  const navigate = useNavigate();

  const [value, setValue] = useState(33);
  const numbers = Array.from({ length: 100 }, (_, i) => i + 1); // Numbers from 1 to 100
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
  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false);
  const [mapZoom, setMapZoom] = useState(14);

  const [state, setState] = useState({
    isUserInfoOpen: false,
    isSearchOpen: true,
    isSelectedLocationOpen: false,
  });

  const [isScrollBarVisible, setIsScrollBarVisible] = useState(false);

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
          `http://172.16.11.139:14000/api/v1/locations/by_radius`, //api call to get all charge station by radius
          {
            params: { user_lat: lat, user_long: long, radius: radiusInput },
          }
        );
        const nearByStation = await Promise.all(
          response.data.map(async (station) => {
            const stationDetails = await axios.get(
              `http://172.16.11.139:14000/api/v1/locations/${station.id}` //retrieve detail infomation with get location by id
            );
            console.log(nearByLocation);

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
          img: d.img_url,
          description: d.description,
          phone_number: d.phone_number,
          parking_level: d.parking_level,
          pricing: d.pricing,
          status: d.status
        }));
        console.log(res.data);
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
  const handleMoreInfoButton = () => {
     setState({isSelectedLocationOpen: true})
     
  }
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
  //set selected location to open the option window
  const handleMarkerClick = (location) => {

    setMapCenter({ lat: location.lat, lng: location.lng });
    console.log(location.img + "2")
    setSelectedLocation(location);
  };
  //call zalo defaut api to perform a call to the station number
  const handleCallButton = (phoneNumber) => {
    openPhone({
      phoneNumber,
      success: () => console.log("Call success"),
      fail: (error) => console.log("Call fail", error),
    });
  };

  //redirect to gg map for direction
  const handleDirectionButton = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
    );
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
                  position={{ lat: location.lat, lng: location.lng }}
                  onClick={() => handleMarkerClick(location)}
                  label={{
                    text: location.location_name, // Add your description here
                    marginTop: "10%",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "200",
                  }}
                />
              ))}
              {selectedLocation && (
                <InfoBox className="info"
                  position={{
                    lat: selectedLocation.lat,
                    lng: selectedLocation.lng,
                  }}
                  
                  onCloseClick={() => setSelectedLocation(null)}
                >
                  <div className="info_window_container">
                    <div className="info_window_container_header">
                      <p className="info_window_container_header_text">
                        {selectedLocation.location_name}
                      </p>
                    </div>
                    <p className="info_window_container_body_text" >
                      {selectedLocation.description}
                    </p>
                    <button className="info-window-button" onClick={handleMoreInfoButton}>more info...</button>
                  </div>
                </InfoBox>
              )}
            </GoogleMap>
          </LoadScript>
        </div>

        {!state.isUserInfoOpen && (
          <div className="avatar-container">
            <Avatar
              style={{ display: "flex", marginLeft: "0px", margin: "auto" }}
              onClick={() => setState({ isUserInfoOpen: true })}
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

        {/* the left sliding pane is contain of the user setting and exit button */}
        <SlidingPane
          className={`left-slide-pane ${
            state.isUserInfoOpen ? "slide-right" : "slide-left"
          }`}
          overlayClassName="left-slide-pane-overlay"
          isOpen={state.isUserInfoOpen}
          from="left"
          onRequestClose={() => {
            setState({ isUserInfoOpen: false });
          }}
        >
          <div className="over-map-user-info-container">
            <div className="over-map-user-info">
              <UserCard></UserCard>
              <div className="over-map-container-button-container">
                <button className="over-map-button">
                  <p
                    style={{ margin: "auto", color: "#54facf" }}
                    onClick={() => {
                      navigate("/user");
                    }}
                  >
                    Setting
                  </p>

                  <FontAwesomeIcon icon={faGear} style={{ margin: "auto" }} />
                </button>
                <button className="over-map-button">
                  <p
                    style={{ margin: "auto", color: "#54facf" }}
                    onClick={() => {
                      navigate("/");
                    }}
                  >
                    Exit
                  </p>
                  <FontAwesomeIcon
                    icon={faRightFromBracket}
                    style={{ margin: "auto" }}
                  />
                </button>
              </div>
            </div>
            <div className="over-map-info-slide-button-container">
              <button
                className="over-map-info-slide-button"
                onClick={() => setState({ isUserInfoOpen: false })}
              >
                <FontAwesomeIcon
                  className="slide-button-icon"
                  icon={faCaretLeft}
                  size="2x"
                />
              </button>
            </div>
          </div>
        </SlidingPane>

        {!state.isSearchOpen && (
          <div className="over-map-slide-up-button-container">
            <button
              className="over-map-slide-up-button"
              onClick={() => setState({ isSearchOpen: true })}
            >
              {" "}
              <FontAwesomeIcon
                className="slide-button-icon"
                icon={faMagnifyingGlass}
                size="2x"
              />
            </button>
          </div>
        )}

        <SlidingPane
          className={`bottom-slide-pane ${
            state.isSearchOpen ? "slide-out" : "slide-in "
          }`}
          overlayClassName="bottom-slide-pane-overlay"
          isOpen={state.isSearchOpen}
          onRequestClose={() => {
            setState({ isSearchOpen: false });
          }}
        >
          <div className="over-map-container-collection">
            {isScrollBarVisible && (
              <div className="picker-container" onScroll={handleScroll}>
                <div className="number-picker">
                  {numbers.map((num) => (
                    <div
                      key={num}
                      className={`picker-item ${
                        num === radiusInput ? "active" : ""
                      }`}
                      onClick={() => setIsScrollBarVisible(false)}
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
                  onClick={() => setState({ isUserInfoOpen: false })}
                />
              </button>
            </div>
            <div className="over-map-info-container">
              <div className="search-symbol">
                <FontAwesomeIcon
                  icon={faChargingStation}
                  size="2x"
                  color="#262930"
                  style={{ marginLeft: "10px", margin: "auto" }}
                />
                <p
                  style={{
                    margin: "auto",
                    fontSize: "1.3em",
                    fontStyle: "poppins",
                    color: "#262930",
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
              <ul style={{ margin: "auto", width: "100%" }}>
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
        </SlidingPane>

        {selectedLocation && (
          <SlidingPane
            className={`right-slide-pane ${
              state.isSelectedLocationOpen
                ? "slide-in-from-right"
                : "slide-out-to-left "
            }`}
            overlayClassName="right-slide-pane-overlay"
            isOpen={state.isSelectedLocationOpen}
            onRequestClose={() => {
              setState({ isSelectedLocationOpen: false });
            }}
          >
            <div>
              <div className="right-slide-pane-content">
                <img
                  className="right-slide-pane-img"
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ80amNC4WOH3oRdn-Od9SA16eAkY5ZqKLmD6RfkL1AhiqSWh7f4L8PDm_ywYiGwHiRPng&usqp=CAU"
                ></img>
                <button
                  className="right-slide-pane-close-button"
                  onClick={() => {
                    setState({ isSelectedLocationOpen: false });
                  }}
                >
                  {" "}
                  <FontAwesomeIcon
                    icon={faXmark}
                    size="1x"
                  />
                </button>
                <div className="right-slide-pane-button-container">
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

                <p>{selectedLocation.description}</p>
                <p>Status: {selectedLocation.status}</p>
                <p>Parking level: {selectedLocation.parking_level}</p>
                <p>Charge price: {selectedLocation.pricing}</p>
              </div>
            </div>
          </SlidingPane>
        )}
      </div>
    </Page>
  );
};

export default HomePage;
