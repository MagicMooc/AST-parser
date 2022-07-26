# AST-parser

![facebook_cover_photo_2](https://picmagic.oss-cn-beijing.aliyuncs.com/img/facebook_cover_photo_2-8740669.png)

前端工程化中的bundler实现非常依赖于 AST 的实现，有相当多的地方需要解析模块 AST 并且操作 AST 节点，第一步，就要先完成 AST 解析的方案。

为了加深自己对其中原理的理解，故打算自己一步步实现AST解析器

AST 解析器的开发，主要分为两个部分来进行: `词法分析器`和`语法分析器`。

#### 词法分析器测试数据：

##### 测试组一(test expression)：

Input:

```js
1 + 2; 3 * 4
```



Output:

```js
[
      { type: TokenType.Number, value: "1", start: 0, end: 1, raw: "1" },
      { type: TokenType.Operator, value: "+", start: 2, end: 3 },
      { type: TokenType.Number, value: "2", start: 4, end: 5, raw: "2" },
      { type: TokenType.Semicolon, value: ";", start: 5, end: 6 },
      { type: TokenType.Number, value: "3", start: 7, end: 8, raw: "3" },
      { type: TokenType.Operator, value: "*", start: 9, end: 10 },
      { type: TokenType.Number, value: "4", start: 11, end: 12, raw: "4" },
]
```



##### 测试组二(test number)：



Input:

```js
123.45
```



Output

```js
[
      {
        type: TokenType.Number,
        value: "123.45",
        start: 0,
        end: 6,
        raw: "123.45",
      },
 ]
```



Input:

```js
123.45.6
```



Output:

```js
Unexpected character "."
```



##### 测试组三(test console.log)：



Input:

```js
console.log("hello world")
```



Output:

```js
[
      { type: TokenType.Identifier, value: "console", start: 0, end: 7 },
      { type: TokenType.Dot, value: ".", start: 7, end: 8 },
      { type: TokenType.Identifier, value: "log", start: 8, end: 11 },
      { type: TokenType.LeftParen, value: "(", start: 11, end: 12 },
      {
        type: TokenType.StringLiteral,
        value: "hello world",
        start: 12,
        end: 25,
        raw: '"hello world"',
      },
      { type: TokenType.RightParen, value: ")", start: 25, end: 26 },
]
```



##### 测试组四(test member express)：



Input:

```js
foo.bar
```



Output:

```js
[
      { type: TokenType.Identifier, value: "foo", start: 0, end: 3 },
      { type: TokenType.Dot, value: ".", start: 3, end: 4 },
      { type: TokenType.Identifier, value: "bar", start: 4, end: 7 },
]
```



##### 测试组四(test named import)：

Input:

```js
import { foo } from "bar"
```



Output:

```js
[
      { type: TokenType.Import, value: "import", start: 0, end: 6 },
      { type: TokenType.LeftCurly, value: "{", start: 7, end: 8 },
      { type: TokenType.Identifier, value: "foo", start: 9, end: 12 },
      { type: TokenType.RightCurly, value: "}", start: 13, end: 14 },
      { type: TokenType.From, value: "from", start: 15, end: 19 },
      {
        type: TokenType.StringLiteral,
        value: "bar",
        start: 20,
        end: 25,
        raw: '"bar"',
      },
]
```



##### 测试组五(test default import)：



Input:

```js
import foo from "bar"
```



Output:

```js
[
      { type: TokenType.Import, value: "import", start: 0, end: 6 },
      { type: TokenType.Identifier, value: "foo", start: 7, end: 10 },
      { type: TokenType.From, value: "from", start: 11, end: 15 },
      {
        type: TokenType.StringLiteral,
        value: "bar",
        start: 16,
        end: 21,
        raw: '"bar"',
      },
]
```



##### 测试组六(test namespace import)：

Input:

```js
import * as foo from "bar"
```



Output:

```js
[
      { type: TokenType.Import, value: "import", start: 0, end: 6 },
      { type: TokenType.Asterisk, value: "*", start: 7, end: 8 },
      { type: TokenType.As, value: "as", start: 9, end: 11 },
      { type: TokenType.Identifier, value: "foo", start: 12, end: 15 },
      { type: TokenType.From, value: "from", start: 16, end: 20 },
      {
        type: TokenType.StringLiteral,
        value: "bar",
        start: 21,
        end: 26,
        raw: '"bar"',
      },
]
```



##### 测试组七(test named export)：

Input:

```js
export { foo }
```



Output:

```js
[
      { type: TokenType.Export, value: "export", start: 0, end: 6 },
      { type: TokenType.LeftCurly, value: "{", start: 7, end: 8 },
      { type: TokenType.Identifier, value: "foo", start: 9, end: 12 },
      { type: TokenType.RightCurly, value: "}", start: 13, end: 14 },
]
```



##### 测试组八(test reexport)：

Input:

```js
export * from 'foo'; export { add } from 'bar';
```



Output:

```js
[
      { type: TokenType.Export, value: "export", start: 0, end: 6 },
      { type: TokenType.Asterisk, value: "*", start: 7, end: 8 },
      { type: TokenType.From, value: "from", start: 9, end: 13 },
      {
        type: TokenType.StringLiteral,
        value: "foo",
        start: 14,
        end: 19,
        raw: "'foo'",
      },
      { type: TokenType.Semicolon, value: ";", start: 19, end: 20 },
      { type: TokenType.Export, value: "export", start: 21, end: 27 },
      { type: TokenType.LeftCurly, value: "{", start: 28, end: 29 },
      { type: TokenType.Identifier, value: "add", start: 30, end: 33 },
      { type: TokenType.RightCurly, value: "}", start: 34, end: 35 },
      { type: TokenType.From, value: "from", start: 36, end: 40 },
      {
        type: TokenType.StringLiteral,
        value: "bar",
        start: 41,
        end: 46,
        raw: "'bar'",
      },
      { type: TokenType.Semicolon, value: ";", start: 46, end: 47 },
]
```



##### 测试组九(test export default)：

Input:

```js
export default function foo() { };
```



Output:

```js
[
      { type: TokenType.Export, value: "export", start: 0, end: 6 },
      { type: TokenType.Default, value: "default", start: 7, end: 14 },
      { type: TokenType.Function, value: "function", start: 15, end: 23 },
      { type: TokenType.Identifier, value: "foo", start: 24, end: 27 },
      { type: TokenType.LeftParen, value: "(", start: 27, end: 28 },
      { type: TokenType.RightParen, value: ")", start: 28, end: 29 },
      { type: TokenType.LeftCurly, value: "{", start: 30, end: 31 },
      { type: TokenType.RightCurly, value: "}", start: 32, end: 33 },
      { type: TokenType.Semicolon, value: ";", start: 33, end: 34 },
]
```



##### 测试组九(test export const/let/var)：

Input:

```js
export const foo = 'bar'; export let bar = 'foo'; export var baz = 'baz';
```



Output:

```js
[
      { type: TokenType.Export, value: "export", start: 0, end: 6 },
      { type: TokenType.Const, value: "const", start: 7, end: 12 },
      { type: TokenType.Identifier, value: "foo", start: 13, end: 16 },
      { type: TokenType.Assign, value: "=", start: 17, end: 18 },
      {
        type: TokenType.StringLiteral,
        value: "bar",
        start: 19,
        end: 24,
        raw: "'bar'",
      },
      { type: TokenType.Semicolon, value: ";", start: 24, end: 25 },
      { type: TokenType.Export, value: "export", start: 26, end: 32 },
      { type: TokenType.Let, value: "let", start: 33, end: 36 },
      { type: TokenType.Identifier, value: "bar", start: 37, end: 40 },
      { type: TokenType.Assign, value: "=", start: 41, end: 42 },
      {
        type: TokenType.StringLiteral,
        value: "foo",
        start: 43,
        end: 48,
        raw: "'foo'",
      },
      { type: TokenType.Semicolon, value: ";", start: 48, end: 49 },
      { type: TokenType.Export, value: "export", start: 50, end: 56 },
      { type: TokenType.Var, value: "var", start: 57, end: 60 },
      { type: TokenType.Identifier, value: "baz", start: 61, end: 64 },
      { type: TokenType.Assign, value: "=", start: 65, end: 66 },
      {
        type: TokenType.StringLiteral,
        value: "baz",
        start: 67,
        end: 72,
        raw: "'baz'",
      },
      { type: TokenType.Semicolon, value: ";", start: 72, end: 73 },
]
```





#### 语法分析器测试代码：

```ts
```



