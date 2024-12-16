1. useState

f(state) = UI

state 数据尽量和 UI 对应

useState 的参数可以是函数, 函数返回值作为初识值. 不支持异步.

useState 返回的 `setState` 函数的参数可以是新值或函数.
`setNum(num => num + 10)`

2. useEffect

副作用, 每次执行可能产生不同的结果.

useEffect 接收两个参数, 第一个参数是一个函数(不支持 async 语法糖), 第二个参数是依赖数组.

其中当依赖数组中的值发生改变时, useEffect 重新执行.
如果不传第二个参数, useEffect 每次都执行
如果传一个空数组, useEffect 只在组件挂载时执行一次

函数的返回值是一个函数, 在组件被卸载或者依赖数组发生改变时执行, 一般用来处理清理逻辑.

示例:

```tsx
function App() {
  const [num, setNum] = useState(0);
  async function queryData() {
    const data = await new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(444);
      }, 2000);
    });

    return data;
  }
  useEffect(() => {
    log("xxxxxxxxxx");
    queryData().then((d) => {
      setNum(d);
    });
  }, []);

  return (
    <>
      <div>num is {num}</div>
      <button onClick={() => setNum((num) => num + 10)}>click me</button>
    </>
  );
}
```

App 函数会执行两次, 一开始的渲染, 2 秒后 state 发生变化, 组件重新渲染.
数据驱动视图, 但 useEffect 只会执行一次, 因为依赖数组为空.

一般依赖数组放空数组或者 state 状态变量

3. useLayoutEffect

存在的目的是为了解决 useEffect 中的函数, 执行时可能在出现渲染前或后的问题.

Js 执行和渲染页面是阻塞的, useEffect 中的函数会在操作 DOM 之后异步执行. 得等到渲染页面结束.

![react 通关秘籍 02](<../img/Screenshot 2024-12-15 at 13.15.27.png>)

useLayoutEffect 中的函数保证在渲染前执行, 但如果函数逻辑复杂, 会导致页面阻塞渲染... 也就是白屏.

4. useReducer

类似 useState, 都是创建一个 state, 但 useReducer 通过 dispatch 调用 reducer 函数.
如果有多个方法操作同一个 state, 考虑提取成一个 reducer. reducer 可以移到组件外部!!

useReducer 的第一个参数是 reducer, 用来处理复杂逻辑, 第二个参数是初始值, 第三个参数是一个函数, 用来操作初始值...肥肠绕...

useReducer 的第一个返回值是 reducer 操作后返回的值, 第二个是 dispatch 函数, 用来操作传入的 reducer 函数.
调用 dispatch 函数时传入的参数, 对应着 reducer 函数中预先定义好的 action.
一般将 action 设置为对象, 方便描述对数据的操作.

```tsx
interface IData {
  r: number;
}
interface IAction {
  type: "incr" | "decr";
  payload: number;
}

function reducer(state: IData, action: IAction) {
  switch (action.type) {
    case "incr":
      return {
        r: state.r + action.payload,
      };
    case "decr":
      return {
        r: state.r - action.payload,
      };
  }
}

function App() {
  const [num, dispatch] = useReducer<Reducer<IData, IAction>>(reducer, {
    r: 1,
  });

  return (
    <>
      <div>num is {num.r}</div>
      <button onClick={() => dispatch({ type: "incr", payload: 10 })}>
        click me + 10
      </button>
      <button onClick={() => dispatch({ type: "decr", payload: 1000 })}>
        click me
      </button>
    </>
  );
}
```

数据不可变, 直接操作原数据无法触发重新渲染, 所以需要复制一份然后覆盖. 函数式编程牢记不可变.
复杂对象深拷贝消耗性能, 因此常搭配 immer 库来实现复制原对象然后修改.

只要涉及到 state 的修改，就必须返回新的对象，不管是 useState 还是 useReducer

5. useRef

保存任何值的引用!! current 属性上就是保存的值.
useRef 一般是用来存一些不是用于渲染的内容的.
ref.current 的值改了不会触发重新渲染

forwardRef 略, react 19 已废弃

6. useContext

跨任意层组件传递数据.

createContext 函数必须在组件函数外使用, 需要传递一个默认值, 用于那些没有消费这个值的组件使用.
返回值需要导出, 供其他组件消费使用.

最佳实践: 单独创建一个 context 文件夹用于存放.

```jsx
// counterContext.js
import { createContext } from "react";
export const counterContext = createContext(0);

// -----------------
import { counterContext } from "./counterContext";

function App() {
  return (
    <counterContext.Provider value={0}>
      <Child />
    </counterContext.Provider>
  );
}

function Child() {
  const value = useContext(counterContext);
  return <div>{value}</div>;
}
```

7. memo, useMemo, useCallback

memo 为高阶组件(函数), 包裹的组件, 然后返回一个组件.
当 memo 包裹的组件的 props 变了,组件重新渲染, 减少不必要的渲染.

memo 是防止 props 没变时的重新渲染，useMemo 和 useCallback 是防止 props 的不必要变化。

useCallback

```jsx
const bbbCallback = useCallback(function () {}, []);
```

它的作用就是当 deps 数组不变的时候，始终返回同一个 function，当 deps 变的时候，才把 function 改为新传入的。

useMemo

```jsx
const count2 = useMemo(() => {
  return count * 10;
}, [count]);
```

同 useCallback, 只是保存的是值.

总结:

如果子组件用了 memo，那给它传递的对象、函数类的 props 就需要用 useMemo、useCallback 包裹，否则，每次 props 都会变，memo 就没用了.
反之，如果 props 使用 useMemo、useCallback，但是子组件没有被 memo 包裹，那也没意义，因为不管 props 变没变都会重新渲染，只是做了无用功.

o(≥v≤)o 眼睛要瞎力.
