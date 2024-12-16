## JSX 类型

React 函数组件默认推导为 `JSX.Element`

`JSX.Element` extends `React.ReactElement`
因此描述 JSX 类型, 使用 上述两者都行.

如果想实现类似 Vue 的插槽效果, 并且插入的是*组件*, 就可以在 ts 中声明 JSX 类型.
但不能放基本数据类型.

如果想插入的是基本数据, 使用 `React.ReactNode`
// 此处的插槽从父组件属性传入, 直接在父组件标签中传入的是 children

**总结**
ReactNode 包含 ReactElement、或者 number、string、null、boolean 等可以写在 JSX 里的类型.

这三个类型的关系 ReactNode > ReactElement > JSX.Element.

所以，一般情况下，如果你想描述一个参数接收 JSX 类型，就用 ReactNode 就行.

## 函数组件类型

`FunctionComponent` === `FC`

参数是 Props，返回值是 ReactNode。

## hook 类型

`useState<T>()`: 一般使用推导的类型, 可以手动传入类型参数.

`useRef<>()`: _保存 DOM 时_, 必须显式传入 `null` 值. _不保存 DOM 时_, 不能显式传入 `null`.

观察类型声明可以发现:

- 当传入 `null` 时, 返回的是 `RefObject`, 其中的 `current` 是只读的.
- 当不传时, 返回的是 `MutableRefObject`, `current` 没有限制.

```ts
function useRef<T>(initialValue: T | null): RefObject<T>;
function useRef<T = undefined>(): MutableRefObject<T | undefined>;
```

`useImperativeHandle`: 略.(￣ ∇ ￣) todo!

`useReducer`: 可以传一个类型参数也可以传两个
当传一个的时候, Reducer<xx,yy> 类型，xx 是 state 的类型，yy 是 action 的类型。
当传了第二个的时候，就是传入的初始化函数参数的类型。
示例:

```tsx
useReducer<Reducer<IData, IAction>>(...);
useReducer<Reducer<IData, IAction>, string>(...);
```

`useCallback`: 类型参数是传入的函数的类型.

`useMemo`: 类型参数是传入的函数的返回值类型.

`useContext`: 类型参数是 Context 内容的类型.

useEffect 和 useLayoutEffect 没有类型参数

## 参数类型

`PropsWithChildren`: 工具类型, 已知实现插槽需要使用 `ReactNode`, 所以避免经常手写, react 提供了内置的工具类型.

```tsx
type ISlotProps = PropsWithChildren<{
  content: ReactNode;
  // 会自动实现 children: ReactNode
}>;

// 声明文件源码
type PropsWithChildren<P = unknown> = P & { children?: ReactNode | undefined };
```

总结:

- PropsWithChildren：可以用来写有 children 的 props
- CSSProperties： css 样式对象的类型
- HTMLAttributes：组件可以传入 html 标签的属性，也可以指定具体的 ButtonHTMLAttributes、AnchorHTMLAttributes。
- ComponentProps：类型参数传入标签名，效果和 HTMLAttributes 一样
- EventHandler：事件处理器的类型
