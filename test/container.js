module.exports = function(builder)
{
    var root = __dirname + "/..";
    var service = "@gardenhq.domino"
    return {
        "imports": [
            "@gardenhq/js-test-harness/conf/index.js",
            "@gardenhq/tick-control/container.js",
            root + "/container.js"
        ],
        // "dom.window": {
        //     "object": "@dom.window.emulated"
        // },
        // "dom.document": {
        //     "object": "@dom.document.emulated"
        // },

        // force emulated assign so I can test without reloading
        "dom.location.assign": {
            "callable": root + "/location/assign.js",
            "arguments": [
                "@dom.document.emulated",
                "@dom.fetch",
                "@dom.element.factory"
            ]
        },
        "main": {
            "arguments": [
                builder,
                "@dom.container.class",
                "@dom.fetch",
                "@dom.window",
                "@dom.document",
                "@test.expect",
                "$PROJECT_BASE_URL"
            ]
        },
        "hyperscript": {
            "object": "hyperscript/index.js"
        },
        "hyperx": {
            "callable": "hyperx/index.js",
            "arguments": [
                "@hyperscript"
            ],
            "version": "2.3.0"
        },
        // overwrite this until we can look at td in a browser
        "test.expect": {
            "resolve": [
                "@chai"
            ],
            "service": function(chai)
            {
                return chai.expect;
            }
        }
    };
}
