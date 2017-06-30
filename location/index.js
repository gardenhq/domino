module.exports = function(assign)
{
    var href = "about:blank";
    return {
        assign: function(url)
        {
            assign(url).then(
                function(doc)
                {
                    href = url;
                    return doc;
                }
            );
        },
        reload: function()
        {
            return this.assign(href);
        }
    };
}
