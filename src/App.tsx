import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

function useInterval(fn: () => void, delay: number) {
  const ref = useRef(fn);

  const cleanTimerRef = useRef<() => void>();

  const clean = useCallback(() => {
    cleanTimerRef.current?.();
  }, []);

  useLayoutEffect(() => {
    ref.current = fn;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      ref.current();
    }, delay || 0);

    cleanTimerRef.current = () => {
      clearInterval(timer);
    };

    return clean;
  });

  return clean;
}

function App() {
  const [count, setCount] = useState(0);

  const updateCount = () => {
    setCount(count + 1);
  };

  useInterval(updateCount, 1000);

  return <div>{count}</div>;
}

export default App;
