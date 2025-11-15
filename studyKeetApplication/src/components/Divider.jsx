import { defineStyle, defineStyleConfig } from "@chakra-ui/styled-system";

const brandPrimary = defineStyle({
  borderWidth: "3px",
  borderStyle: "dashed",
  borderColor: "teal.300",
});

const xl = defineStyle({
  borderWidth: "10px",
  borderStyle: "solid",
  borderRadius: 20,
});

const thick = defineStyle({
  borderWidth: "5px",
  borderStyle: "solid",
  borderRadius: 10,
  borderColor: "teal.300",
});

const postit = defineStyle({
  borderWidth: "1px",
  borderStyle: "dashed",
  borderRadius: 1,
  borderColor: "black",
});

export const dividerTheme = defineStyleConfig({
  thick,
  sizes: {
    xl: xl,
  },
  variants: {
    brand: brandPrimary,
    thick: thick,
    postit: postit,
  },
});
