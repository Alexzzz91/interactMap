import { useCallback, useEffect, useRef } from "react";
import { throttleImpl } from "../libs/throttleImpl";

type Fn = {
    (someArg: unknown | unknown[]): void;
};
  
const useThrottle = (cb: Fn, delay: number) => {
    const cbRef = useRef(cb);

    useEffect(() => {
      cbRef.current = cb;
    });

    return useCallback(
        throttleImpl(
            (...args: unknown[]) => cbRef.current(...args),
        delay),
    [delay]);
};

export {
    useThrottle,
};
