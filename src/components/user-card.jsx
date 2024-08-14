import React from "react";
import { Avatar, Box, Text } from "zmp-ui";
import { useRecoilValue } from "recoil";
import { userState } from "../state";
import { useNavigate } from "zmp-ui";
import "../css/userPage.css"

import {
  faGear
} from "@fortawesome/free-solid-svg-icons";
const UserCard = () => {
  const { userInfo } = useRecoilValue(userState);
  const navigate = useNavigate();
  return (
    <Box className = "container" flex > 
      
  
  <Box ml={4} className="name">
        <Text.Title style={{ fontWeight: "200"}}>{userInfo.name}</Text.Title>
      </Box>
      <Avatar 
      style={{display: "flex", marginRight: "20px",margin: "auto"}}
      
        story="default"
        online
        src={userInfo.avatar.startsWith("http") ? userInfo.avatar : undefined}
      >
        {userInfo.avatar}
      </Avatar>
    </Box>
  );
};

export default UserCard;
