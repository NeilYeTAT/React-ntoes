import { useRef } from "react";

function MyInput({ ref }) {
  return <input ref={ref} />;
}

function Form() {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus();
  }

  return (
    <>
      <MyInput ref={inputRef} />
      <button onClick={handleClick}>聚焦输入框</button>
    </>
  );
}

function App() {
  return (
    <div>
      <Form></Form>
    </div>
  );
}

export default App;
