import React, { useState } from "react";
import { Sheet, Button, Page, Text, useNavigate } from "zmp-ui";
import  "./index.jsx";
import '../css/WelcomePage.css';
import axios from "axios";

const AboutPage = (props) => {
  const [actionSheetOpened, setActionSheetOpened] = React.useState(false);
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false);
  const handleGetStartButton = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://172.16.11.139:14000/");
      navigate("/main");
    } catch (error) {
      alert(
        "ERROR CONNECT TO SERVER!!! \nMake sure that you connect to TPP inernal wifi for best experience "
      );
      console.log(error)
    }
  }
  return (
    <div className = "whole-welcome-page">
      <div className="welcome-page">
    <div className="image-container">
        <img  src="https://static.vecteezy.com/system/resources/previews/019/551/284/original/electric-vehicle-charging-station-icon-in-gradient-colors-png.png" style={{height: "25vh",width: "25vh", margin: "auto"}} />
    </div>
    <div className="content-container">
        <h1>EV charger</h1>
        <p>find charge station for your electric vehicle</p>
        <button className="get-started-button" onClick={handleGetStartButton}>Get Started</button>
        
        {isLoading && (<div className="spinner"></div> )}
    </div>
</div>
    </div>
    
  );
};

export default AboutPage;

