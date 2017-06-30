/*!

Copyright (C) 2014-2016 by Andrea Giammarchi - @WebReflection

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
module.exports = function(win, htmlClass, polyfill)
{
    // passed at runtime, configurable
    // via nodejs module
    if (!polyfill) polyfill = 'auto';
    (function(win, polyfill){'use strict';
        var document = win.document,
            Object = win.Object
        ; 
        var 
            ATTRIBUTE_CHANGED_CALLBACK = 'attributeChangedCallback',
            ATTACHED_CALLBACK = "attachedCallback",
            CONNECTED_CALLBACK = 'connectedCallback',
            DISCONNECTED_CALLBACK = 'disconnectedCallback',
            CREATED_CALLBACK = 'createdCallback',
            DETACHED_CALLBACK = "detachedCallback",
            // registered types and their prototypes
            types = [],
            empty = [],
            indexOf = types.indexOf,
            // other helpers / shortcuts
            defineProperty = Object.defineProperty,
            // V1 helpers
            DRECEV1 = '__dreCEv1',
            customElements = win.customElements,
            usableCustomElements = polyfill !== 'force' && !!(
                customElements &&
                customElements.define &&
                customElements.get &&
                customElements.whenDefined
            ),
            create = Object.create,
            justCreated = false,
            constructors = create(null),
            waitingList = create(null),
            nodeNames = new win.Map(),
            secondArgument = String,
            HTMLElementPrototype = win.HTMLElement.prototype,
            getAttribute = HTMLElementPrototype.getAttribute,
            createElement = document.createElement,
            patchedCreateElement = createElement
        ;
        // V1 in da House!
        function CustomElementRegistry() {}

        CustomElementRegistry.prototype = {
            constructor: CustomElementRegistry,
            // a workaround for the stubborn WebKit
            define: usableCustomElements ?
            function (name, Class, options) {
                if (options) {
                    CERDefine(name, Class, options);
                } else {
                    var NAME = name.toUpperCase();
                    constructors[NAME] = {
                        constructor: Class,
                        create: [NAME]
                    };
                    nodeNames.set(Class, NAME);
                    customElements.define(name, Class);
                }
            } :
            CERDefine,
            get: usableCustomElements ?
            function (name) {
                return customElements.get(name) || get(name);
            } :
            get,
            whenDefined: usableCustomElements ?
            function (name) {
                return Promise.race([
                    customElements.whenDefined(name),
                    whenDefined(name)
                ]);
            } :
            whenDefined
        };

        function CERDefine(name, Class, options) {
            var
            is = options && options.extends || '',
                CProto = Class.prototype,
                proto = create(CProto),
                attributes = Class.observedAttributes || empty,
                definition = {prototype: proto}
            ;
            // TODO: is this needed at all since it's inherited?
            // defineProperty(proto, 'constructor', {value: Class});
            defineProperty(proto, CREATED_CALLBACK, {
                value: function () {
                    if (justCreated) justCreated = false;
                    else if (!this[DRECEV1]) {
                        this[DRECEV1] = true;
                        new Class(this);
                        if (CProto[CREATED_CALLBACK])
                            CProto[CREATED_CALLBACK].call(this);
                        var info = constructors[nodeNames.get(Class)];
                        if (!usableCustomElements || info.create.length > 1) {
                            notifyAttributes(this);
                        }
                    }
                }
            });
            defineProperty(proto, ATTRIBUTE_CHANGED_CALLBACK, {
                value: function (name) {
                    if (-1 < indexOf.call(attributes, name))
                        CProto[ATTRIBUTE_CHANGED_CALLBACK].apply(this, arguments);
                }
            });
            if (CProto[CONNECTED_CALLBACK]) {
                defineProperty(proto, ATTACHED_CALLBACK, {
                    value: CProto[CONNECTED_CALLBACK]
                });
            }
            if (CProto[DISCONNECTED_CALLBACK]) {
                defineProperty(proto, DETACHED_CALLBACK, {
                    value: CProto[DISCONNECTED_CALLBACK]
                });
            }
            if (is) definition.extends = is;
            name = name.toUpperCase();
            constructors[name] = {
                constructor: Class,
                create: is ? [is, secondArgument(name)] : [name]
            };
            nodeNames.set(Class, name);
            document.registerElement(name.toLowerCase(), definition);
            whenDefined(name);
            waitingList[name].r();
        }

        function get(name) {
            var info = constructors[name.toUpperCase()];
            return info && info.constructor;
        }

        function getIs(options) {
            return typeof options === 'string' ?
                options : (options && options.is || '');
        }

        function notifyAttributes(self) {
            var
            callback = self[ATTRIBUTE_CHANGED_CALLBACK],
                attributes = callback ? self.attributes : empty,
                i = attributes.length,
                attribute
            ;
            while (i--) {
                attribute =  attributes[i]; // || attributes.item(i);
                callback.call(
                    self,
                    attribute.name || attribute.nodeName,
                    null,
                    attribute.value || attribute.nodeValue
                );
            }
        }

        function whenDefined(name) {
            name = name.toUpperCase();
            if (!(name in waitingList)) {
                waitingList[name] = {};
                waitingList[name].p = new Promise(function (resolve) {
                    waitingList[name].r = resolve;
                });
            }
            return waitingList[name].p;
        }

        function polyfillV1() {
            if (customElements) delete win.customElements;
            defineProperty(win, 'customElements', {
                configurable: true,
                value: new CustomElementRegistry()
            });
            defineProperty(win, 'CustomElementRegistry', {
                configurable: true,
                value: CustomElementRegistry
            });
            for (var
                patchClass = function (name) {
                    var Class = win[name];
                    if (Class) {
                        win[name] = function CustomElementsV1(self) {
                            var info, isNative;
                            if (!self) self = this;
                            if (!self[DRECEV1]) {
                                justCreated = true;
                                info = constructors[nodeNames.get(self.constructor)];
                                isNative = usableCustomElements && info.create.length === 1;
                                self = isNative ?
                                    Reflect.construct(Class, empty, info.constructor) :
                                    document.createElement.apply(document, info.create);
                                self[DRECEV1] = true;
                                justCreated = false;
                                if (!isNative) notifyAttributes(self);
                            }
                            return self;
                        };
                        win[name].prototype = Class.prototype;
                        try {
                            Class.prototype.constructor = win[name];
                        } catch(WebKit) {
                            defineProperty(Class, DRECEV1, {value: win[name]});
                        }
                    }
                },
                Classes = htmlClass.get(/^(HTML|SVG)[A-Z]*[a-z]/),
                i = Classes.length;
                i--;
                patchClass(Classes[i])
            ) {}
            (document.createElement = function (name, options) {
                var is = getIs(options);
                return is ?
                    patchedCreateElement.call(this, name, secondArgument(is)) :
                    patchedCreateElement.call(this, name);
            });
        }

        // if customElements is not there at all
        // if available test extends work as expected
        try {
            (function (DRE, options, name) {
                options.extends = 'a';
                DRE.prototype = create(HTMLAnchorElement.prototype);
                DRE.prototype.constructor = DRE;
                win.customElements.define(name, DRE, options);
                if (
                    getAttribute.call(document.createElement('a', {is: name}), 'is') !== name ||
                    (usableCustomElements && getAttribute.call(new DRE(), 'is') !== name)
                ) {
                    throw options;
                }
            }(
                function DRE() {
                    return Reflect.construct(HTMLAnchorElement, [], DRE);
                },
                {},
                'document-register-element-a'
            ));
        } catch(o_O) {
            // or force the polyfill if not
            // and keep internal original reference
            polyfillV1();
        }

        try {
            createElement.call(document, 'a', 'a');
        } catch(FireFox) {
            secondArgument = function (is) {
                return {is: is};
            };
        }

    }(win));

}
