import { lazy, Suspense } from "react";

const LazyMainView = lazy(() => import("./MainView"));

function App() {
  return (
    <div>
      <Suspense fallback={<div>loading...</div>}>
        <LazyMainView />
      </Suspense>
    </div>
  );
}

export default App;
