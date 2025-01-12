React 中会产生闭包的原因无非就是：组件渲染的本质就是调用组件函数，函数执行会创建函数作用域.
组件初次渲染时作用域里的 state 是 0, 组件第二次渲染二次执行组件函数会创建新的作用域
作用域的查找方式是根据函数的词法作用域向上查找,
定时器里的函数引用的 state 值还是组件初次渲染时的值，会产生闭包.

示例:

```tsx
function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setInterval(() => {
      console.log(count);
      setCount(count + 1);
    }, 1000);
  }, []);

  return <div>{count}</div>;
}
```

1. App 函数执行, 被挂载到 DOM 上, 展示 count 为 0.
2. useEffect 执行.
3. setInterval 执行, 打印 count 为 0, setCount 函数调用.
4. App 函数重新渲染, 但 useEffect 并没有重新执行.
5. 因此 useEffect 中 count 变量引用的是上一个 App 函数中的值, 形成闭包.

执行结果就是控制台输出的 count 一直是 0, 页面只有第一次从 0 -> 1.

### 解法一

使用 setState 中的函数式参数, prev 为先前的**状态**, 而不是直接拿 count 值, 所以没有闭包产生.
或者使用 useReducer, 不直接引用 state, 所以也不会产生闭包.

```tsx
useEffect(() => {
  setInterval(() => {
    // console.log(count, "count"); <- 依然会产生闭包
    setCount((prev) => prev + 1);
  }, 1000);
}, []);
```

**注意**: 这里没有使用打印 count 值, 因为会产生闭包, 不过使用函数参数的 `setCount` 不会受到影响.
因此有第二种解法.

### 解法二

有时必须要用到 state 的，也就是肯定会形成闭包.

可以给 useEffect 依赖数组添加 state 变量, 等 state 改变时重新执行 useEffect 函数.

但定时器时间就不准了... 所以可以采用第三种解法.

### 解法三

**需求:**
页面每秒展示内容 控制台每秒打印一个数字.

**解决**
页面要每秒展示内容, 那么每秒都要刷新页面, 更新组件, 使用 setState 来更新.

useRef 保存 `setState` 函数.
每次触发渲染时, 更新 `ref.current`, 保证拿到最新的 state 值.

```tsx
const [count, setCount] = useState(0);

const updateCount = () => {
  console.log(count + 1);
  setCount(count + 1);
};
const ref = useRef(updateCount);

// 组件刷新时更新
ref.current = updateCount;

useEffect(() => {
  const timer = setInterval(() => {
    ref.current();
  }, 1000);
}, []);
```

封装成 hook:
**作用**: 间隔执行函数.

useLayoutEffect 里更新 ref.current 的值，它是在 dom 操作完之后同步执行的，比 useEffect 更早.

```tsx
function useInterval(fn: () => void, delay: number) {
  const ref = useRef(fn);

  useLayoutEffect(() => {
    ref.current = fn;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      ref.current();
    }, delay || 0);

    return () => clearInterval(timer);
  });
}
```

定时器没有返回清理函数, 调用者无法停止定时器.
加一个 ref 来保存 clean 函数.

```tsx
function useInterval(fn: () => void, delay: number) {
  const ref = useRef(fn);

  // 还没绑定呢ˋ( ° ▽、° )
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

    // 绑定
    cleanTimerRef.current = () => {
      clearInterval(timer);
    };

    return clean;
  });

  return clean;
}
```

为什么要用 useCallback 包裹返回的函数呢？

因为这个返回的函数可能作为参数传入别的组件，这样用 useCallback 包裹就可以避免该参数的变化，配合 memo 可以起到减少没必要的渲染的效果。
