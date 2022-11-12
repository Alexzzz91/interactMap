import { ThemeTypings } from "@chakra-ui/react";
import { createDomain, createEvent } from "effector";
import { loadFromStorage, saveToStorage } from "./persist";

const theme = createDomain("theme");

loadFromStorage(theme, localStorage);
saveToStorage(theme, localStorage);

const themeChange = createEvent<ThemeTypings["colorSchemes"]>();
const $themeName = theme.store("teal", {name: "themeName"}).on(themeChange, (_state, newName) => {
  console.log('newName', newName);
  return newName;
});

export {
  themeChange,
  $themeName,
};