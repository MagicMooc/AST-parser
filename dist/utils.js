"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUnderline = exports.isDigit = exports.isAlpha = exports.isWhiteSpace = void 0;
// 分隔符
function isWhiteSpace(char) {
    return char === " " || char === "\t" || char === "\n" || char === "\r";
}
exports.isWhiteSpace = isWhiteSpace;
// 字母
function isAlpha(char) {
    return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z");
}
exports.isAlpha = isAlpha;
// 数字
function isDigit(char) {
    return char >= "0" && char <= "9";
}
exports.isDigit = isDigit;
// 下划线
function isUnderline(char) {
    return char === "_";
}
exports.isUnderline = isUnderline;
