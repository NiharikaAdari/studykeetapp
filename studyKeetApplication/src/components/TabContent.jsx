import React, { useState } from "react";
import {
  Box,
  TabPanel,
  FormControl,
  Textarea,
  FormHelperText,
  Flex,
  Spacer,
  Button,
  Input,
} from "@chakra-ui/react";
import { Form } from "react-router-dom";

export function TabContent({ type, onChange }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Extract the file from the event
    setSelectedFile(file);
    if (file) {
      onChange(type, file); // Pass the file to the onChange handler
    }
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "text") {
      setText(value);
      onChange(type, text);
    }
    if (name === "url") {
      setUrl(value);
      onChange(type, url);
    }
  };

  return (
    <Box bgColor="white" borderRadius="10px" zIndex={1} position={"relative"}>
      <TabPanel>
        {type === "Text" && (
          <Form>
            <FormControl>
              <Textarea
                placeholder="Enter Information..."
                name="text"
                onChange={handleInputChange}
              />
              <FormHelperText>
                Paste in the information you want to study!
              </FormHelperText>
            </FormControl>
          </Form>
        )}
        {type === "URL" && (
          <Form>
            <FormControl>
              <Textarea
                placeholder="Enter URL..."
                name="url"
                onChange={handleInputChange}
              />
              <FormHelperText>
                Paste in the URL from the webpage you want to study!
              </FormHelperText>
            </FormControl>
          </Form>
        )}
        {type === "PDF" && (
          <Form encType="multipart/form-data">
            <FormControl>
              <Input
                type="file"
                accept=".pdf"
                name="file"
                onChange={handleFileChange}
              />
              <FormHelperText>
                Upload the PDF file you want to study!
              </FormHelperText>
            </FormControl>
          </Form>
        )}
      </TabPanel>
    </Box>
  );
}
