import React, { useState } from "react";
import {
  Box,
  TabPanel,
  FormControl,
  Textarea,
  FormHelperText,
  Input,
} from "@chakra-ui/react";
import { Form } from "react-router-dom";

export function TabContent({ type, onChange }) {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    if (onChange) {
      onChange(type, file);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "text") {
      setText(value);
    }
    if (name === "url") {
      setUrl(value);
    }
    if (onChange) {
      onChange(type, value);
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
                value={text}
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
                value={url}
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
