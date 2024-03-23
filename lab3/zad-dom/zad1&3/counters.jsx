function Counter({ initial, delay }) {
  const [count, setCount] = React.useState(initial);
  const interval = React.useRef(null);

  const handleStart = () => {
    interval.current = setInterval(() => {
      setCount((curr) => (curr += 1));
    }, delay);
  };

  const handleStop = () => {
    clearInterval(interval.current);
  };

  return (
    <div className="counter">
      <div>
        <span>Counter→</span>
        <span className="counter-value">{count}</span>
      </div>
      <div>
        <button onClick={handleStart}>Start</button>
        <button onClick={handleStop}>Stop</button>
      </div>
    </div>
  );
}

const container = document.getElementById("counters-container");
const root = ReactDOM.createRoot(container);
root.render(
  <React.Fragment>
    <Counter initial={0} delay={500} />
    <Counter initial={-999} delay={10} />
  </React.Fragment>
);
