"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const node_types_1 = require("../node-types");
const index_1 = require("../index");
(0, vitest_1.describe)("testParserFunction", () => {
    (0, vitest_1.test)("test variable declaration", () => {
        const input = "let a = 1;";
        const ast = {
            type: node_types_1.NodeType.Program,
            start: 0,
            end: 10,
            body: [
                {
                    type: node_types_1.NodeType.VariableDeclaration,
                    start: 0,
                    end: 10,
                    declarations: [
                        {
                            type: node_types_1.NodeType.VariableDeclarator,
                            id: {
                                type: node_types_1.NodeType.Identifier,
                                name: "a",
                                start: 4,
                                end: 5,
                            },
                            start: 4,
                            end: 9,
                            init: {
                                type: node_types_1.NodeType.Literal,
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
        (0, vitest_1.expect)((0, index_1.parse)(input)).toEqual(ast);
    });
    (0, vitest_1.test)("test member expression", () => {
        const input = "foo.bar";
        const memberExpression = {
            type: node_types_1.NodeType.MemberExpression,
            object: {
                type: node_types_1.NodeType.Identifier,
                name: "foo",
                start: 0,
                end: 3,
            },
            start: 0,
            end: 7,
            property: {
                type: node_types_1.NodeType.Identifier,
                name: "bar",
                start: 4,
                end: 7,
            },
            computed: false,
        };
        const ast = {
            type: node_types_1.NodeType.Program,
            start: 0,
            end: 7,
            body: [
                {
                    type: node_types_1.NodeType.ExpressionStatement,
                    expression: memberExpression,
                    start: 0,
                    end: 7,
                },
            ],
        };
        (0, vitest_1.expect)((0, index_1.parse)(input)).toEqual(ast);
    });
    (0, vitest_1.test)("test nested member expression", () => {
        const input = "foo.bar.zoo";
        const memberExpression = {
            type: node_types_1.NodeType.MemberExpression,
            object: {
                type: node_types_1.NodeType.MemberExpression,
                object: {
                    start: 0,
                    end: 3,
                    type: node_types_1.NodeType.Identifier,
                    name: "foo",
                },
                property: {
                    start: 4,
                    end: 7,
                    type: node_types_1.NodeType.Identifier,
                    name: "bar",
                },
                start: 0,
                end: 7,
                computed: false,
            },
            property: {
                start: 8,
                end: 11,
                type: node_types_1.NodeType.Identifier,
                name: "zoo",
            },
            start: 0,
            end: 11,
            computed: false,
        };
        const ast = {
            type: node_types_1.NodeType.Program,
            body: [
                {
                    type: node_types_1.NodeType.ExpressionStatement,
                    expression: memberExpression,
                    start: 0,
                    end: 11,
                },
            ],
            start: 0,
            end: 11,
        };
        (0, vitest_1.expect)((0, index_1.parse)(input)).toEqual(ast);
    });
    (0, vitest_1.test)("test function", () => {
        const input = "function foo(a, b) { return a.add(b); }";
        const ast = {
            type: node_types_1.NodeType.Program,
            start: 0,
            end: 39,
            body: [
                {
                    start: 0,
                    end: 39,
                    type: node_types_1.NodeType.FunctionDeclaration,
                    id: {
                        start: 9,
                        end: 12,
                        type: node_types_1.NodeType.Identifier,
                        name: "foo",
                    },
                    params: [
                        {
                            start: 13,
                            end: 14,
                            type: node_types_1.NodeType.Identifier,
                            name: "a",
                        },
                        {
                            start: 16,
                            end: 17,
                            type: node_types_1.NodeType.Identifier,
                            name: "b",
                        },
                    ],
                    body: {
                        type: node_types_1.NodeType.BlockStatement,
                        start: 19,
                        end: 39,
                        body: [
                            {
                                type: node_types_1.NodeType.ReturnStatement,
                                start: 21,
                                end: 37,
                                argument: {
                                    type: node_types_1.NodeType.CallExpression,
                                    start: 28,
                                    end: 37,
                                    callee: {
                                        type: node_types_1.NodeType.MemberExpression,
                                        object: {
                                            type: node_types_1.NodeType.Identifier,
                                            name: "a",
                                            start: 28,
                                            end: 29,
                                        },
                                        property: {
                                            type: node_types_1.NodeType.Identifier,
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
                                            type: node_types_1.NodeType.Identifier,
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
        (0, vitest_1.expect)((0, index_1.parse)(input)).toEqual(ast);
    });
    (0, vitest_1.test)("test import declaration", () => {
        const input = `import foo, { name1, name2 as bar } from 'foo';
      import * as mod from 'mod';`;
        const ast = {
            type: node_types_1.NodeType.Program,
            start: 0,
            end: 80,
            body: [
                {
                    type: node_types_1.NodeType.ImportDeclaration,
                    start: 0,
                    end: 46,
                    specifiers: [
                        {
                            type: node_types_1.NodeType.ImportDefaultSpecifier,
                            start: 7,
                            end: 10,
                            local: {
                                type: node_types_1.NodeType.Identifier,
                                name: "foo",
                                start: 7,
                                end: 10,
                            },
                        },
                        {
                            type: node_types_1.NodeType.ImportSpecifier,
                            start: 14,
                            end: 19,
                            imported: {
                                type: node_types_1.NodeType.Identifier,
                                name: "name1",
                                start: 14,
                                end: 19,
                            },
                            local: {
                                type: node_types_1.NodeType.Identifier,
                                name: "name1",
                                start: 14,
                                end: 19,
                            },
                        },
                        {
                            type: node_types_1.NodeType.ImportSpecifier,
                            start: 21,
                            end: 33,
                            imported: {
                                type: node_types_1.NodeType.Identifier,
                                name: "name2",
                                start: 21,
                                end: 26,
                            },
                            local: {
                                type: node_types_1.NodeType.Identifier,
                                name: "bar",
                                start: 30,
                                end: 33,
                            },
                        },
                    ],
                    source: {
                        type: node_types_1.NodeType.Literal,
                        start: 41,
                        end: 46,
                        value: "foo",
                        raw: "'foo'",
                    },
                },
                {
                    type: node_types_1.NodeType.ImportDeclaration,
                    start: 54,
                    end: 80,
                    specifiers: [
                        {
                            type: node_types_1.NodeType.ImportNamespaceSpecifier,
                            start: 61,
                            end: 69,
                            local: {
                                type: node_types_1.NodeType.Identifier,
                                name: "mod",
                                start: 66,
                                end: 69,
                            },
                        },
                    ],
                    source: {
                        type: node_types_1.NodeType.Literal,
                        start: 75,
                        end: 80,
                        value: "mod",
                        raw: "'mod'",
                    },
                },
            ],
        };
        (0, vitest_1.expect)((0, index_1.parse)(input)).toEqual(ast);
    });
    (0, vitest_1.test)("test export declaration", () => {
        let input = "export { foo, bar as ccc } from 'foo';";
        let ast = {
            type: node_types_1.NodeType.Program,
            start: 0,
            end: 37,
            body: [
                {
                    type: node_types_1.NodeType.ExportNamedDeclaration,
                    start: 0,
                    end: 37,
                    declaration: null,
                    specifiers: [
                        {
                            type: node_types_1.NodeType.ExportSpecifier,
                            start: 9,
                            end: 12,
                            local: {
                                type: node_types_1.NodeType.Identifier,
                                name: "foo",
                                start: 9,
                                end: 12,
                            },
                            exported: {
                                type: node_types_1.NodeType.Identifier,
                                name: "foo",
                                start: 9,
                                end: 12,
                            },
                        },
                        {
                            type: node_types_1.NodeType.ExportSpecifier,
                            start: 14,
                            end: 24,
                            local: {
                                type: node_types_1.NodeType.Identifier,
                                name: "bar",
                                start: 14,
                                end: 17,
                            },
                            exported: {
                                type: node_types_1.NodeType.Identifier,
                                name: "ccc",
                                start: 21,
                                end: 24,
                            },
                        },
                    ],
                    source: {
                        type: node_types_1.NodeType.Literal,
                        start: 32,
                        end: 37,
                        value: "foo",
                        raw: "'foo'",
                    },
                },
            ],
        };
        (0, vitest_1.expect)((0, index_1.parse)(input)).toEqual(ast);
        input = "export * from 'foo';";
        ast = {
            type: node_types_1.NodeType.Program,
            start: 0,
            end: 19,
            body: [
                {
                    type: node_types_1.NodeType.ExportAllDeclaration,
                    start: 0,
                    end: 19,
                    source: {
                        type: node_types_1.NodeType.Literal,
                        start: 14,
                        end: 19,
                        value: "foo",
                        raw: "'foo'",
                    },
                    exported: null,
                },
            ],
        };
        (0, vitest_1.expect)((0, index_1.parse)(input)).toEqual(ast);
        input = "export default function() {}";
        ast = {
            type: node_types_1.NodeType.Program,
            start: 0,
            end: 28,
            body: [
                {
                    type: node_types_1.NodeType.ExportDefaultDeclaration,
                    start: 0,
                    end: 28,
                    declaration: {
                        type: node_types_1.NodeType.FunctionDeclaration,
                        start: 15,
                        end: 28,
                        id: null,
                        params: [],
                        body: {
                            type: node_types_1.NodeType.BlockStatement,
                            start: 26,
                            end: 28,
                            body: [],
                        },
                    },
                },
            ],
        };
        (0, vitest_1.expect)((0, index_1.parse)(input)).toEqual(ast);
    });
});
