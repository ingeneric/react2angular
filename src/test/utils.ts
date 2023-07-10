export const delay = async (ms: number = 0) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const nextTick = (cb: () => void) => {
  Promise.resolve().then(cb);
};
