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

let chargeStationCollection = [];
let nearByStation = [];
let currentLocation;

async function fetchData(locations, setLocations) {
  try {
    await axios
      .get("http://172.16.11.139:14000/api/v1/locations?page_size=10000")
      .then((res) => {
        
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

          chargeStationCollection.push(cs);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
}
async function fetchNearbyStationData(locations, setLocations) {

}
fetchData();
 async function getNearbyLocationCollection (id){
  try {
    await axios
      .get("http://172.16.11.139:14000/api/v1/locations/"+id)
      .then((res) => {
        
        nearByStation.push(res.data)
        
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
}
function setupNearByLocation(nearByLocation, setNearByLocation) {
  for (let i = 0; i < nearByStation.length; i++) {
    let a = i ;
    let c = nearByStation[i];

    const newNearByLocation = {
      id: a,
      lat: c.latitude,
      lng: c.longitude,
      name: c.street, // Assuming name is the street
      description: c.description,
      phone_number: c.phone_number,
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
  const [locations, setLocations] = useState([]);
  const [nearByLocation, setNearByLocation] = useState([]);
  const [searchLocation, setSearchLocation] = useState([])
  const [currentViewLocation, setCurrentViewLocaction] = useState();
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
  }, []);

  const customIcon = {
    url: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png", // URL to custom icon image
  };

  const handleSearch = () => {
    setIsNearByStationVisible(false);
  };

  const  handleFindNearby = async () => {

    setIsNearByStationVisible(true);
    if (!isFoundNearBy) {
      try {
        await axios
          .get("http://172.16.11.139:14000/api/v1/locations/by_radius?user_lat="+currentLat+"&user_long="+currentLong+"&radius=10")
          .then((res) => {
            //console.log(res.data);
            for (let i = 0; i < res.data.length; i++) {

              getNearbyLocationCollection(res.data[i].id);
              
    
              
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (err) {
        console.log(err);
      }
      console.log("nearby: "+nearByLocation)
      setIsFoundNearBy(true);
      setupNearByLocation(nearByLocation, setNearByLocation);
    }
  };

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    setCurrentViewLocaction(location);
  };
  const handleCallButton = (phone_number) => {
    console.log("calling number: " + phone_number);
    openPhone({
      phoneNumber: phone_number,
      success: () => {
        // xử lý khi gọi api thành công
        console.log("call success");
      },
      fail: (error) => {
        // xử lý khi gọi api thất bại
        console.log("call fail");
        console.log(error);
      },
    });
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
            zoom={9}
          >
            <Marker position={mapCenter} icon={customIcon}></Marker>
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
                <div style={{ width: 400, height: 100 }}>
                  <h1>{selectedLocation.description}</h1>
                  
                    <button
                      style={buttonStyle}
                      onClick={()=>handleCallButton(selectedLocation.phone_number)}
                    >
                      call charge station
                    </button>
                  
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
