## 1. useState

f(state) = UI

state 数据尽量和 UI 对应

useState 的参数可以是任意类型的值.
如果是函数, 它必须是纯函数, 且不接受任何参数, 函数返回值作为初识值. 不支持异步.
该函数仅在初始化其间运行一次, 当组件重新渲染时, 也不会执行了.
**如果传递的是函数调用, 那么每次渲染时都会重新执行!!**

```ts
// good, 只执行一次
const [todos, setTodos] = useState(createInitialTodos);
// bad, 重复执行
const [todos, setTodos] = useState(createInitialTodos());
```

useState 返回的 `setState` 函数的参数可以是新值或函数.
如果是函数, 它必须是纯函数, 最多只能接受上一个 `preState` 作为参数, 最终返回下一个 `state`.

React 将把你的更新函数放入队列中并重新渲染组件.
在下一次渲染期间, React 将通过把队列中所有**更新函数**应用于先前的状态(**待定状态**)来计算下一个状态.
React 将更新函数放入队列中. 然后, 在下一次渲染期间, 它将按照相同的顺序调用它们.
这也就解释了为什么下列这种情况的出现:

```ts
function handleClick() {
  setAge(age + 1); // setAge(42 + 1)
  setAge(age + 1); // setAge(42 + 1)
  setAge(age + 1); // setAge(42 + 1)
}

function handleClick() {
  setAge((a) => a + 1); // setAge(42 => 43)
  setAge((a) => a + 1); // setAge(43 => 44)
  setAge((a) => a + 1); // setAge(44 => 45)
}
```

tips:
在渲染列表时, 经常使用 key 属性来确保唯一, 但还可以通过 key 来重置组件的 state.
通过 `handleReset` 方法改变 key 值.

```tsx
<button onClick={handleReset}>Reset</button>
<Form key={version} />
```

当 key 改变时, React 会从头开始重新创建 Form 组件(以及它的所有子组件), 所以它的状态被重置了.

## 2. useEffect

副作用, 每次执行可能产生不同的结果.

useEffect 接收两个参数, 第一个参数是一个函数(不支持 async 语法糖), 第二个参数是依赖数组.
当组件被挂载时(添加到 DOM 上), 第一个函数执行.

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

App 函数会执行两次, 一开始渲染时执行一次, 2 秒后 state 发生变化, 组件重新渲染.

note:
如果 effect 是交互(如点击)引起的, react 会在重新绘制屏幕前先运行 effect.
如果 effect 是非交互引起的, react 会先绘制屏幕, 再运行 effect

## 3. useLayoutEffect

useLayoutEffect 是 useEffect 的一个版本, 在浏览器重新绘制屏幕前触发.

存在的目的是为了解决 useEffect 中的函数, 执行时可能在出现渲染前或后的问题.

![react 通关秘籍 02](<../img/Screenshot 2024-12-15 at 13.15.27.png>)

useLayoutEffect 中的函数保证在渲染前执行, 但如果函数逻辑复杂, 会导致页面阻塞渲染... 也就是白屏.

## 4. useReducer

如果有多个方法操作同一个 state, 考虑提取成一个 reducer. reducer 可以移到组件外部!!

useReducer 的第一个参数是 reducer, 用来处理复杂逻辑.
第二个参数是初始值.
可选的第三个参数是一个函数, 用来初始化值. 类似 useState...

使用 useReducer 和 useState 差不多, 同样也是通过解构拿到初始值和操作值的函数.
其中第二个函数 `dispatch` 函数的参数类似自己写的 `reducer`. 不过省略了上一个状态值.

note:
注意 ts 中, useReducer 传入的泛型参数写法
`<Reducer<number, IAction>>`

```tsx
interface IAction {
  type: "+1" | "-1";
  payload: number;
}

function App() {
  function yeReducer(state: number, action: IAction) {
    switch (action.type) {
      case "+1":
        return state + action.payload;
      case "-1":
        return state - action.payload;
    }
  }

  const [num, dispatch] = useReducer<Reducer<number, IAction>>(yeReducer, 0);

  return (
    <div>
      <h1> num is {num}</h1>
      <button onClick={() => dispatch({ type: "+1", payload: 1 })}>+1</button>
      <button onClick={() => dispatch({ type: "-1", payload: 1 })}>-1</button>
    </div>
  );
}
```

数据不可变, 直接操作原数据无法触发重新渲染, 所以需要复制一份然后覆盖. 函数式编程牢记不可变.
复杂对象深拷贝消耗性能, 因此常搭配 immer 库来实现复制原对象然后修改.

只要涉及到 state 的修改，就必须返回新的值，不管是 useState 还是 useReducer

## 5. useRef

保存任何值的引用!! current 属性上就是保存的值.
useRef 一般是用来存一些不是用于渲染的内容的.
ref.current 的值改了不会触发重新渲染.

ref 保存 DOM 需要手动传初始值为 null

note:
不要在渲染期间读取或写入 ref.current !!!
react19 中支持父组件操纵子组件绑定的 ref, 在 react19 以前,需要通过 forwardRef(react19 已废弃)

## 6. forwardRef - react 19 已废弃

高阶组件, 将组件包裹一层.
这样, 父组件中就可以通过 ref 拿到被包起来的组件的 ref.

## 7. useImperativeHandle

自定义由 ref 暴露出来的 handle.

记得之前, 通过 ref 绑定 DOM 元素, 此时父组件拿到的就是 DOM 元素本身.
但有时不想直接暴露整个 DOM 元素, 就可以自定义暴露出去的 ref 对象.

```tsx
useImperativeHandle(
  ref, // 绑定的 ref
  () => {
    // 无参函数, 一般返回一个对象, 里面包含了各种方法
    return {
      focus() {
        inputRef.current.focus();
      },
      scrollIntoView() {
        inputRef.current.scrollIntoView();
      },
    };
  },
  [] // 可选的依赖数组, 依赖数组发生改变重新执行~
);
```

## 8. useContext

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

## 9. memo, useMemo, useCallback

memo 高阶组件, 包裹一个组件, 然后返回一个组件.
只有当 memo 包裹的组件的 props 变了, 组件才会重新渲染, 减少不必要的渲染.

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

还是官网好看(￣ ∇ ￣)
