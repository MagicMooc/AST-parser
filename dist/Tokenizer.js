"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = exports.ScanMode = exports.TokenType = void 0;
const utils_1 = require("./utils");
var TokenType;
(function (TokenType) {
    TokenType["Let"] = "Let";
    TokenType["Const"] = "Const";
    TokenType["Var"] = "Var";
    TokenType["Assign"] = "Assign";
    TokenType["Function"] = "Function";
    TokenType["Number"] = "Number";
    TokenType["Operator"] = "Operator";
    TokenType["Identifier"] = "Identifier";
    TokenType["LeftParen"] = "LeftParen";
    TokenType["RightParen"] = "RightParen";
    TokenType["LeftCurly"] = "LeftCurly";
    TokenType["RightCurly"] = "RightCurly";
    TokenType["Comma"] = "Comma";
    TokenType["Dot"] = "Dot";
    TokenType["Semicolon"] = "Semicolon";
    TokenType["StringLiteral"] = "StringLiteral";
    TokenType["Return"] = "Return";
    TokenType["Import"] = "Import";
    TokenType["Export"] = "Export";
    TokenType["Default"] = "Default";
    TokenType["From"] = "From";
    TokenType["As"] = "As";
    TokenType["Asterisk"] = "Asterisk";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
var ScanMode;
(function (ScanMode) {
    ScanMode[ScanMode["Normal"] = 0] = "Normal";
    ScanMode[ScanMode["Identifier"] = 1] = "Identifier";
    ScanMode[ScanMode["StringLiteral"] = 2] = "StringLiteral";
    ScanMode[ScanMode["Number"] = 3] = "Number";
})(ScanMode = exports.ScanMode || (exports.ScanMode = {}));
// 策略模式
const TOKENS_GENERATOR = {
    let(start) {
        return { type: TokenType.Let, value: "let", start, end: start + 3 };
    },
    const(start) {
        return { type: TokenType.Const, value: "const", start, end: start + 5 };
    },
    var(start) {
        return { type: TokenType.Var, value: "var", start, end: start + 3 };
    },
    assign(start) {
        return { type: TokenType.Assign, value: "=", start, end: start + 1 };
    },
    import(start) {
        return {
            type: TokenType.Import,
            value: "import",
            start,
            end: start + 6,
        };
    },
    export(start) {
        return {
            type: TokenType.Export,
            value: "export",
            start,
            end: start + 6,
        };
    },
    from(start) {
        return {
            type: TokenType.From,
            value: "from",
            start,
            end: start + 4,
        };
    },
    as(start) {
        return {
            type: TokenType.As,
            value: "as",
            start,
            end: start + 2,
        };
    },
    asterisk(start) {
        return {
            type: TokenType.Asterisk,
            value: "*",
            start,
            end: start + 1,
        };
    },
    default(start) {
        return {
            type: TokenType.Default,
            value: "default",
            start,
            end: start + 7,
        };
    },
    number(start, value) {
        return {
            type: TokenType.Number,
            value,
            start,
            end: start + value.length,
            raw: value,
        };
    },
    function(start) {
        return {
            type: TokenType.Function,
            value: "function",
            start,
            end: start + 8,
        };
    },
    return(start) {
        return {
            type: TokenType.Return,
            value: "return",
            start,
            end: start + 6,
        };
    },
    operator(start, value) {
        return {
            type: TokenType.Operator,
            value,
            start,
            end: start + value.length,
        };
    },
    comma(start) {
        return {
            type: TokenType.Comma,
            value: ",",
            start,
            end: start + 1,
        };
    },
    leftParen(start) {
        return { type: TokenType.LeftParen, value: "(", start, end: start + 1 };
    },
    rightParen(start) {
        return { type: TokenType.RightParen, value: ")", start, end: start + 1 };
    },
    leftCurly(start) {
        return { type: TokenType.LeftCurly, value: "{", start, end: start + 1 };
    },
    rightCurly(start) {
        return { type: TokenType.RightCurly, value: "}", start, end: start + 1 };
    },
    dot(start) {
        return { type: TokenType.Dot, value: ".", start, end: start + 1 };
    },
    semicolon(start) {
        return { type: TokenType.Semicolon, value: ";", start, end: start + 1 };
    },
    stringLiteral(start, value, raw) {
        return {
            type: TokenType.StringLiteral,
            value,
            start,
            end: start + value.length + 2,
            raw,
        };
    },
    identifier(start, value) {
        return {
            type: TokenType.Identifier,
            value,
            start,
            end: start + value.length,
        };
    },
};
const KNOWN_SINGLE_CHAR_TOKENS = new Map([
    ["(", TOKENS_GENERATOR.leftParen],
    [")", TOKENS_GENERATOR.rightParen],
    ["{", TOKENS_GENERATOR.leftCurly],
    ["}", TOKENS_GENERATOR.rightCurly],
    [".", TOKENS_GENERATOR.dot],
    [";", TOKENS_GENERATOR.semicolon],
    [",", TOKENS_GENERATOR.comma],
    ["*", TOKENS_GENERATOR.asterisk],
    ["=", TOKENS_GENERATOR.assign],
]);
const QUOTATION_TOKENS = ["'", '"', "`"];
const OPERATOR_TOKENS = [
    "+",
    "-",
    "*",
    "/",
    "%",
    "^",
    "&",
    "|",
    "~",
    "<<",
    ">>",
];
class Tokenizer {
    constructor(input) {
        this._tokens = [];
        this._currentIndex = 0;
        this._scanMode = ScanMode.Normal;
        this._source = input;
    }
    scanIndentifier() {
        this._setScanMode(ScanMode.Identifier);
        // 继续扫描，直到收集完整的单词
        let identifier = "";
        let currentChar = this._getCurrentChar();
        const startIndex = this._currentIndex;
        while ((0, utils_1.isAlpha)(currentChar) ||
            (0, utils_1.isDigit)(currentChar) ||
            (0, utils_1.isUnderline)(currentChar)) {
            identifier += currentChar;
            this._currentIndex++;
            currentChar = this._getCurrentChar();
        }
        let token;
        // 1. 结果为关键字
        if (identifier in TOKENS_GENERATOR) {
            token =
                TOKENS_GENERATOR[identifier](startIndex);
        }
        // 2. 结果为标识符
        else {
            token = TOKENS_GENERATOR["identifier"](startIndex, identifier);
        }
        this._tokens.push(token);
        this._resetScanMode();
    }
    scanStringLiteral() {
        this._setScanMode(ScanMode.StringLiteral);
        const startIndex = this._currentIndex;
        let currentChar = this._getCurrentChar();
        // 记录引号
        const startQuotation = currentChar;
        // 继续找字符串
        this._currentIndex++;
        let str = "";
        currentChar = this._getCurrentChar();
        while (currentChar && currentChar !== startQuotation) {
            str += currentChar;
            this._currentIndex++;
            currentChar = this._getCurrentChar();
        }
        const token = TOKENS_GENERATOR.stringLiteral(startIndex, str, `${startQuotation}${str}${startQuotation}`);
        this._tokens.push(token);
        this._resetScanMode();
    }
    _scanNumber() {
        this._setScanMode(ScanMode.Number);
        const startIndex = this._currentIndex;
        let number = "";
        let currentChar = this._getCurrentChar();
        let isFloat = false;
        // 如果是数字，则继续扫描
        // 需要考虑到小数点
        while ((0, utils_1.isDigit)(currentChar) || (currentChar === "." && !isFloat)) {
            if (currentChar === ".") {
                isFloat = true;
            }
            number += currentChar;
            this._currentIndex++;
            currentChar = this._getCurrentChar();
        }
        if (isFloat && currentChar === ".") {
            throw new Error('Unexpected character "."');
        }
        const token = TOKENS_GENERATOR.number(startIndex, number);
        this._tokens.push(token);
        this._resetScanMode();
    }
    tokenize() {
        // 扫描
        while (this._currentIndex < this._source.length) {
            let currentChar = this._source[this._currentIndex];
            const startIndex = this._currentIndex;
            // 1. 判断是否是分隔符
            if ((0, utils_1.isWhiteSpace)(currentChar)) {
                this._currentIndex++;
                continue;
            }
            // 2. 判断是否是字母
            else if ((0, utils_1.isAlpha)(currentChar)) {
                this.scanIndentifier();
                continue;
            }
            // 3. 判断是否是单字符 () {} . ; *
            else if (KNOWN_SINGLE_CHAR_TOKENS.has(currentChar)) {
                // * 字符特殊处理
                if (currentChar === "*") {
                    // 前瞻，如果是非 import/export，则认为是二元运算符，避免误判
                    const previousToken = this._getPreviousToken();
                    if (previousToken.type !== TokenType.Import &&
                        previousToken.type !== TokenType.Export) {
                        this._tokens.push(TOKENS_GENERATOR.operator(startIndex, currentChar));
                        this._currentIndex++;
                        continue;
                    }
                    // 否则按照 import/export 中的 * 处理
                }
                const token = KNOWN_SINGLE_CHAR_TOKENS.get(currentChar)(startIndex);
                this._tokens.push(token);
                this._currentIndex++;
            }
            // 4. 判断是否为引号
            else if (QUOTATION_TOKENS.includes(currentChar)) {
                this.scanStringLiteral();
                // 跳过结尾的引号
                this._currentIndex++;
                continue;
            }
            // 5. 判断二元计算符
            else if (OPERATOR_TOKENS.includes(currentChar) &&
                this._scanMode === ScanMode.Normal) {
                this._tokens.push(TOKENS_GENERATOR.operator(startIndex, currentChar));
                this._currentIndex++;
                continue;
            }
            else if (OPERATOR_TOKENS.includes(currentChar + this._getNextChar()) &&
                this._scanMode === ScanMode.Normal) {
                this._tokens.push(TOKENS_GENERATOR.operator(startIndex, currentChar + this._getNextChar()));
                this._currentIndex += 2;
                continue;
            }
            // 6. 判断数字
            else if ((0, utils_1.isDigit)(currentChar)) {
                this._scanNumber();
                continue;
            }
        }
        this._resetCurrentIndex();
        return this._getTokens();
    }
    _getCurrentChar() {
        return this._source[this._currentIndex];
    }
    _getNextChar() {
        if (this._currentIndex + 1 < this._source.length) {
            return this._source[this._currentIndex + 1];
        }
        return "";
    }
    _resetCurrentIndex() {
        this._currentIndex = 0;
    }
    _getTokens() {
        return this._tokens;
    }
    _getPreviousToken() {
        // 前瞻 Token
        if (this._tokens.length > 0) {
            return this._tokens[this._tokens.length - 1];
        }
        throw new Error("Previous token not found");
    }
    _setScanMode(mode) {
        this._scanMode = mode;
    }
    _resetScanMode() {
        this._scanMode = ScanMode.Normal;
    }
}
exports.Tokenizer = Tokenizer;
