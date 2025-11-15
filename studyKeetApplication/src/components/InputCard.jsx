import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Tabs,
  TabList,
  TabPanels,
  TabIndicator,
  SlideFade,
  Heading,
  Flex,
  Spacer,
  useToast,
  Button,
} from "@chakra-ui/react";
import { inView } from "framer-motion";
import { TabButton } from "./TabButton.jsx";
import { TabContent } from "./TabContent.jsx";
import { useNavigate } from "react-router-dom";
export default function InputCard() {
  const [contentType, setContentType] = useState("Text");
  const [content, setContent] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  const handleContentChange = (type, data) => {
    setContentType(type);
    if (type === "PDF") {
      // For PDFs, handle file input separately
      setContent(data); // data is the file object
      setIsSubmitDisabled(!data);
    } else {
      setContent(data);
      setIsSubmitDisabled(!data && type !== "PDF");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      localStorage.clear();
      localStorage.setItem("contentType", contentType);
      if (contentType === "PDF") {
        // Handle file as a Blob or Base64 encoding
        const reader = new FileReader();
        reader.onloadend = () => {
          localStorage.setItem("content", reader.result); // Store as base64
          navigate("/studyboard");
        };
        reader.readAsDataURL(content); // Read file as data URL
      } else {
        localStorage.setItem("content", content);
        navigate("/studyboard");
      }
    } catch (error) {
      toast({
        title: "Submission failed. Enter content.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <div>
      <SlideFade in={inView} offsetY="-50px">
        <Card
          p={50}
          margin={5}
          bgColor="teal.300"
          borderRadius={50}
          boxShadow="dark-lg"
        >
          <CardHeader>
            <Heading size="2xl" color="teal.900" textAlign="center">
              What Will You Study?
            </Heading>
          </CardHeader>
          <CardBody>
            <Tabs variant="unstyled">
              <TabList>
                <TabButton>Text</TabButton>
                <TabButton>URL</TabButton>
                <TabButton>PDF</TabButton>
              </TabList>
              <TabIndicator
                mt="-1.5px"
                height="2px"
                bg="orange.500"
                borderRadius="1px"
                zIndex={2}
                position={"relative"}
              />
              <TabPanels>
                <TabContent type="Text" onChange={handleContentChange} />
                <TabContent type="URL" onChange={handleContentChange} />
                <TabContent type="PDF" onChange={handleContentChange} />
              </TabPanels>
            </Tabs>
          </CardBody>
          <Flex>
            <Spacer></Spacer>
            <CardFooter>
              <Button
                onClick={handleSubmit}
                bgColor={"orange.300"}
                _hover={{ bg: "yellow.300", color: "teal.400" }}
                color="white"
                borderRadius={10}
                p={2}
                boxShadow="xl"
                isDisabled={isSubmitDisabled}
              >
                Submit
              </Button>
            </CardFooter>
          </Flex>
        </Card>
      </SlideFade>
    </div>
  );
}
// export const createAction = async ({ request }) => {
//   const data = await request.formData();
//   const input = {
//     information: data.get("information"),
//   };
//   console.log(input);
// return redirect("/studyboard");
// }
