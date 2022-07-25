"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const Tokenizer_1 = require("../Tokenizer");
(0, vitest_1.describe)("testTokenizerFunction", () => {
    (0, vitest_1.test)("test expression", () => {
        const input = "1 + 2; 3 * 4";
        const expected = [
            { type: Tokenizer_1.TokenType.Number, value: "1", start: 0, end: 1, raw: "1" },
            { type: Tokenizer_1.TokenType.Operator, value: "+", start: 2, end: 3 },
            { type: Tokenizer_1.TokenType.Number, value: "2", start: 4, end: 5, raw: "2" },
            { type: Tokenizer_1.TokenType.Semicolon, value: ";", start: 5, end: 6 },
            { type: Tokenizer_1.TokenType.Number, value: "3", start: 7, end: 8, raw: "3" },
            { type: Tokenizer_1.TokenType.Operator, value: "*", start: 9, end: 10 },
            { type: Tokenizer_1.TokenType.Number, value: "4", start: 11, end: 12, raw: "4" },
        ];
        const tokenizer = new Tokenizer_1.Tokenizer(input);
        (0, vitest_1.expect)(tokenizer.tokenize()).toEqual(expected);
    });
    (0, vitest_1.test)("test number", () => {
        let input = "123.45";
        let expected = [
            {
                type: Tokenizer_1.TokenType.Number,
                value: "123.45",
                start: 0,
                end: 6,
                raw: "123.45",
            },
        ];
        let tokenizer = new Tokenizer_1.Tokenizer(input);
        (0, vitest_1.expect)(tokenizer.tokenize()).toEqual(expected);
        input = "123.45.6";
        tokenizer = new Tokenizer_1.Tokenizer(input);
        (0, vitest_1.expect)(tokenizer.tokenize.bind(tokenizer)).toThrowError('Unexpected character "."');
    });
    (0, vitest_1.test)("testing function", () => {
        const input = "function foo(a, b) { return a + b; }";
        const expected = [
            { type: Tokenizer_1.TokenType.Function, value: "function", start: 0, end: 8 },
            { type: Tokenizer_1.TokenType.Identifier, value: "foo", start: 9, end: 12 },
            { type: Tokenizer_1.TokenType.LeftParen, value: "(", start: 12, end: 13 },
            { type: Tokenizer_1.TokenType.Identifier, value: "a", start: 13, end: 14 },
            { type: Tokenizer_1.TokenType.Comma, value: ",", start: 14, end: 15 },
            { type: Tokenizer_1.TokenType.Identifier, value: "b", start: 16, end: 17 },
            { type: Tokenizer_1.TokenType.RightParen, value: ")", start: 17, end: 18 },
            { type: Tokenizer_1.TokenType.LeftCurly, value: "{", start: 19, end: 20 },
            { type: Tokenizer_1.TokenType.Return, value: "return", start: 21, end: 27 },
            { type: Tokenizer_1.TokenType.Identifier, value: "a", start: 28, end: 29 },
            { type: Tokenizer_1.TokenType.Operator, value: "+", start: 30, end: 31 },
            { type: Tokenizer_1.TokenType.Identifier, value: "b", start: 32, end: 33 },
            { type: Tokenizer_1.TokenType.Semicolon, value: ";", start: 33, end: 34 },
            { type: Tokenizer_1.TokenType.RightCurly, value: "}", start: 35, end: 36 },
        ];
        const tokenizer = new Tokenizer_1.Tokenizer(input);
        (0, vitest_1.expect)(tokenizer.tokenize()).toEqual(expected);
    });
    (0, vitest_1.test)("test console.log", () => {
        const input = 'console.log("hello world")';
        const expected = [
            { type: Tokenizer_1.TokenType.Identifier, value: "console", start: 0, end: 7 },
            { type: Tokenizer_1.TokenType.Dot, value: ".", start: 7, end: 8 },
            { type: Tokenizer_1.TokenType.Identifier, value: "log", start: 8, end: 11 },
            { type: Tokenizer_1.TokenType.LeftParen, value: "(", start: 11, end: 12 },
            {
                type: Tokenizer_1.TokenType.StringLiteral,
                value: "hello world",
                start: 12,
                end: 25,
                raw: '"hello world"',
            },
            { type: Tokenizer_1.TokenType.RightParen, value: ")", start: 25, end: 26 },
        ];
        const tokenizer = new Tokenizer_1.Tokenizer(input);
        (0, vitest_1.expect)(tokenizer.tokenize()).toEqual(expected);
    });
    (0, vitest_1.test)("test member express", () => {
        const input = "foo.bar";
        const expected = [
            { type: Tokenizer_1.TokenType.Identifier, value: "foo", start: 0, end: 3 },
            { type: Tokenizer_1.TokenType.Dot, value: ".", start: 3, end: 4 },
            { type: Tokenizer_1.TokenType.Identifier, value: "bar", start: 4, end: 7 },
        ];
        const tokenizer = new Tokenizer_1.Tokenizer(input);
        (0, vitest_1.expect)(tokenizer.tokenize()).toEqual(expected);
    });
    (0, vitest_1.test)("test naemd import", () => {
        const input = 'import { foo } from "bar"';
        const expected = [
            { type: Tokenizer_1.TokenType.Import, value: "import", start: 0, end: 6 },
            { type: Tokenizer_1.TokenType.LeftCurly, value: "{", start: 7, end: 8 },
            { type: Tokenizer_1.TokenType.Identifier, value: "foo", start: 9, end: 12 },
            { type: Tokenizer_1.TokenType.RightCurly, value: "}", start: 13, end: 14 },
            { type: Tokenizer_1.TokenType.From, value: "from", start: 15, end: 19 },
            {
                type: Tokenizer_1.TokenType.StringLiteral,
                value: "bar",
                start: 20,
                end: 25,
                raw: '"bar"',
            },
        ];
        const tokenizer = new Tokenizer_1.Tokenizer(input);
        (0, vitest_1.expect)(tokenizer.tokenize()).toEqual(expected);
    });
    (0, vitest_1.test)("test default import", () => {
        const input = 'import foo from "bar"';
        const expected = [
            { type: Tokenizer_1.TokenType.Import, value: "import", start: 0, end: 6 },
            { type: Tokenizer_1.TokenType.Identifier, value: "foo", start: 7, end: 10 },
            { type: Tokenizer_1.TokenType.From, value: "from", start: 11, end: 15 },
            {
                type: Tokenizer_1.TokenType.StringLiteral,
                value: "bar",
                start: 16,
                end: 21,
                raw: '"bar"',
            },
        ];
        const tokenizer = new Tokenizer_1.Tokenizer(input);
        (0, vitest_1.expect)(tokenizer.tokenize()).toEqual(expected);
    });
    (0, vitest_1.test)("test namespace import", () => {
        const input = 'import * as foo from "bar"';
        const expected = [
            { type: Tokenizer_1.TokenType.Import, value: "import", start: 0, end: 6 },
            { type: Tokenizer_1.TokenType.Asterisk, value: "*", start: 7, end: 8 },
            { type: Tokenizer_1.TokenType.As, value: "as", start: 9, end: 11 },
            { type: Tokenizer_1.TokenType.Identifier, value: "foo", start: 12, end: 15 },
            { type: Tokenizer_1.TokenType.From, value: "from", start: 16, end: 20 },
            {
                type: Tokenizer_1.TokenType.StringLiteral,
                value: "bar",
                start: 21,
                end: 26,
                raw: '"bar"',
            },
        ];
        const tokenizer = new Tokenizer_1.Tokenizer(input);
        (0, vitest_1.expect)(tokenizer.tokenize()).toEqual(expected);
    });
    (0, vitest_1.test)("test named export", () => {
        const input = "export { foo }";
        const expected = [
            { type: Tokenizer_1.TokenType.Export, value: "export", start: 0, end: 6 },
            { type: Tokenizer_1.TokenType.LeftCurly, value: "{", start: 7, end: 8 },
            { type: Tokenizer_1.TokenType.Identifier, value: "foo", start: 9, end: 12 },
            { type: Tokenizer_1.TokenType.RightCurly, value: "}", start: 13, end: 14 },
        ];
        const tokenizer = new Tokenizer_1.Tokenizer(input);
        (0, vitest_1.expect)(tokenizer.tokenize()).toEqual(expected);
    });
    (0, vitest_1.test)("test reexport", () => {
        const input = "export * from 'foo'; export { add } from 'bar';";
        const expected = [
            { type: Tokenizer_1.TokenType.Export, value: "export", start: 0, end: 6 },
            { type: Tokenizer_1.TokenType.Asterisk, value: "*", start: 7, end: 8 },
            { type: Tokenizer_1.TokenType.From, value: "from", start: 9, end: 13 },
            {
                type: Tokenizer_1.TokenType.StringLiteral,
                value: "foo",
                start: 14,
                end: 19,
                raw: "'foo'",
            },
            { type: Tokenizer_1.TokenType.Semicolon, value: ";", start: 19, end: 20 },
            { type: Tokenizer_1.TokenType.Export, value: "export", start: 21, end: 27 },
            { type: Tokenizer_1.TokenType.LeftCurly, value: "{", start: 28, end: 29 },
            { type: Tokenizer_1.TokenType.Identifier, value: "add", start: 30, end: 33 },
            { type: Tokenizer_1.TokenType.RightCurly, value: "}", start: 34, end: 35 },
            { type: Tokenizer_1.TokenType.From, value: "from", start: 36, end: 40 },
            {
                type: Tokenizer_1.TokenType.StringLiteral,
                value: "bar",
                start: 41,
                end: 46,
                raw: "'bar'",
            },
            { type: Tokenizer_1.TokenType.Semicolon, value: ";", start: 46, end: 47 },
        ];
        const tokenizer = new Tokenizer_1.Tokenizer(input);
        (0, vitest_1.expect)(tokenizer.tokenize()).toEqual(expected);
    });
    (0, vitest_1.test)("test export default", () => {
        const input = `export default function foo() { };`;
        const expected = [
            { type: Tokenizer_1.TokenType.Export, value: "export", start: 0, end: 6 },
            { type: Tokenizer_1.TokenType.Default, value: "default", start: 7, end: 14 },
            { type: Tokenizer_1.TokenType.Function, value: "function", start: 15, end: 23 },
            { type: Tokenizer_1.TokenType.Identifier, value: "foo", start: 24, end: 27 },
            { type: Tokenizer_1.TokenType.LeftParen, value: "(", start: 27, end: 28 },
            { type: Tokenizer_1.TokenType.RightParen, value: ")", start: 28, end: 29 },
            { type: Tokenizer_1.TokenType.LeftCurly, value: "{", start: 30, end: 31 },
            { type: Tokenizer_1.TokenType.RightCurly, value: "}", start: 32, end: 33 },
            { type: Tokenizer_1.TokenType.Semicolon, value: ";", start: 33, end: 34 },
        ];
        const tokenizer = new Tokenizer_1.Tokenizer(input);
        (0, vitest_1.expect)(tokenizer.tokenize()).toEqual(expected);
    });
    (0, vitest_1.test)("test export const/let/var", () => {
        const input = `export const foo = 'bar'; export let bar = 'foo'; export var baz = 'baz';`;
        const expected = [
            { type: Tokenizer_1.TokenType.Export, value: "export", start: 0, end: 6 },
            { type: Tokenizer_1.TokenType.Const, value: "const", start: 7, end: 12 },
            { type: Tokenizer_1.TokenType.Identifier, value: "foo", start: 13, end: 16 },
            { type: Tokenizer_1.TokenType.Assign, value: "=", start: 17, end: 18 },
            {
                type: Tokenizer_1.TokenType.StringLiteral,
                value: "bar",
                start: 19,
                end: 24,
                raw: "'bar'",
            },
            { type: Tokenizer_1.TokenType.Semicolon, value: ";", start: 24, end: 25 },
            { type: Tokenizer_1.TokenType.Export, value: "export", start: 26, end: 32 },
            { type: Tokenizer_1.TokenType.Let, value: "let", start: 33, end: 36 },
            { type: Tokenizer_1.TokenType.Identifier, value: "bar", start: 37, end: 40 },
            { type: Tokenizer_1.TokenType.Assign, value: "=", start: 41, end: 42 },
            {
                type: Tokenizer_1.TokenType.StringLiteral,
                value: "foo",
                start: 43,
                end: 48,
                raw: "'foo'",
            },
            { type: Tokenizer_1.TokenType.Semicolon, value: ";", start: 48, end: 49 },
            { type: Tokenizer_1.TokenType.Export, value: "export", start: 50, end: 56 },
            { type: Tokenizer_1.TokenType.Var, value: "var", start: 57, end: 60 },
            { type: Tokenizer_1.TokenType.Identifier, value: "baz", start: 61, end: 64 },
            { type: Tokenizer_1.TokenType.Assign, value: "=", start: 65, end: 66 },
            {
                type: Tokenizer_1.TokenType.StringLiteral,
                value: "baz",
                start: 67,
                end: 72,
                raw: "'baz'",
            },
            { type: Tokenizer_1.TokenType.Semicolon, value: ";", start: 72, end: 73 },
        ];
        const tokenizer = new Tokenizer_1.Tokenizer(input);
        (0, vitest_1.expect)(tokenizer.tokenize()).toEqual(expected);
    });
});
