module.exports = function(querySelectorAll, doc)
{
    doc = doc || document;
    querySelectorAll = querySelectorAll || doc.querySelectorAll.bind(doc);
    return function(sel, context)
    {
        if(context) {
            return [].slice.call(context.querySelectorAll(sel));
        }
        return [].slice.call(querySelectorAll(sel));
    }
}
