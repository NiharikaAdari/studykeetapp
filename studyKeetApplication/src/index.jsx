import * as React from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { dividerTheme } from "./components/Divider.jsx";
import { buttonTheme } from "./components/CustomButton.jsx";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

//extend theme
const fonts = {
  body: "Courier New",
  heading: "Lucida Console",
  mono: "Times New Roman",
};
const components = {
  Divider: dividerTheme,
  Button: buttonTheme,
};

const theme = extendTheme({ fonts, components });

const root = createRoot(document.body);
root.render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>
);
