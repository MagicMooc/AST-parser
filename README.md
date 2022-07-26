# AST-parser

![facebook_cover_photo_2](https://picmagic.oss-cn-beijing.aliyuncs.com/img/facebook_cover_photo_2-8740669.png)

前端工程化中的bundler实现非常依赖于 AST 的实现，有相当多的地方需要解析模块 AST 并且操作 AST 节点，第一步，就要先完成 AST 解析的方案。

为了加深自己对其中原理的理解，故打算自己一步步实现AST解析器

AST 解析器的开发，主要分为两个部分来进行: `词法分析器`和`语法分析器`。



#### 类型定义：

```ts
export enum NodeType {
  Program = "Program",
  VariableDeclaration = "VariableDeclaration",
  FunctionDeclaration = "FunctionDeclaration",
  Identifier = "Identifier",
  BlockStatement = "BlockStatement",
  ExpressionStatement = "ExpressionStatement",
  ReturnStatement = "ReturnStatement",
  CallExpression = "CallExpression",
  BinaryExpression = "BinaryExpression",
  MemberExpression = "MemberExpression",
  FunctionExpression = "FunctionExpression",
  Literal = "Literal",
  ImportDeclaration = "ImportDeclaration",
  ImportSpecifier = "ImportSpecifier",
  ImportDefaultSpecifier = "ImportDefaultSpecifier",
  ImportNamespaceSpecifier = "ImportNamespaceSpecifier",
  ExportDeclaration = "ExportDeclaration",
  ExportSpecifier = "ExportSpecifier",
  ExportDefaultDeclaration = "ExportDefaultDeclaration",
  ExportNamedDeclaration = "ExportNamedDeclaration",
  ExportAllDeclaration = "ExportAllDeclaration",
  VariableDeclarator = "VariableDeclarator",
}

export enum FunctionType {
  FunctionDeclaration,
  CallExpression,
}

export interface Node {
  type: string;
  start: number;
  end: number;
}

export interface Program extends Node {
  type: NodeType.Program;
  body: Statement[];
}

export interface Literal extends Node {
  type: NodeType.Literal;
  value: string;
  raw: string;
}

export interface Identifier extends Node {
  type: NodeType.Identifier;
  name: string;
}

export interface CallExpression extends Node {
  type: NodeType.CallExpression;
  callee: Expression;
  arguments: Expression[];
}

export interface MemberExpression extends Node {
  type: NodeType.MemberExpression;
  object: Identifier | MemberExpression;
  property: Identifier;
  computed: boolean;
}

export interface BlockStatement extends Node {
  type: NodeType.BlockStatement;
  body: Statement[];
}

export interface ExpressionStatement extends Node {
  type: NodeType.ExpressionStatement;
  expression: Expression;
}

export interface FunctionExpression extends FunctionNode {
  type: NodeType.FunctionExpression;
}

export interface FunctionDeclaration extends FunctionNode {
  type: NodeType.FunctionDeclaration;
  id: Identifier | null;
}

export type VariableKind = "var" | "let" | "const";

export interface VariableDeclarator extends Node {
  type: NodeType.VariableDeclarator;
  id: Identifier;
  init: Expression | Literal | null;
}

export interface VariableDeclaration extends Node {
  type: NodeType.VariableDeclaration;
  kind: "var" | "let" | "const";
  declarations: VariableDeclarator[];
}

export interface ImportSpecifier extends Node {
  type: NodeType.ImportSpecifier;
  imported: Identifier;
  local: Identifier;
}

export interface ImportDefaultSpecifier extends Node {
  type: NodeType.ImportDefaultSpecifier;
  local: Identifier;
}

export interface ImportNamespaceSpecifier extends Node {
  type: NodeType.ImportNamespaceSpecifier;
  local: Identifier;
}

export type ImportSpecifiers =
  | (ImportSpecifier | ImportDefaultSpecifier)[]
  | ImportNamespaceSpecifier[];

export interface ImportDeclaration extends Node {
  type: NodeType.ImportDeclaration;
  specifiers: ImportSpecifiers;
  source: Literal;
}

export type Declaration =
  | FunctionDeclaration
  | VariableDeclaration
  | ImportDeclaration
  | ExportDeclaration
  | VariableDeclarator;

export interface ExportSpecifier extends Node {
  type: NodeType.ExportSpecifier;
  exported: Identifier;
  local: Identifier;
}

export interface ExportNamedDeclaration extends Node {
  type: NodeType.ExportNamedDeclaration;
  declaration: Declaration | null;
  specifiers: ExportSpecifier[];
  source: Literal | null;
}

export interface ExportDefaultDeclaration extends Node {
  type: NodeType.ExportDefaultDeclaration;
  declaration: Declaration | Expression;
}

export interface ExportAllDeclaration extends Node {
  type: NodeType.ExportAllDeclaration;
  source: Literal;
  exported: Identifier | null;
}

export type ExportDeclaration =
  | ExportNamedDeclaration
  | ExportDefaultDeclaration
  | ExportAllDeclaration;

export interface BinaryExpression extends Node {
  type: NodeType.BinaryExpression;
  left: Expression;
  right: Expression;
  operator: string;
}
export interface FunctionNode extends Node {
  id: Identifier | null;
  params: Expression[] | Identifier[];
  body: BlockStatement;
}

export interface ReturnStatement extends Node {
  type: NodeType.ReturnStatement;
  argument: Expression;
}

export type Statement =
  | ImportDeclaration
  | ExportDeclaration
  | VariableDeclaration
  | FunctionDeclaration
  | ExpressionStatement
  | BlockStatement
  | ReturnStatement;

export type Expression =
  | CallExpression
  | MemberExpression
  | Identifier
  | Literal
  | BinaryExpression
  | FunctionExpression;

```





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



##### 测试组五(test named import)：

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



##### 测试组六(test default import)：



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



##### 测试组七(test namespace import)：

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



##### 测试组八(test named export)：

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



##### 测试组九(test reexport)：

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



##### 测试组十(test export default)：

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



##### 测试组十一(test export const/let/var)：

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

##### 测试组一(test variable declaration)：

```ts
test("test variable declaration", () => {
    const input = "let a = 1;";
    const ast = {
      type: NodeType.Program,
      start: 0,
      end: 10,
      body: [
        {
          type: NodeType.VariableDeclaration,
          start: 0,
          end: 10,
          declarations: [
            {
              type: NodeType.VariableDeclarator,
              id: {
                type: NodeType.Identifier,
                name: "a",
                start: 4,
                end: 5,
              },
              start: 4,
              end: 9,
              init: {
                type: NodeType.Literal,
                value: "1",
                raw: "1",
                start: 8,
                end: 9,
              },
            },
          ],
          kind: "let",
        },
      ],
    };
    expect(parse(input)).toEqual(ast);
  });
```



##### 测试组二(test member expression)：

Input:

```ts
test("test member expression", () => {
    const input = "foo.bar";
    const memberExpression: MemberExpression = {
      type: NodeType.MemberExpression,
      object: {
        type: NodeType.Identifier,
        name: "foo",
        start: 0,
        end: 3,
      },
      start: 0,
      end: 7,
      property: {
        type: NodeType.Identifier,
        name: "bar",
        start: 4,
        end: 7,
      },
      computed: false,
    };
    const ast: Program = {
      type: NodeType.Program,
      start: 0,
      end: 7,
      body: [
        {
          type: NodeType.ExpressionStatement,
          expression: memberExpression,
          start: 0,
          end: 7,
        },
      ],
    };

    expect(parse(input)).toEqual(ast);
  });
```



##### 测试组三(test nested member expression)：

```ts
test("test nested member expression", () => {
    const input = "foo.bar.zoo";
    const memberExpression: MemberExpression = {
      type: NodeType.MemberExpression,
      object: {
        type: NodeType.MemberExpression,
        object: {
          start: 0,
          end: 3,
          type: NodeType.Identifier,
          name: "foo",
        },
        property: {
          start: 4,
          end: 7,
          type: NodeType.Identifier,
          name: "bar",
        },
        start: 0,
        end: 7,
        computed: false,
      },
      property: {
        start: 8,
        end: 11,
        type: NodeType.Identifier,
        name: "zoo",
      },
      start: 0,
      end: 11,
      computed: false,
    };
    const ast: Program = {
      type: NodeType.Program,
      body: [
        {
          type: NodeType.ExpressionStatement,
          expression: memberExpression,
          start: 0,
          end: 11,
        },
      ],
      start: 0,
      end: 11,
    };

    expect(parse(input)).toEqual(ast);
  });
```





##### 测试组四(test function)：

```ts
test("test function", () => {
    const input = "function foo(a, b) { return a.add(b); }";
    const ast: Program = {
      type: NodeType.Program,
      start: 0,
      end: 39,
      body: [
        {
          start: 0,
          end: 39,
          type: NodeType.FunctionDeclaration,
          id: {
            start: 9,
            end: 12,
            type: NodeType.Identifier,
            name: "foo",
          },
          params: [
            {
              start: 13,
              end: 14,
              type: NodeType.Identifier,
              name: "a",
            },
            {
              start: 16,
              end: 17,
              type: NodeType.Identifier,
              name: "b",
            },
          ],
          body: {
            type: NodeType.BlockStatement,
            start: 19,
            end: 39,
            body: [
              {
                type: NodeType.ReturnStatement,
                start: 21,
                end: 37,
                argument: {
                  type: NodeType.CallExpression,
                  start: 28,
                  end: 37,
                  callee: {
                    type: NodeType.MemberExpression,
                    object: {
                      type: NodeType.Identifier,
                      name: "a",
                      start: 28,
                      end: 29,
                    },
                    property: {
                      type: NodeType.Identifier,
                      name: "add",
                      start: 30,
                      end: 33,
                    },
                    start: 28,
                    end: 33,
                    computed: false,
                  },
                  arguments: [
                    {
                      type: NodeType.Identifier,
                      name: "b",
                      start: 34,
                      end: 35,
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    };
    expect(parse(input)).toEqual(ast);
  });
```



##### 测试组五(test import declaration)：

```ts
test("test import declaration", () => {
    const input = `import foo, { name1, name2 as bar } from 'foo';
      import * as mod from 'mod';`;
    const ast: Program = {
      type: NodeType.Program,
      start: 0,
      end: 80,
      body: [
        {
          type: NodeType.ImportDeclaration,
          start: 0,
          end: 46,
          specifiers: [
            {
              type: NodeType.ImportDefaultSpecifier,
              start: 7,
              end: 10,
              local: {
                type: NodeType.Identifier,
                name: "foo",
                start: 7,
                end: 10,
              },
            },
            {
              type: NodeType.ImportSpecifier,
              start: 14,
              end: 19,
              imported: {
                type: NodeType.Identifier,
                name: "name1",
                start: 14,
                end: 19,
              },
              local: {
                type: NodeType.Identifier,
                name: "name1",
                start: 14,
                end: 19,
              },
            },
            {
              type: NodeType.ImportSpecifier,
              start: 21,
              end: 33,
              imported: {
                type: NodeType.Identifier,
                name: "name2",
                start: 21,
                end: 26,
              },
              local: {
                type: NodeType.Identifier,
                name: "bar",
                start: 30,
                end: 33,
              },
            },
          ],
          source: {
            type: NodeType.Literal,
            start: 41,
            end: 46,
            value: "foo",
            raw: "'foo'",
          },
        },
        {
          type: NodeType.ImportDeclaration,
          start: 54,
          end: 80,
          specifiers: [
            {
              type: NodeType.ImportNamespaceSpecifier,
              start: 61,
              end: 69,
              local: {
                type: NodeType.Identifier,
                name: "mod",
                start: 66,
                end: 69,
              },
            },
          ],
          source: {
            type: NodeType.Literal,
            start: 75,
            end: 80,
            value: "mod",
            raw: "'mod'",
          },
        },
      ],
    };
    expect(parse(input)).toEqual(ast);
  });
```





##### 测试组六(test export declaration)：

```ts
  test("test export declaration", () => {
    let input = "export { foo, bar as ccc } from 'foo';";
    let ast: Program = {
      type: NodeType.Program,
      start: 0,
      end: 37,
      body: [
        {
          type: NodeType.ExportNamedDeclaration,
          start: 0,
          end: 37,
          declaration: null,
          specifiers: [
            {
              type: NodeType.ExportSpecifier,
              start: 9,
              end: 12,
              local: {
                type: NodeType.Identifier,
                name: "foo",
                start: 9,
                end: 12,
              },
              exported: {
                type: NodeType.Identifier,
                name: "foo",
                start: 9,
                end: 12,
              },
            },
            {
              type: NodeType.ExportSpecifier,
              start: 14,
              end: 24,
              local: {
                type: NodeType.Identifier,
                name: "bar",
                start: 14,
                end: 17,
              },
              exported: {
                type: NodeType.Identifier,
                name: "ccc",
                start: 21,
                end: 24,
              },
            },
          ],
          source: {
            type: NodeType.Literal,
            start: 32,
            end: 37,
            value: "foo",
            raw: "'foo'",
          },
        },
      ],
    };
    expect(parse(input)).toEqual(ast);
```



```ts
    input = "export * from 'foo';";
    ast = {
      type: NodeType.Program,
      start: 0,
      end: 19,
      body: [
        {
          type: NodeType.ExportAllDeclaration,
          start: 0,
          end: 19,
          source: {
            type: NodeType.Literal,
            start: 14,
            end: 19,
            value: "foo",
            raw: "'foo'",
          },
          exported: null,
        },
      ],
    };
    expect(parse(input)).toEqual(ast);
```



```ts
    input = "export default function() {}";
    ast = {
      type: NodeType.Program,
      start: 0,
      end: 28,
      body: [
        {
          type: NodeType.ExportDefaultDeclaration,
          start: 0,
          end: 28,
          declaration: {
            type: NodeType.FunctionDeclaration,
            start: 15,
            end: 28,
            id: null,
            params: [],
            body: {
              type: NodeType.BlockStatement,
              start: 26,
              end: 28,
              body: [],
            },
          },
        },
      ],
    };
    expect(parse(input)).toEqual(ast);
```

