﻿/// <loc filename="Metadata\base.strings_loc_oam.xml" format="messagebundle" />
/*!
  © Microsoft. All rights reserved.

  This library is supported for use in Windows Store apps only.

  Build: 1.0.9600.17018.winblue_gdr.140204-1946
  
  Version: Microsoft.WinJS.2.0
*/

(function (global) {
    global.strings = global.strings || {};

    var appxVersion = "Microsoft.WinJS.2.0";
    var developerPrefix = "Developer.";
    if (appxVersion.indexOf(developerPrefix) === 0) {
        appxVersion = appxVersion.substring(developerPrefix.length);
    }

    function addStrings(keyPrefix,  strings) {
        Object.keys(strings).forEach(function (key) {
            global.strings[keyPrefix + key.replace("\\", "/")] = strings[key];
        });
    }
    
addStrings(
"ms-resource://"+appxVersion+"/base/",

{
    "attributeBindingSingleProperty": "Attribute binding requires a single destination attribute name, often in the form \"this['aria-label']\" or \"width\".",
    "bindingInitializerNotFound": "Initializer not found:'{0}'",
    "cannotBindToThis": "Can't bind to 'this'.",
    "creatingNewProperty": "Creating new property {0}. Full path:{1}",
    "duplicateBindingDetected": "Binding against element with id {0} failed because a duplicate id was detected.",
    "elementNotFound": "Element not found:{0}",
    "errorActivatingControl": "Error activating control: {0}",
    "errorInitializingBindings": "Error initializing bindings: {0}",
    "exceptionFromBindingInitializer": "Exception thrown from binding initializer: {0}",
    "idBindingNotSupported": "Declarative binding to ID field is not supported. Initializer: {0}",
    "illegalListLength": "List length must be assigned a finite positive number",
    "invalidBinding": "Invalid binding:'{0}'. Expected to be '<destProp>:<sourceProp>;'. {1}",
    "invalidFragmentUri": "Unsupported uri for fragment loading. Fragments in the local context can only load from package content or local sources. To load fragments from other sources, use a web context.",
    "invalidOptionsRecord": "Invalid options record: '{0}', expected to be in the format of an object literal. {1}",
    "jobInfoIsNoLongerValid": "The job info object can only be used while the job is running",
    "malformedFormatStringInput": "Malformed, did you mean to escape your '{0}'?",
    "nestedDOMElementBindingNotSupported": "Binding through a property {0} of type HTMLElement is not supported, Full path:{1}.",
    "nestingExceeded": "NestingExceeded",
    "notFound": "NotFound: {0}",
    "notSupportedForProcessing": "Value is not supported within a declarative processing context, if you want it to be supported mark it using WinJS.Utilities.markSupportedForProcessing. The value was: '{0}'",
    "nonStaticHTML": "Unable to add dynamic content. A script attempted to inject dynamic content, or elements previously modified dynamically, that might be unsafe. For example, using the innerHTML property or the document.write method to add a script element will generate this exception. If the content is safe and from a trusted source, use a method to explicitly manipulate elements and attributes, such as createElement, or use setInnerHTMLUnsafe (or other unsafe method).",
    "propertyDoesNotExist": "{0} doesn't exist. Full path:{1}",
    "propertyIsUndefined": "{0} is undefined",
    "sparseArrayNotSupported": "Sparse arrays are not supported with proxy: true",
    "unexpectedTokenExpectedToken": "Unexpected token: {0}, expected token: {1}, at offset {2}",
    "unexpectedTokenExpectedTokens": "Unexpected token: {0}, expected one of: {1}, at offset {2}",
    "unexpectedTokenGeneric": "Unexpected token: {0}, at offset {1}",
    "unsupportedDataTypeForBinding": "Unsupported data type"
}

);

}(this));
