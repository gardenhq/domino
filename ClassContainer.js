module.exports = function (info)
{
    // (C) Andrea Giammarchi - @WebReflection - MIT Style
    var catchClass = /^[A-Z]+[a-z]/;
    var register = Object.create(null);
    var add = function(Class, tag)
    {
        tag = tag.toLowerCase();
        if (!(tag in register)) {
            register[Class] = (register[Class] || []).concat(tag);
            register[tag] = (register[tag.toUpperCase()] = Class);
        }
    };
    var keys = Object.keys;
    info = info.reduce(
        function(prev, item)
        {
            return Object.assign(prev, item);
        }
    );
    keys(info).forEach(
        function(Class)
        {
            info[Class].forEach(
                function(tag)
                {
                    add(Class, tag);
                }
            )
        }
    );
    return {
        get: function(tagOrClass)
        {
            if(typeof tagOrClass === 'string') {
                return register[tagOrClass] || (catchClass.test(tagOrClass) ? [] : '');
            } else {
                return keys(register).filter(
                    function(tag)
                    {
                        return tagOrClass.test(tag);
                    }
                );
            }
        },
        set: function(tag, Class)
        {
            if(catchClass.test(tag)) {
                return add(tag, Class);
            } else {
                return add(Class, tag);
            }
        }   
    };
};
