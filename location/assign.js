module.exports = function(doc, fetch, html)
{
    var setReadyState = function(state)
    {
        doc.readyState = state;
        doc.dispatchEvent(
            {
                type: "readystatechange",
                target: doc
            }
        );
    }
    var parse = function(str)
    {
        // hyperscript (??) doesn't like doctype
        return str.replace(/(?=\<\!DOCTYPE)[^\>]+\>?/g, '');
    }
    return function(url)
    {
        // win.dispatchEvent(
        //     {
        //         type: "beforeunload"
        //         target: win
        //     }
        // );
        // setReadyState("loading");
        return fetch(url).then(
            function(response)
            {
                return response.text();
            }
        ).then(
            function(txt)
            {
                // win.dispatchEvent(
                //     {
                //         type: "unload"
                //         target: win
                //     }
                // );
                var tree = html([parse(txt)]);
                doc.body.appendChild(tree);
                // setReadyState("interactive");
                doc.dispatchEvent(
                    {
                        type: "DOMContentLoaded",
                        target: doc
                    }
                );
                return doc;
            }
        );
    }
}
