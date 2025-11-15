import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { Box, Spacer, Flex, Button, Wrap, WrapItem } from "@chakra-ui/react";

export default function RootLayout() {
  return (
    <div className="root-layout">
      <main>
        <Box>
          <Navbar />
        </Box>
      </main>

      <Box marginBottom={5} marginTop={5}>
        <nav>
          <Flex justifyContent={"center"}>
            <Wrap spacing={4} justify="center">
              <WrapItem>
                <Button
                  as={NavLink}
                  to="/source"
                  bgColor={"yellow.200"}
                  _hover={{ bg: "yellow.300", borderColor: "yellow.400" }}
                  borderRadius={50}
                  p={5}
                  boxShadow="xl"
                  variant="navOutline"
                  fontSize="2xl"
                  color="yellow.700"
                >
                  Study Source
                </Button>
              </WrapItem>

              <WrapItem>
                <Button
                  as={NavLink}
                  to="/studyboard"
                  bgColor={"yellow.200"}
                  _hover={{ bg: "yellow.300", borderColor: "yellow.400" }}
                  borderRadius={50}
                  p={5}
                  boxShadow="xl"
                  variant="navOutline"
                  fontSize="2xl"
                  color="yellow.700"
                >
                  Study Board
                </Button>
              </WrapItem>

              <WrapItem>
                <Button
                  as={NavLink}
                  to="/timer"
                  bgColor={"yellow.200"}
                  _hover={{ bg: "yellow.300", borderColor: "yellow.400" }}
                  borderRadius={50}
                  p={5}
                  boxShadow="xl"
                  variant="navOutline"
                  fontSize="2xl"
                  color="yellow.700"
                >
                  Timer
                </Button>
              </WrapItem>

              <WrapItem>
                <Button
                  as={NavLink}
                  to="/notes"
                  bgColor={"yellow.200"}
                  _hover={{ bg: "yellow.300", borderColor: "yellow.400" }}
                  borderRadius={50}
                  p={5}
                  boxShadow="xl"
                  variant="navOutline"
                  fontSize="2xl"
                  color="yellow.700"
                >
                  Notes
                </Button>
              </WrapItem>
              <WrapItem>
                <Button
                  as={NavLink}
                  to="/notes"
                  bgColor={"yellow.200"}
                  _hover={{ bg: "yellow.300", borderColor: "yellow.400" }}
                  borderRadius={50}
                  p={5}
                  boxShadow="xl"
                  variant="navOutline"
                  fontSize="2xl"
                  color="yellow.700"
                >
                  Progress Tracker
                </Button>
              </WrapItem>
              <WrapItem>
                <Button
                  as={NavLink}
                  to="/results"
                  bgColor={"yellow.200"}
                  _hover={{ bg: "yellow.300", borderColor: "yellow.400" }}
                  borderRadius={50}
                  p={5}
                  boxShadow="xl"
                  variant="navOutline"
                  fontSize="2xl"
                  color="yellow.700"
                >
                  Results
                </Button>
              </WrapItem>
            </Wrap>
          </Flex>
        </nav>
      </Box>

      <Outlet />
    </div>
  );
}
