module.exports = function(document, location, xhr, fetch)
{
    return {
        document: document,
        location: location,
        XMLHttpRequest: xhr,
        fetch: fetch
    };
}
