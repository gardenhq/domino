module.exports = function(builder, win, doc)
{
    var emulatedWindow = {
        "callable": __dirname + "/window/index.js",
        "arguments": [
            "@dom.document",
            "@dom.location.emulated",
            "@dom.xhr",
            "@dom.fetch"
        ]
    };
    win = win || typeof window !== "undefined" ? window : emulatedWindow;
    doc = doc || typeof document !== "undefined" ? document : require.call(null, "min-document");
    var hasCustomElements = "customElements" in win;
    var hasRegisterElement = "registerElement" in doc;
    var isable = false; // TODO: move the feature detect from the polyfill to here
    return {
        "dom.window.emulated": emulatedWindow,
        "dom.document.emulated": {
            "object": "min-document"
        },
        "dom.window": {
            "resolve": typeof window !== "undefined" ? [] : ["@dom.window.emulated"],
            "service": function(win)
            {
                return win || window;
            }
        },
        "dom.document": {
            "resolve": typeof document !== "undefined" ? [] : ["@dom.document.emulated"],
            "service": function(doc)
            {
                return doc || document;
            }
        },
        "dom.localStorage": {
            "resolve": [
                "@dom.window"
            ],
            "service": function(win)
            {
                return win.localStorage;
            }
        },
        "dom.location": {
            "resolve": [
                "@dom.window"
            ],
            "service": function(win)
            {
                return win.location;
            }
        },
        "dom.location.reload": {
            "resolve": [
                "@dom.location"
            ],
            "service": function(location)
            {
                return function()
                {
                    location.reload();
                }
            }
        },
        "dom.location.emulated": {
            "callable": __dirname + "/location/index.js",
            "arguments": [
                "@dom.location.assign"
            ]
        },
        "dom.location.assign": {
            "callable": __dirname + "/location/assign.js",
            "arguments": [
                "@dom.document",
                "@dom.fetch",
                "@dom.element.factory"
            ]
        },
        "dom.class.html": {
            "callable": __dirname + "/class/html.js",
            "tags": [
                "dom.classes"
            ]
        },
        "dom.selector": {
            "callable": __dirname + "/selector.js",
            "arguments": [
                null,
                "@dom.document"
            ]
        },
        "dom.element.factory": {
            "callable": "@hyperx",
            "arguments": [
                "@hyperscript"
            ],
        },
        "dom.innerdom":{
            "object": __dirname + "/innerDOM.js"
        },
        "dom.class.svg": {
            "callable": __dirname + "/class/svg.js",
            "tags": [
                "dom.classes"
            ]
        },
        "dom.container.class": {
            "callable": __dirname + "/ClassContainer.js",
            "arguments": [
                "#dom.classes"
            ]
        },
        "dom.fetch": {
            "resolve": typeof win.fetch !== "undefined" ? [] : ["@dom.xhr", "@unfetch"],
            "service": function(xhr, unfetch)
            {
                // fetch = typeof fetch === "undefined" ? unfetch : fetch;
                return win.fetch || unfetch;
            }
        },
        "dom.xhr": {
            "resolve": typeof win.XMLHttpRequest !== "undefined" ? [] : ["@xhr2"],
            "service": function(xhr)
            { 
                XMLHttpRequest = typeof XMLHttpRequest === "undefined" ? xhr.XMLHttpRequest : XMLHttpRequest;
                // win.XMLHttpRequest = typeof win.HttpRequest === "undefined" ? XMLHttpRequest : win.XMLHttpRequest;
                return XMLHttpRequest;
            }
        },
        "dom.customElements.define": {
            "resolve": hasRegisterElement && !isable ? ["@dom.window", "@dom.polyfill.custom-element"] : ["@dom.window", "@dom.registerElement"],
            "service": function(win)
            {
                return win.customElements.define.bind(win.customElements);
            }
        },
        "dom.registerElement": {
            "resolve": !hasRegisterElement ? ["@dom.document", "@dom.polyfill.register-element"] : ["@dom.document"],
            "service": function(doc)
            {
                return doc.registerElement.bind(doc);
            }
        },
        "dom.polyfill.custom-element": {
            "callable": __dirname + "/polyfill/custom-element",
            "arguments": [
                "@dom.window",
                "@dom.container.class",
                "force"
            ]
        },
        "dom.polyfill.register-element": {
            "object": __dirname + "/polyfill/register-element",
            "arguments": [
                "@dom.window",
                "force"
            ]
        },
        "dom.getShadowRootForNode": {
            "service": function()
            {
                // I've stopped working in FF
                var hasCreateShadowRoot;
                return function(node)
                {
                    if(typeof hasCreateShadowRoot === "undefined") {
                        hasCreateShadowRoot = typeof node.createShadowRoot !== "undefined"; 
                    }
                    // createShadowRoot is deprecated
                    return hasCreateShadowRoot ? node.createShadowRoot() : node.attachShadow({mode: "closed"});
                }
                // if(hasCustomElements) {
                //  return function(node)
                //  {
                //      return node.createShadowRoot();
                //  }
                // } else {
                //  return function(node)
                //  {
                //      //return HTMLElement.prototype.attachShadow.apply(node, [{mode: closed}]);
                //      return node.attachShadow({mode: "closed"})
                //  }
                // }
            }
        },
        "unfetch": {
            "object": "unfetch/dist/unfetch.js"
        },
        "xhr2": {
            "object": "xhr2/lib/xhr2.js"
        },
        "hyperscript": {
            "object": "hyperscript/index.js"
        },
        "hyperx": {
            // "requires": {
            //     "html-element": "@dom.window"
            // },
            "object": "hyperx/index.js",
            "version": "2.3.0"
        }
    };
}
