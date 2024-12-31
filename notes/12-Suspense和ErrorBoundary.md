```tsx
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
```

`Suspense` 用法比较简单, 如果在 nextjs 中更加简单...
在 react 需要使用 lazy 函数异步导入其他的组件用于展示.
fallback 中的组件作为骨架屏.

底层原理就是 throw 一个 promise，然后 React 会捕获这个 promise，交给最近的 Suspense 组件来处理.
