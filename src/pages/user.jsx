import React from "react";
import {
  Avatar,
  List,
  Text,
  Box,
  Page,
  Button,
  Icon,
  useNavigate,
} from "zmp-ui";
import { useRecoilValue } from "recoil";
import { displayNameState, userState } from "../state";

const UserPage = () => {
  const { userInfo: user } = useRecoilValue(userState);
  const displayName = useRecoilValue(displayNameState);
  const navigate = useNavigate();
  return (
    <Page className="page">
      <Box
        flex
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        style={{backgroundColor: "#d3dce2",borderRadius: "20px"}}
      >
        <Box>
          <Avatar
            story="default"
            size={96}
            online
            src={user.avatar.startsWith("http") ? user.avatar : undefined}
          >
            {user.avatar}
          </Avatar>
        </Box>
        <Box flex flexDirection="row" alignItems="center" ml={8} >
          <Box style={{backgroundColor: "#d3dce2",borderRadius: "0px"}}>
            <Text.Title>{displayName || user.name}</Text.Title>
          </Box>
          <Box ml={4}>
            <Button
              onClick={() => {
                navigate("/form");
              }}
              size="small"
              icon={<Icon icon="zi-edit" />}
            />
          </Box>
        </Box>
      </Box>
      <Box m={0} p={0} mt={4} >
        <div className="section-container" style={{backgroundColor: "#d3dce2",borderRadius: "20px", border: "2px solid #01050a"}}>
          <List >
            <List.Item title="Name" subTitle={user.name} />
            <List.Item title="Display Name" subTitle={displayName}   />
            <List.Item title="ID" subTitle={user.id}/>
          </List>
        </div>
      </Box>
    </Page>
  );
};

export default UserPage;
