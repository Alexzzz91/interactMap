import { createEffect, createEvent, createStore, sample } from "effector";

const cursorChange = createEvent<string>();
const $cursor = createStore("default").on(cursorChange, (_state, newCursor) => newCursor);

const modeChange = createEvent<string>();
const $mode = createStore("select_mode").on(modeChange, (_state, mode) => mode);

const multipleModeChange = createEvent();
const $multipleMode = createStore(true).on(multipleModeChange, (state) => !state);

const hasActionChange = createEvent<number>();
const $hasAction = createStore(0).on(hasActionChange, (_state, hasAction) => hasAction);

const modeOptionsChange = createEvent<string>();
const $modeOptions = createStore("").on(modeOptionsChange, (_state, modeOptions) => modeOptions);

const pageMounted = createEvent();

const zoomChange = createEvent<number>();
const $zoom = createStore(0).on(zoomChange, (_state, zoom) => zoom);

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
    return JSON.parse(source);
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
    modeChange,
    $mode,

    multipleModeChange,
    $multipleMode,

    zoomChange,
    $zoom,
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