import React, { useEffect, useState } from "react";
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
  FormControl,
  FormLabel,
  Switch,
  Collapse,
  Select,
  Input,
  VStack,
  Text,
} from "@chakra-ui/react";
import { inView } from "framer-motion";
import { TabButton } from "./TabButton.jsx";
import { TabContent } from "./TabContent.jsx";
import { useNavigate } from "react-router-dom";
import { useNestContext } from "./NestContext.jsx";

export default function InputCard() {
  const [contentType, setContentType] = useState("Text");
  const [content, setContent] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [saveToNest, setSaveToNest] = useState(false);
  const [selectedNestId, setSelectedNestId] = useState("");
  const [eggName, setEggName] = useState("");
  const navigate = useNavigate();
  const toast = useToast();
  const { nests, addEgg } = useNestContext();

  const hasNests = nests.length > 0;

  useEffect(() => {
    if (!saveToNest) {
      setSelectedNestId("");
      setEggName("");
      return;
    }

    if (!hasNests) {
      setSelectedNestId("");
      setEggName("");
      return;
    }

    setSelectedNestId((current) => {
      const isValid = nests.some((nest) => nest.id === current);
      if (isValid) {
        return current;
      }
      return nests[0]?.id ?? "";
    });
  }, [saveToNest, hasNests, nests]);

  const handleContentChange = (type, data) => {
    setContentType(type);
    if (type === "PDF") {
      setContent(data);
      setIsSubmitDisabled(!data);
      return;
    }

    const value = typeof data === "string" ? data : "";
    setContent(value);
    setIsSubmitDisabled(!value.trim());
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!content) {
      toast({
        title: "Submission failed. Enter content.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (saveToNest) {
      if (!hasNests) {
        toast({
          title: "No nests available",
          description: "Create a nest first using the panel below.",
          status: "warning",
          duration: 3500,
          isClosable: true,
        });
        return;
      }
      if (!selectedNestId) {
        toast({
          title: "Select a nest",
          description: "Choose where to store this study material.",
          status: "warning",
          duration: 3500,
          isClosable: true,
        });
        return;
      }
      if (!eggName.trim()) {
        toast({
          title: "Egg name required",
          description: "Name your study material so you can find it later.",
          status: "warning",
          duration: 3500,
          isClosable: true,
        });
        return;
      }
    }

    const persistAndNavigate = (payload) => {
      try {
        localStorage.setItem("contentType", contentType);
        localStorage.setItem("content", payload);

        if (saveToNest) {
          addEgg(selectedNestId, {
            name: eggName.trim(),
            type: contentType,
            content: payload,
          });
          toast({
            title: "Study material saved",
            description: "Your egg is safely stored in its nest.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }

        navigate("/studyboard");
      } catch (error) {
        toast({
          title: "Submission failed",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    if (contentType === "PDF") {
      const reader = new FileReader();
      reader.onloadend = () => {
        persistAndNavigate(reader.result);
      };
      reader.onerror = () => {
        toast({
          title: "Unable to read PDF",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      };
      reader.readAsDataURL(content);
    } else {
      persistAndNavigate(content);
    }
  };

  return (
    <div>
      <SlideFade in={inView} offsetY="-50px">
        <Card p={50} margin={5} bgColor="teal.300" borderRadius={50} boxShadow="dark-lg">
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
              <TabIndicator mt="-1.5px" height="2px" bg="orange.500" borderRadius="1px" zIndex={2} position="relative" />
              <TabPanels>
                <TabContent type="Text" onChange={handleContentChange} />
                <TabContent type="URL" onChange={handleContentChange} />
                <TabContent type="PDF" onChange={handleContentChange} />
              </TabPanels>
            </Tabs>
          </CardBody>
          <Flex>
            <Spacer />
            <CardFooter>
              <VStack align="stretch" spacing={4} mb={4}>
                <FormControl display="flex" alignItems="center">
                  <Switch
                    id="save-to-nest"
                    isChecked={saveToNest}
                    onChange={(event) => setSaveToNest(event.target.checked)}
                    mr={3}
                  />
                  <FormLabel htmlFor="save-to-nest" mb={0}>
                    Save this study material to a nest
                  </FormLabel>
                </FormControl>
                <Collapse in={saveToNest} animateOpacity>
                  <VStack align="stretch" spacing={3} bg="blackAlpha.100" p={4} borderRadius="lg">
                    {hasNests ? (
                      <FormControl>
                        <FormLabel>Select nest</FormLabel>
                        <Select
                          placeholder="Choose a nest"
                          value={selectedNestId}
                          onChange={(event) => setSelectedNestId(event.target.value)}
                        >
                          {nests.map((nest) => (
                            <option key={nest.id} value={nest.id}>
                              {nest.name}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Text color="gray.600">Create a nest using the panel at the bottom.</Text>
                    )}
                    <FormControl>
                      <FormLabel>Egg name</FormLabel>
                      <Input
                        placeholder="e.g. Chapter 3 Notes"
                        value={eggName}
                        onChange={(event) => setEggName(event.target.value)}
                        isDisabled={!hasNests}
                      />
                    </FormControl>
                  </VStack>
                </Collapse>
              </VStack>
              <Button
                onClick={handleSubmit}
                bgColor="orange.300"
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
