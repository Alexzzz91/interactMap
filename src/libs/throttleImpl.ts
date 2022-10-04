const throttleImpl = (cb, delay: number) => {
    let isThrottled = false;

    return (...args) => {
        if (isThrottled) {
            return;
        }
        
        isThrottled = true;
        
        cb(...args);

        setTimeout(() => {
            isThrottled = false;
        }, delay);
    };
};

export {
    throttleImpl,
};
