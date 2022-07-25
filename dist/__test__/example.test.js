"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
(0, vitest_1.describe)("example test", () => {
    (0, vitest_1.test)("should return correct result", () => {
        (0, vitest_1.expect)(2 + 2).toBe(4);
    });
});
