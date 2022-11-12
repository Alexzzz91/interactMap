import { createEvent, createStore } from "effector";

const schemeNameChange = createEvent<string>();
const $schemeName = createStore("Название схемы").on(schemeNameChange, (_state, newName) => newName);

export {
  schemeNameChange,
  $schemeName,
};