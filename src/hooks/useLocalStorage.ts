import * as React from "react";

function useLocalStorage(key: string, initialValue: string) {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: (string) => void | string) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      if (valueToStore) {
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log("useLocalStorage setValue", error);
    }
  };

  return [storedValue, setValue];
}

export {
  useLocalStorage,
};