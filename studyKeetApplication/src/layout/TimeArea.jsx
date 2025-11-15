import React from "react";
import { useEffect } from "react";
import { Card, CardBody, Flex, SlideFade } from "@chakra-ui/react";
import Timer from "../components/Timer.jsx";
import { inView } from "framer-motion";
export default function TimeArea() {
  useEffect(() => {
    window.scrollTo({
      top: 375,
      behavior: "smooth",
    });
  }, []);

  return (
    <div>
      <Flex direction="column" align="center" justify="center" p={4}>
        <SlideFade in={inView} offsetY="-50px">
          <Card
            p={10}
            margin={50}
            bgColor="teal.300"
            borderRadius={50}
            boxShadow="dark-lg"
            overflowY="auto"
            overflow="hidden"
          >
            <CardBody>
              <Timer></Timer>
            </CardBody>
          </Card>
        </SlideFade>
      </Flex>
    </div>
  );
}
