React 中会产生闭包的原因无非就是：组件渲染的本质就是调用组件函数，函数执行会创建函数作用域，组件初次渲染时作用域里的 state 是 1，组件第二次渲染二次执行组件函数会创建新的作用域，作用域的查找方式是根据函数的词法作用域向上查找，定时器里的函数引用的 state 值还是组件初次渲染时的值，会产生闭包.

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

执行结果就是控制台输出的 count 一直是 0, 页面只有第一次从 0 -> 1.

产生闭包陷阱的原因是 setInterval 中的回调函数对外部变量（比如 count）的捕获方式导致的.
setInterval 的回调闭包捕获了第一册 App 函数中的 count 值对吗， 这个 App 函数在内存中也没有释放.

### 解法一

使用 setState 中的函数式参数, prev 为上一次的状态, 而不是直接拿 count 值, 所以没有闭包产生.
或者使用 useReducer, 不直接引用 state, 所以也不会产生闭包.

```tsx
useEffect(() => {
  setInterval(() => {
    // console.log(count, "count"); <- 会产生闭包
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

定时器不能重新跑 effect 函数.
useRef 保存 `setState` 函数.
每次触发渲染时, 更新 `ref.current`, 保证拿到最新的 state 值.

```tsx
const [count, setCount] = useState(0);

const updateCount = () => {
  setCount(count + 1);
};
const ref = useRef(updateCount);

ref.current = updateCount;

useEffect(() => {
  const timer = setInterval(() => {
    ref.current();
  }, 1000);
}, []);
```

封装成 hook:
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
