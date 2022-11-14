import { createDomain, createEffect, createEvent, createStore, sample } from "effector";
import { ModeOptions } from "../types/editorVars";
import { loadFromStorage, saveToStorage } from "./persist";

const cursorChange = createEvent<string>();
const $cursor = createStore("default").on(cursorChange, (_state, newCursor) => newCursor);

const hasBackgroundChange = createEvent<number>();
const $hasBackground = createStore(0).on(hasBackgroundChange, (_state, mode) => mode);

const ratioWidthZoomChange = createEvent<number>();
const $ratioWidthZoom = createStore(1).on(ratioWidthZoomChange, (_state, ratio) => ratio);

const modeChange = createEvent<string>();
const $mode = createStore("select_mode").on(modeChange, (_state, mode) => mode);

const modeOptionsChange = createEvent<ModeOptions>();
const $modeOptions = createStore<ModeOptions | null>(null).on(modeOptionsChange, (_state, modeOptions) => modeOptions);

const multipleModeChange = createEvent();
const $multipleMode = createStore(true).on(multipleModeChange, (state) => !state);

const hasActionChange = createEvent<number>();
const $hasAction = createStore(0).on(hasActionChange, (_state, hasAction) => hasAction);




const pageMounted = createEvent();






const zoomChange = createEvent<number>();
const zoomIncrement = createEvent<number>();
const zoomDecrement = createEvent<number>();
const zoomReset = createEvent();
const $zoom = createStore(9)
  .on(zoomChange, (_state, zoom) => zoom)
  .on(zoomIncrement, (state, increment) => state += increment)
  .on(zoomDecrement, (state, decrement) => state -= decrement)
  .reset(zoomReset);

const originXViewboxChange = createEvent<number>();
const originXViewboxIncrement = createEvent<number>();
const originXViewboxDecrement = createEvent<number>();
const originXViewboxReset = createEvent();
const $originXViewbox = createStore(0)
  .on(originXViewboxChange, (_state, originXViewbox) => originXViewbox)
  .on(originXViewboxIncrement, (state, increment) => state += increment)
  .on(originXViewboxDecrement, (state, decrement) => state -= decrement)
  .reset(originXViewboxReset);

const originYViewboxChange = createEvent<number>();
const originYViewboxIncrement = createEvent<number>();
const originYViewboxDecrement = createEvent<number>();
const originYViewboxReset = createEvent();
const $originYViewbox = createStore(0)
  .on(originYViewboxChange, (_state, originYViewbox) => originYViewbox)
  .on(originYViewboxIncrement, (state, increment) => state += increment)
  .on(originYViewboxDecrement, (state, decrement) => state -= decrement)
  .reset(originYViewboxReset);

const widthViewboxChange = createEvent<number>();
const widthViewboxIncrement = createEvent<number>();
const widthViewboxDecrement = createEvent<number>();
const widthViewboxReset = createEvent();
const $widthViewbox = createStore(0)
  .on(widthViewboxChange, (_state, widthViewbox) => widthViewbox)
  .on(widthViewboxIncrement, (state, increment) => state += increment)
  .on(widthViewboxDecrement, (state, decrement) => state -= decrement)
  .reset(widthViewboxReset);

const heightViewboxChange = createEvent<number>();
const heightViewboxReset = createEvent();
const heightViewboxIncrement = createEvent<number>();
const heightViewboxDecrement = createEvent<number>();
const $heightViewbox = createStore(0)
  .on(heightViewboxChange, (_state, heightViewbox) => heightViewbox)
  .on(heightViewboxIncrement, (state, increment) => state += increment)
  .on(heightViewboxDecrement, (state, decrement) => state -= decrement)
  .reset(heightViewboxReset);

const setRatioViewbox = createEvent<number>();
const $ratioViewbox = createStore(0).on(setRatioViewbox, (_state, ratio) => ratio);







const history = createDomain("history");

loadFromStorage(history, localStorage);
saveToStorage(history, localStorage);


export const $history = history.store("", {name: "history"});

export const changeHistory = onChangeField($history);

function onChangeField(store) {
  const onChange = createEvent();
  store.on(onChange, (_, value) => {
    console.log('value', value);
    return value;
  });
  return onChange;
}


const messageDeleteClicked = createEvent<{}>();
const messageSendClicked = createEvent();
const messageEnterPressed = createEvent();
const messageTextChanged = createEvent<string>();
const loginClicked = createEvent();
const logoutClicked = createEvent();

interface Author {
  id: string;
  name: string;
}

export interface Message {
  author: Author;
  text: string;
  timestamp: number;
}

const LocalStorageKey = "effector-example-history";

function loadHistory(): Message[] | void {
  const source = localStorage.getItem(LocalStorageKey);
  if (source) {
    try {
      return JSON.parse(source);
    } catch (error) {
      console.log("loadHistory", error);
      return undefined;
    }
  }
  return undefined;
}

// Here effect defined with static types. void defines no arguments.
// Second type argument defines a successful result type.
// Third argument is optional and defines a failure result type.
export const messagesLoadFx = createEffect<void, Message[], Error>( () => {
  const history = loadHistory();

  return history ?? [];
});

// You can read this code like:
// When page mounted, call messages load and session load simultaneously
sample({
    clock: pageMounted,
    target: [messagesLoadFx],
});

export {
    cursorChange,
    $cursor,

    hasBackgroundChange,
    $hasBackground,

    ratioWidthZoomChange,
    $ratioWidthZoom,
    
    modeChange,
    $mode,

    multipleModeChange,
    $multipleMode,

    zoomChange,
    zoomIncrement,
    zoomDecrement,
    zoomReset,
    $zoom,

    setRatioViewbox,
    $ratioViewbox,

    originXViewboxChange,
    originXViewboxReset,
    originXViewboxIncrement,
    originXViewboxDecrement,
    $originXViewbox,
    
    originYViewboxChange,
    originYViewboxReset,
    originYViewboxIncrement,
    originYViewboxDecrement,
    $originYViewbox,
    
    widthViewboxChange,
    widthViewboxReset,
    $widthViewbox,

    heightViewboxChange,
    heightViewboxReset,
    $heightViewbox,

    modeOptionsChange,
    $modeOptions,
    hasActionChange,
    $hasAction,

    pageMounted,
    messageDeleteClicked,
    messageSendClicked,
    messageEnterPressed,
    messageTextChanged,
    loginClicked,
    logoutClicked,
};