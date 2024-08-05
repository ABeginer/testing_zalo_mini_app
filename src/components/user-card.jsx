import React from "react";
import { Avatar, Box, Text } from "zmp-ui";
import { useRecoilValue } from "recoil";
import { userState } from "../state";
import { useNavigate } from "zmp-ui";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faGear
} from "@fortawesome/free-solid-svg-icons";
const UserCard = () => {
  const { userInfo } = useRecoilValue(userState);
  const navigate = useNavigate();
  return (
    <Box flex style ={{ borderRadius: "200px", width: "300px", padding: "15px"}}> 
      <Avatar
        story="default"
        online
        src={userInfo.avatar.startsWith("http") ? userInfo.avatar : undefined}
      >
        {userInfo.avatar}
      </Avatar>
      <Box ml={4} style={{display: "flex", margin: "auto"}}>
        <Text.Title style={{padding:13}}>{userInfo.name}</Text.Title>
        <FontAwesomeIcon style = {{marginTop: "10px"}}  onClick={() => navigate("/user")} icon={faGear} size="2x" />  
      </Box>
    </Box>
  );
};

export default UserCard;
