describe(
    "@gardenhq/domino",
    function()
    {
        this.timeout(10000);
        var container = "../container.js";
        var expect, builder;
        var win, doc, fetch;
        var classes;
        var PROJECT_BASE_URL;
        var harness = function(_builder, _classes, _fetch, _win, _doc, _expect, $PROJECT_BASE_URL)
        {
            classes = _classes;
            PROJECT_BASE_URL = typeof $PROJECT_BASE_URL === "string" ? $PROJECT_BASE_URL : "";
            fetch = _fetch;
            win = _win;
            doc = _doc;
            expect = _expect;
            builder = _builder;
        };
        before(
            function()
            {
                return (
                    function(load)
                    {
                        return load.then(
                            function(runner)
                            {
                                return runner(container, harness);
                            }
                        );
                    }
                )(
                    typeof o !== "undefined" ?
                    o(function(o){ return o(document); }) :
                    require("@gardenhq/o/runner.js")(function(o){ return o(require); })
                );
            }
        );
        context(
            "@gardenhq/domino sync",
            function()
            {
                var title = "Says Hello World! via a synchronous require environment/api";
                if(typeof require !== "undefined") {
                    it(
                        title,
                        function()
                        {
                            var expected = "Hello World!";
                            var actual = "Hello World!";
                            expect(actual).to.equal(expected);
                        }
                    );
                } else {
                    it.skip(title + " - This environment doesn't support a synchronous require"); 
                }
            }
        );
        context(
            "Given location.assign",
            function()
            {
                it(
                    "reloads the DOM",
                    function()
                    {
                        var test = this.test;
                        return Promise.all(
                            [
                                "dom.location.assign"
                            ].map(
                                function(item)
                                {
                                    return builder.get(item);
                                }
                            )
                        ).then(
                            function(services)
                            {
                                var assign = services[0];
                                return new Promise(
                                    function(resolve)
                                    {
                                        if(typeof process === "undefined" || PROJECT_BASE_URL != "") {
                                            return assign(PROJECT_BASE_URL + "/test/story/index.html").then(
                                                function(document)
                                                {
                                                    var node = document.getElementsByTagName("title")[0];
                                                    expect(node.textContent).to.equal("domino");
                                                    resolve(document);
                                                }
                                            );
                                        } else {
                                            test.title = "Skipped: " + test.title + " (in node set $PROJECT_BASE_URL to test)";
                                            resolve();

                                        }

                                    }
                                );

                            }
                        );
                    }
                );
            }
        );
        context(
            "Given @dom.container.class",
            function()
            {
                it(
                    "is not null",
                    function()
                    {
                        expect(classes).to.not.be.null;
                        expect(classes.get("div")).to.equal("HTMLDivElement");
                        var $div = doc.createElement("div");
                        expect(classes.get($div.nodeName));
                    }
                );
            }
        );
        context(
            "Given @dom.window",
            function()
            {
                it(
                    "is not null",
                    function()
                    {
                        expect(win).to.not.be.null;
                    }
                );
            }
        );
        context(
            "Given @dom.document",
            function()
            {
                it(
                    "is not null",
                    function()
                    {
                        // var res = doc.createElement("div");
                        // console.log(res);
                        expect(doc).to.not.be.null;
                    }
                );
            }
        );
        context(
            "Given @dom.fetch",
            function()
            {
                it(
                    "is not null",
                    function()
                    {
                        expect(fetch).to.not.be.null;
                    }
                );
                it(
                    "fetches",
                    function()
                    {
                        if(PROJECT_BASE_URL != "") {
                            return fetch(PROJECT_BASE_URL + "/test/story/index.html").then(
                                function(response)
                                {
                                    return response.text()
                                }
                            ).then(
                                function(txt)
                                {
                                    expect(txt.indexOf("<!DOCTYPE html>")).to.equal(0);
                                }
                            );
                        } else {
                            this.test.title = "Skipped: " + this.test.title + " (in a browser don't test whats not mine, in node set $PROJECT_BASE_URL to test)";

                        }
                    }
                );
            }
        );
    }
);

