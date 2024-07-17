import React, { useState, useEffect, Suspense } from "react";
import { List, Page, Icon, useNavigate } from "zmp-ui";
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
let chargeStationCollection = [];
let nearByStation = [];
let currentLocation ;
async function fetchData(locations, setLocations) {
  try {
    await axios
      .get("http://172.16.11.139:14000/api/v1/locations")
      .then((res) => {
        console.log(res.data);
        //var o = JSON.stringify(res.data);

        for (let i = 0; i < res.data.founds.length; i++) {
          let d = res.data.founds[i];
          let cs = new ChargeStation(
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
          );

          // ch.latitude(String(d.latitude))
          // console.log("the loop is running");
          chargeStationCollection.push(cs);
          //  console.log(d);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
}
fetchData();
function setupNearByLocation(nearByLocation, setNearByLocation) {
  for (let i = 0; i < nearByStation.length; i++) {
    let a = i + 2;
    let c = nearByStation[i];

    const newNearByLocation = {
      id: a,
      lat: c.latitude,
      lng: c.longitude,
    };
    setNearByLocation((prevNearByLocation) => [
      ...prevNearByLocation,
      newNearByLocation,
    ]);
  }
}
// Converts numeric degrees to radians
function toRad(Value) {
  return (Value * Math.PI) / 180;
}
// calculate distance between user and station
function calcCrow(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

const HomePage = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: -3.745, lng: -38.523 });
  const [buttonStyle, setButtonStyle] = useState({
    backgroundColor: "green",
    color: "black",
    borderRadius: "5px",
  });
  const [currentLat, setCurrentLat] = useState("");
  const [currentLong, setCurrentLong] = useState("");
  //ChargeStation ChargeStation = new ChargeStation[];
  const [locations, setLocations] = useState([]);
  const [nearByLocation, setNearByLocation] = useState([]);
  const [currentViewLocation, setCurrentViewLocaction] = useState();
  const [isFoundNearBy, setIsFoundNearBy] = useState(false);
  let [isNearByStationVisible, setIsNearByStationVisible] = useState(true);
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

      //setupLocation(locations, setLocations);
      console.log(locations);
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const customIcon = {
    url: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png", // URL to custom icon image
  };

  const handleSearch = () => {
    setIsNearByStationVisible(false);
  };

  const handleFindNearby = () => {
    setIsNearByStationVisible(true);
    if (isFoundNearBy == false) {
      for (let i = 0; i < chargeStationCollection.length; i++) {
        let a = calcCrow(
          chargeStationCollection[i].latitude,
          chargeStationCollection[i].longitude,
          currentLat,
          currentLong
        );
        if (a < 100) {
          nearByStation.push(chargeStationCollection[i]);
        }
      }
      setIsFoundNearBy(true);
      setupNearByLocation(nearByLocation, setNearByLocation);
    }
  };
  const handleMarkerClick = (nearByLocation) => {
    for (let i = 0; i < chargeStationCollection.length; i++) {
      let cs = chargeStationCollection[i];

      if (
        nearByLocation.lat == cs.latitude &&
        nearByLocation.lng == cs.longitude
      ) {
        setCurrentViewLocaction(cs);
        navigate("/about");
        console.log(cs);
      }
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
      <LoadScript googleMapsApiKey={process.env.REACT_APP_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={9}
        >
          <Marker position={mapCenter} icon={customIcon}></Marker>
          {nearByLocation.map((nearByLocation) => (
            <Marker
              visible={isNearByStationVisible}
              key={nearByLocation.id}
              position={{ lat: nearByLocation.lat, lng: nearByLocation.lng }}
              onClick={() => handleMarkerClick(nearByLocation)}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </Page>
  );
};

export default HomePage;
