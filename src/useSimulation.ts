import { useEffect, useRef, useState } from "react";
import { flashIndexAt } from "./physics";

export function useSimulation() {
  const [rotationPeriod, setRotationPeriod] = useState(1);
  const [flashPeriod, setFlashPeriod] = useState(1.9);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    if (!running) return;
    let previous: number | undefined;
    let frame = 0;
    const tick = (now: number) => {
      if (previous !== undefined) {
        const elapsed = ((now - previous) / 1000) * speedRef.current;
        setTime((value) => value + elapsed);
      }
      previous = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const onVisibility = () => {
      if (document.hidden) setRunning(false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [running]);

  function reset() {
    setRunning(false);
    setTime(0);
  }
  function configure(t: number, te: number) {
    reset();
    setRotationPeriod(t);
    setFlashPeriod(te);
  }
  function step() {
    setRunning(false);
    setTime((flashIndexAt(time, flashPeriod) + 1) * flashPeriod);
  }
  return {
    rotationPeriod,
    flashPeriod,
    time,
    running,
    speed,
    setSpeed,
    setRunning,
    reset,
    configure,
    step,
  };
}
