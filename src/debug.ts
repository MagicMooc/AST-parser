import { Tokenizer, TokenType } from "./Tokenizer";

const input = "function foo(a, b) { return a + b; }";
// const input = "let a = 1;";
// const expected = [
//   { type: TokenType.Function, value: "function" },
//   { type: TokenType.Identifier, value: "foo" },
//   { type: TokenType.LeftParen, value: "(" },
//   { type: TokenType.Identifier, value: "a" },
//   { type: TokenType.Comma, value: "," },
//   { type: TokenType.Identifier, value: "b" },
//   { type: TokenType.RightParen, value: ")" },
//   { type: TokenType.LeftCurly, value: "{" },
//   { type: TokenType.Return, value: "return" },
//   { type: TokenType.Identifier, value: "a" },
//   { type: TokenType.OPERATOR, value: "+" },
//   { type: TokenType.Identifier, value: "b" },
//   { type: TokenType.Semicolon, value: ";" },
//   { type: TokenType.RightCurly, value: "}" },
// ];
const tokenizer = new Tokenizer(input);
console.log(tokenizer.tokenize());

// import { parse } from "./index";
// const ast = parse("function foo(a, b) { return a.add(b); }");
// console.log(JSON.stringify(ast, null, 2));
