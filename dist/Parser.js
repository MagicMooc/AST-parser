"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const Tokenizer_1 = require("./Tokenizer");
const node_types_1 = require("./node-types");
class Parser {
    constructor(token) {
        this._tokens = [];
        this._currentIndex = 0;
        this._tokens = [...token];
    }
    parse() {
        const program = this._parseProgram();
        return program;
    }
    _parseProgram() {
        const program = {
            type: node_types_1.NodeType.Program,
            body: [],
            start: 0,
            end: Infinity,
        };
        while (!this._isEnd()) {
            const node = this._parseStatement();
            program.body.push(node);
            if (this._isEnd()) {
                program.end = node.end;
            }
        }
        return program;
    }
    _parseStatement() {
        if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Function)) {
            return this._parseFunctionDeclaration();
        }
        else if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Identifier)) {
            return this._parseExpressionStatement();
        }
        else if (this._checkCurrentTokenType(Tokenizer_1.TokenType.LeftCurly)) {
            return this._parseBlockStatement();
        }
        else if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Return)) {
            return this._parseReturnStatement();
        }
        else if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Import)) {
            return this._parseImportStatement();
        }
        else if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Export)) {
            return this._parseExportStatement();
        }
        else if (this._checkCurrentTokenType([
            Tokenizer_1.TokenType.Let,
            Tokenizer_1.TokenType.Var,
            Tokenizer_1.TokenType.Const,
        ])) {
            return this._parseVariableDeclaration();
        }
        console.log(this._getCurrentToken());
        throw new Error("Unexpected token");
    }
    _parseImportStatement() {
        const { start } = this._getCurrentToken();
        const specifiers = [];
        this._goNext(Tokenizer_1.TokenType.Import);
        // import a
        if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Identifier)) {
            const local = this._parseIdentifier();
            const defaultSpecifier = {
                type: node_types_1.NodeType.ImportDefaultSpecifier,
                local,
                start: local.start,
                end: local.end,
            };
            specifiers.push(defaultSpecifier);
            if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Comma)) {
                this._goNext(Tokenizer_1.TokenType.Comma);
            }
        }
        // import { name1 }
        if (this._checkCurrentTokenType(Tokenizer_1.TokenType.LeftCurly)) {
            this._goNext(Tokenizer_1.TokenType.LeftCurly);
            while (!this._checkCurrentTokenType(Tokenizer_1.TokenType.RightCurly)) {
                const specifier = this._parseIdentifier();
                let local = null;
                if (this._checkCurrentTokenType(Tokenizer_1.TokenType.As)) {
                    this._goNext(Tokenizer_1.TokenType.As);
                    local = this._parseIdentifier();
                }
                const importSpecifier = {
                    type: node_types_1.NodeType.ImportSpecifier,
                    imported: specifier,
                    local: local ? local : specifier,
                    start: specifier.start,
                    end: local ? local.end : specifier.end,
                };
                specifiers.push(importSpecifier);
                if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Comma)) {
                    this._goNext(Tokenizer_1.TokenType.Comma);
                }
            }
            this._goNext(Tokenizer_1.TokenType.RightCurly);
        }
        // import * as a
        else if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Asterisk)) {
            const { start } = this._getCurrentToken();
            this._goNext(Tokenizer_1.TokenType.Asterisk);
            this._goNext(Tokenizer_1.TokenType.As);
            const local = this._parseIdentifier();
            const importNamespaceSpecifier = {
                type: node_types_1.NodeType.ImportNamespaceSpecifier,
                local,
                start,
                end: local.end,
            };
            specifiers.push(importNamespaceSpecifier);
        }
        // from 'a'
        if (this._checkCurrentTokenType(Tokenizer_1.TokenType.From)) {
            this._goNext(Tokenizer_1.TokenType.From);
        }
        const source = this._parseLiteral();
        const node = {
            type: node_types_1.NodeType.ImportDeclaration,
            specifiers: specifiers,
            start,
            end: source.end,
            source,
        };
        this._skipSemicolon();
        return node;
    }
    _parseExportStatement() {
        const { start } = this._getCurrentToken();
        let exportDeclaration = null;
        const specifiers = [];
        this._goNext(Tokenizer_1.TokenType.Export);
        // export default
        if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Default)) {
            this._goNext(Tokenizer_1.TokenType.Default);
            // export default a
            // export default obj.a
            if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Identifier)) {
                const local = this._parseExpression();
                exportDeclaration = {
                    type: node_types_1.NodeType.ExportDefaultDeclaration,
                    declaration: local,
                    start: local.start,
                    end: local.end,
                };
            }
            // export default function() {}
            else if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Function)) {
                const declaration = this._parseFunctionDeclaration();
                exportDeclaration = {
                    type: node_types_1.NodeType.ExportDefaultDeclaration,
                    declaration,
                    start,
                    end: declaration.end,
                };
            }
            // TODO: export default class {}
            // TODO: export default { a: 1 };
        }
        // export {
        else if (this._checkCurrentTokenType(Tokenizer_1.TokenType.LeftCurly)) {
            this._goNext(Tokenizer_1.TokenType.LeftCurly);
            while (!this._checkCurrentTokenType(Tokenizer_1.TokenType.RightCurly)) {
                const local = this._parseIdentifier();
                let exported = local;
                if (this._checkCurrentTokenType(Tokenizer_1.TokenType.As)) {
                    this._goNext(Tokenizer_1.TokenType.As);
                    exported = this._parseIdentifier();
                }
                const exportSpecifier = {
                    type: node_types_1.NodeType.ExportSpecifier,
                    local,
                    exported,
                    start: local.start,
                    end: exported.end,
                };
                specifiers.push(exportSpecifier);
                if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Comma)) {
                    this._goNext(Tokenizer_1.TokenType.Comma);
                }
            }
            this._goNext(Tokenizer_1.TokenType.RightCurly);
            if (this._checkCurrentTokenType(Tokenizer_1.TokenType.From)) {
                this._goNext(Tokenizer_1.TokenType.From);
            }
            const source = this._parseLiteral();
            exportDeclaration = {
                type: node_types_1.NodeType.ExportNamedDeclaration,
                specifiers,
                start,
                declaration: null,
                end: source.end,
                source,
            };
        }
        // export const/let/var
        else if (this._checkCurrentTokenType([
            Tokenizer_1.TokenType.Const,
            Tokenizer_1.TokenType.Let,
            Tokenizer_1.TokenType.Var,
        ])) {
            const declaration = this._parseVariableDeclaration();
            exportDeclaration = {
                type: node_types_1.NodeType.ExportNamedDeclaration,
                declaration,
                start,
                end: declaration.end,
                specifiers: specifiers,
                source: null,
            };
            return exportDeclaration;
        }
        // export function
        else if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Function)) {
            const declaration = this._parseFunctionDeclaration();
            exportDeclaration = {
                type: node_types_1.NodeType.ExportNamedDeclaration,
                declaration,
                start,
                end: declaration.end,
                specifiers: specifiers,
                source: null,
            };
        }
        // export * from 'mod'
        else {
            this._goNext(Tokenizer_1.TokenType.Asterisk);
            let exported = null;
            if (this._checkCurrentTokenType(Tokenizer_1.TokenType.As)) {
                this._goNext(Tokenizer_1.TokenType.As);
                exported = this._parseIdentifier();
            }
            this._goNext(Tokenizer_1.TokenType.From);
            const source = this._parseLiteral();
            exportDeclaration = {
                type: node_types_1.NodeType.ExportAllDeclaration,
                start,
                end: source.end,
                source,
                exported,
            };
        }
        if (!exportDeclaration) {
            throw new Error("Export declaration cannot be parsed");
        }
        this._skipSemicolon();
        return exportDeclaration;
    }
    _parseVariableDeclaration() {
        const { start } = this._getCurrentToken();
        const kind = this._getCurrentToken().value;
        this._goNext([Tokenizer_1.TokenType.Let, Tokenizer_1.TokenType.Var, Tokenizer_1.TokenType.Const]);
        const declarations = [];
        const isVariableDeclarationEnded = () => {
            if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Semicolon)) {
                this._goNext(Tokenizer_1.TokenType.Semicolon);
                return true;
            }
            const nextToken = this._getNextToken();
            // 往后看一个 token，如果是 =，则表示没有结束
            if (nextToken && nextToken.type === Tokenizer_1.TokenType.Assign) {
                return false;
            }
            return true;
        };
        while (!isVariableDeclarationEnded()) {
            const id = this._parseIdentifier();
            let init = null;
            if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Assign)) {
                this._goNext(Tokenizer_1.TokenType.Assign);
                if (this._checkCurrentTokenType([
                    Tokenizer_1.TokenType.Number,
                    Tokenizer_1.TokenType.StringLiteral,
                ])) {
                    init = this._parseLiteral();
                }
                else {
                    init = this._parseExpression();
                }
            }
            const declarator = {
                type: node_types_1.NodeType.VariableDeclarator,
                id,
                init,
                start: id.start,
                end: init ? init.end : id.end,
            };
            declarations.push(declarator);
            if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Comma)) {
                this._goNext(Tokenizer_1.TokenType.Comma);
            }
        }
        const node = {
            type: node_types_1.NodeType.VariableDeclaration,
            kind: kind,
            declarations,
            start,
            end: this._getPreviousToken().end,
        };
        this._skipSemicolon();
        return node;
    }
    _parseReturnStatement() {
        const { start } = this._getCurrentToken();
        this._goNext(Tokenizer_1.TokenType.Return);
        const argument = this._parseExpression();
        const node = {
            type: node_types_1.NodeType.ReturnStatement,
            argument,
            start,
            end: argument.end,
        };
        this._skipSemicolon();
        return node;
    }
    _parseExpressionStatement() {
        const expression = this._parseExpression();
        const expressionStatement = {
            type: node_types_1.NodeType.ExpressionStatement,
            expression,
            start: expression.start,
            end: expression.end,
        };
        return expressionStatement;
    }
    // 需要考虑 a.b.c 嵌套结构
    _parseExpression() {
        // 先检查是否是一个函数表达式
        if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Function)) {
            return this._parseFunctionExpression();
        }
        if (this._checkCurrentTokenType([Tokenizer_1.TokenType.Number, Tokenizer_1.TokenType.StringLiteral])) {
            return this._parseLiteral();
        }
        // 拿到标识符，如 a
        let expresion = this._parseIdentifier();
        while (!this._isEnd()) {
            if (this._checkCurrentTokenType(Tokenizer_1.TokenType.LeftParen)) {
                expresion = this._parseCallExpression(expresion);
            }
            else if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Dot)) {
                // 继续解析，a.b
                expresion = this._parseMemberExpression(expresion);
            }
            else if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Operator)) {
                // 解析 a + b
                expresion = this.__parseBinaryOperatorExpression(expresion);
            }
            else {
                break;
            }
        }
        return expresion;
    }
    __parseBinaryOperatorExpression(expression) {
        const { start } = this._getCurrentToken();
        const operator = this._getCurrentToken().value;
        this._goNext(Tokenizer_1.TokenType.Operator);
        const right = this._parseExpression();
        const node = {
            type: node_types_1.NodeType.BinaryExpression,
            operator,
            left: expression,
            right,
            start,
            end: right.end,
        };
        return node;
    }
    _parseMemberExpression(object) {
        this._goNext(Tokenizer_1.TokenType.Dot);
        const property = this._parseIdentifier();
        const node = {
            type: node_types_1.NodeType.MemberExpression,
            object,
            property,
            start: object.start,
            end: property.end,
            computed: false,
        };
        return node;
    }
    _parseCallExpression(callee) {
        const args = this._parseParams(node_types_1.FunctionType.CallExpression);
        // 获取最后一个字符的结束位置
        const { end } = this._getCurrentToken();
        const node = {
            type: node_types_1.NodeType.CallExpression,
            callee,
            arguments: args,
            start: callee.start,
            end,
        };
        this._skipSemicolon();
        return node;
    }
    _parseFunctionDeclaration() {
        const { start } = this._getCurrentToken();
        this._goNext(Tokenizer_1.TokenType.Function);
        let id = null;
        if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Identifier)) {
            id = this._parseIdentifier();
        }
        const params = this._parseParams();
        const body = this._parseBlockStatement();
        const node = {
            type: node_types_1.NodeType.FunctionDeclaration,
            id,
            params,
            body,
            start,
            end: body.end,
        };
        return node;
    }
    _parseFunctionExpression() {
        const { start } = this._getCurrentToken();
        this._goNext(Tokenizer_1.TokenType.Function);
        let id = null;
        if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Identifier)) {
            id = this._parseIdentifier();
        }
        const params = this._parseParams();
        const body = this._parseBlockStatement();
        const node = {
            type: node_types_1.NodeType.FunctionExpression,
            id,
            params,
            body,
            start,
            end: body.end,
        };
        return node;
    }
    _parseParams(mode = node_types_1.FunctionType.FunctionDeclaration) {
        this._goNext(Tokenizer_1.TokenType.LeftParen);
        const params = [];
        while (!this._checkCurrentTokenType(Tokenizer_1.TokenType.RightParen)) {
            let param = mode === node_types_1.FunctionType.FunctionDeclaration
                ? // 函数声明
                    this._parseIdentifier()
                : // 函数调用
                    this._parseExpression();
            params.push(param);
            if (!this._checkCurrentTokenType(Tokenizer_1.TokenType.RightParen)) {
                this._goNext(Tokenizer_1.TokenType.Comma);
            }
        }
        this._goNext(Tokenizer_1.TokenType.RightParen);
        return params;
    }
    _parseLiteral() {
        const token = this._getCurrentToken();
        let value = token.value;
        if (token.type === Tokenizer_1.TokenType.Number) {
            value = Number(value);
        }
        const literal = {
            type: node_types_1.NodeType.Literal,
            value: token.value,
            start: token.start,
            end: token.end,
            raw: token.raw,
        };
        this._goNext(token.type);
        return literal;
    }
    _parseIdentifier() {
        const token = this._getCurrentToken();
        const identifier = {
            type: node_types_1.NodeType.Identifier,
            name: token.value,
            start: token.start,
            end: token.end,
        };
        this._goNext(Tokenizer_1.TokenType.Identifier);
        return identifier;
    }
    _parseBlockStatement() {
        const { start } = this._getCurrentToken();
        const blockStatement = {
            type: node_types_1.NodeType.BlockStatement,
            body: [],
            start,
            end: Infinity,
        };
        this._goNext(Tokenizer_1.TokenType.LeftCurly);
        while (!this._checkCurrentTokenType(Tokenizer_1.TokenType.RightCurly)) {
            const node = this._parseStatement();
            blockStatement.body.push(node);
        }
        blockStatement.end = this._getCurrentToken().end;
        this._goNext(Tokenizer_1.TokenType.RightCurly);
        return blockStatement;
    }
    _checkCurrentTokenType(type) {
        if (this._isEnd()) {
            return false;
        }
        const currentToken = this._tokens[this._currentIndex];
        if (Array.isArray(type)) {
            return type.includes(currentToken.type);
        }
        else {
            return currentToken.type === type;
        }
    }
    _skipSemicolon() {
        if (this._checkCurrentTokenType(Tokenizer_1.TokenType.Semicolon)) {
            this._goNext(Tokenizer_1.TokenType.Semicolon);
        }
    }
    _goNext(type) {
        const currentToken = this._tokens[this._currentIndex];
        // 断言当前 Token 的类型，如果不能匹配，则抛出错误
        if (Array.isArray(type)) {
            if (!type.includes(currentToken.type)) {
                throw new Error(`Expect ${type.join(",")}, but got ${currentToken.type}`);
            }
        }
        else {
            if (currentToken.type !== type) {
                throw new Error(`Expect ${type}, but got ${currentToken.type}`);
            }
        }
        this._currentIndex++;
        return currentToken;
    }
    _isEnd() {
        return this._currentIndex >= this._tokens.length;
    }
    _getCurrentToken() {
        return this._tokens[this._currentIndex];
    }
    _getPreviousToken() {
        return this._tokens[this._currentIndex - 1];
    }
    _getNextToken() {
        if (this._currentIndex + 1 < this._tokens.length) {
            return this._tokens[this._currentIndex + 1];
        }
        else {
            return false;
        }
    }
}
exports.Parser = Parser;
