export function createTimer({
  duration = 180,
  onTick = () => {},
  onFinish = () => {},
} = {}) {
  let remainingSeconds = duration;
  let intervalId = null;

  function start() {
    if (intervalId !== null || remainingSeconds <= 0) {
      return;
    }

    intervalId = setInterval(() => {
      remainingSeconds--;

      onTick(remainingSeconds);

      if (remainingSeconds <= 0) {
        pause();
        onFinish();
      }
    }, 1000);
  }

  function pause() {
    clearInterval(intervalId);
    intervalId = null;
  }

  function reset() {
    pause();
    remainingSeconds = duration;
    onTick(remainingSeconds);
  }

  function getRemainingTime() {
    return remainingSeconds;
  }

  return {
    start,
    pause,
    reset,
    getRemainingTime,
  };
}
