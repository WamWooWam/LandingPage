var CalcManager = (() => {
    var _scriptDir =
        typeof document !== 'undefined' && document.currentScript
            ? document.currentScript.src
            : undefined;

    return function (moduleArg = {}) {
        var Module = moduleArg;
        var readyPromiseResolve, readyPromiseReject;
        Module['ready'] = new Promise((resolve, reject) => {
            readyPromiseResolve = resolve;
            readyPromiseReject = reject;
        });
        var moduleOverrides = Object.assign({}, Module);
        var arguments_ = [];
        var thisProgram = './this.program';
        var quit_ = (status, toThrow) => {
            throw toThrow;
        };
        var ENVIRONMENT_IS_WEB = true;
        var ENVIRONMENT_IS_WORKER = false;
        var scriptDirectory = '';
        function locateFile(path) {
            if (Module['locateFile']) {
                return Module['locateFile'](path, scriptDirectory);
            }
            return scriptDirectory + path;
        }
        var read_, readAsync, readBinary, setWindowTitle;
        if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
            if (ENVIRONMENT_IS_WORKER) {
                scriptDirectory = self.location.href;
            } else if (
                typeof document != 'undefined' &&
                document.currentScript
            ) {
                scriptDirectory = document.currentScript.src;
            }
            if (_scriptDir) {
                scriptDirectory = _scriptDir;
            }
            if (scriptDirectory.indexOf('blob:') !== 0) {
                scriptDirectory = scriptDirectory.substr(
                    0,
                    scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1,
                );
            } else {
                scriptDirectory = '';
            }
            {
                read_ = (url) => {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url, false);
                    xhr.send(null);
                    return xhr.responseText;
                };
                if (ENVIRONMENT_IS_WORKER) {
                    readBinary = (url) => {
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', url, false);
                        xhr.responseType = 'arraybuffer';
                        xhr.send(null);
                        return new Uint8Array(xhr.response);
                    };
                }
                readAsync = (url, onload, onerror) => {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true);
                    xhr.responseType = 'arraybuffer';
                    xhr.onload = () => {
                        if (
                            xhr.status == 200 ||
                            (xhr.status == 0 && xhr.response)
                        ) {
                            onload(xhr.response);
                            return;
                        }
                        onerror();
                    };
                    xhr.onerror = onerror;
                    xhr.send(null);
                };
            }
            setWindowTitle = (title) => (document.title = title);
        } else {
        }
        var out = Module['print'] || console.log.bind(console);
        var err = Module['printErr'] || console.error.bind(console);
        Object.assign(Module, moduleOverrides);
        moduleOverrides = null;
        if (Module['arguments']) arguments_ = Module['arguments'];
        if (Module['thisProgram']) thisProgram = Module['thisProgram'];
        if (Module['quit']) quit_ = Module['quit'];
        var wasmBinary;
        if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
        var noExitRuntime = Module['noExitRuntime'] || true;
        if (typeof WebAssembly != 'object') {
            abort('no native wasm support detected');
        }
        var wasmMemory;
        var ABORT = false;
        var EXITSTATUS;
        var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
        function updateMemoryViews() {
            var b = wasmMemory.buffer;
            Module['HEAP8'] = HEAP8 = new Int8Array(b);
            Module['HEAP16'] = HEAP16 = new Int16Array(b);
            Module['HEAP32'] = HEAP32 = new Int32Array(b);
            Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
            Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
            Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
            Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
            Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
        }
        var wasmTable;
        var __ATPRERUN__ = [];
        var __ATINIT__ = [];
        var __ATPOSTRUN__ = [];
        var runtimeInitialized = false;
        function preRun() {
            if (Module['preRun']) {
                if (typeof Module['preRun'] == 'function')
                    Module['preRun'] = [Module['preRun']];
                while (Module['preRun'].length) {
                    addOnPreRun(Module['preRun'].shift());
                }
            }
            callRuntimeCallbacks(__ATPRERUN__);
        }
        function initRuntime() {
            runtimeInitialized = true;
            callRuntimeCallbacks(__ATINIT__);
        }
        function postRun() {
            if (Module['postRun']) {
                if (typeof Module['postRun'] == 'function')
                    Module['postRun'] = [Module['postRun']];
                while (Module['postRun'].length) {
                    addOnPostRun(Module['postRun'].shift());
                }
            }
            callRuntimeCallbacks(__ATPOSTRUN__);
        }
        function addOnPreRun(cb) {
            __ATPRERUN__.unshift(cb);
        }
        function addOnInit(cb) {
            __ATINIT__.unshift(cb);
        }
        function addOnPostRun(cb) {
            __ATPOSTRUN__.unshift(cb);
        }
        var runDependencies = 0;
        var runDependencyWatcher = null;
        var dependenciesFulfilled = null;
        function addRunDependency(id) {
            runDependencies++;
            if (Module['monitorRunDependencies']) {
                Module['monitorRunDependencies'](runDependencies);
            }
        }
        function removeRunDependency(id) {
            runDependencies--;
            if (Module['monitorRunDependencies']) {
                Module['monitorRunDependencies'](runDependencies);
            }
            if (runDependencies == 0) {
                if (runDependencyWatcher !== null) {
                    clearInterval(runDependencyWatcher);
                    runDependencyWatcher = null;
                }
                if (dependenciesFulfilled) {
                    var callback = dependenciesFulfilled;
                    dependenciesFulfilled = null;
                    callback();
                }
            }
        }
        function abort(what) {
            if (Module['onAbort']) {
                Module['onAbort'](what);
            }
            what = 'Aborted(' + what + ')';
            err(what);
            ABORT = true;
            EXITSTATUS = 1;
            what += '. Build with -sASSERTIONS for more info.';
            if (runtimeInitialized) {
                ___trap();
            }
            var e = new WebAssembly.RuntimeError(what);
            readyPromiseReject(e);
            throw e;
        }
        var dataURIPrefix = 'data:application/octet-stream;base64,';
        function isDataURI(filename) {
            return filename.startsWith(dataURIPrefix);
        }
        var wasmBinaryFile;
        wasmBinaryFile = 'CalcManager.wasm';
        if (!isDataURI(wasmBinaryFile)) {
            wasmBinaryFile = locateFile(wasmBinaryFile);
        }
        function getBinary(file) {
            try {
                if (file == wasmBinaryFile && wasmBinary) {
                    return new Uint8Array(wasmBinary);
                }
                if (readBinary) {
                    return readBinary(file);
                }
                throw 'both async and sync fetching of the wasm failed';
            } catch (err) {
                abort(err);
            }
        }
        function getBinaryPromise(binaryFile) {
            if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
                if (typeof fetch == 'function') {
                    return fetch(binaryFile, { credentials: 'same-origin' })
                        .then((response) => {
                            if (!response['ok']) {
                                throw (
                                    "failed to load wasm binary file at '" +
                                    binaryFile +
                                    "'"
                                );
                            }
                            return response['arrayBuffer']();
                        })
                        .catch(() => getBinary(binaryFile));
                }
            }
            return Promise.resolve().then(() => getBinary(binaryFile));
        }
        function instantiateArrayBuffer(binaryFile, imports, receiver) {
            return getBinaryPromise(binaryFile)
                .then((binary) => {
                    return WebAssembly.instantiate(binary, imports);
                })
                .then((instance) => {
                    return instance;
                })
                .then(receiver, (reason) => {
                    err('failed to asynchronously prepare wasm: ' + reason);
                    abort(reason);
                });
        }
        function instantiateAsync(binary, binaryFile, imports, callback) {
            if (
                !binary &&
                typeof WebAssembly.instantiateStreaming == 'function' &&
                !isDataURI(binaryFile) &&
                typeof fetch == 'function'
            ) {
                return fetch(binaryFile, { credentials: 'same-origin' }).then(
                    (response) => {
                        var result = WebAssembly.instantiateStreaming(
                            response,
                            imports,
                        );
                        return result.then(callback, function (reason) {
                            err('wasm streaming compile failed: ' + reason);
                            err('falling back to ArrayBuffer instantiation');
                            return instantiateArrayBuffer(
                                binaryFile,
                                imports,
                                callback,
                            );
                        });
                    },
                );
            } else {
                return instantiateArrayBuffer(binaryFile, imports, callback);
            }
        }
        function createWasm() {
            var info = { a: wasmImports };
            function receiveInstance(instance, module) {
                var exports = instance.exports;
                Module['asm'] = exports;
                wasmMemory = Module['asm']['H'];
                updateMemoryViews();
                wasmTable = Module['asm']['N'];
                addOnInit(Module['asm']['I']);
                removeRunDependency('wasm-instantiate');
                return exports;
            }
            addRunDependency('wasm-instantiate');
            function receiveInstantiationResult(result) {
                receiveInstance(result['instance']);
            }
            if (Module['instantiateWasm']) {
                try {
                    return Module['instantiateWasm'](info, receiveInstance);
                } catch (e) {
                    err(
                        'Module.instantiateWasm callback failed with error: ' +
                            e,
                    );
                    readyPromiseReject(e);
                }
            }
            instantiateAsync(
                wasmBinary,
                wasmBinaryFile,
                info,
                receiveInstantiationResult,
            ).catch(readyPromiseReject);
            return {};
        }
        var callRuntimeCallbacks = (callbacks) => {
            while (callbacks.length > 0) {
                callbacks.shift()(Module);
            }
        };
        var tupleRegistrations = {};
        function runDestructors(destructors) {
            while (destructors.length) {
                var ptr = destructors.pop();
                var del = destructors.pop();
                del(ptr);
            }
        }
        function simpleReadValueFromPointer(pointer) {
            return this['fromWireType'](HEAP32[pointer >> 2]);
        }
        var awaitingDependencies = {};
        var registeredTypes = {};
        var typeDependencies = {};
        var char_0 = 48;
        var char_9 = 57;
        function makeLegalFunctionName(name) {
            if (undefined === name) {
                return '_unknown';
            }
            name = name.replace(/[^a-zA-Z0-9_]/g, '$');
            var f = name.charCodeAt(0);
            if (f >= char_0 && f <= char_9) {
                return `_${name}`;
            }
            return name;
        }
        function createNamedFunction(name, body) {
            name = makeLegalFunctionName(name);
            return {
                [name]: function () {
                    return body.apply(this, arguments);
                },
            }[name];
        }
        function extendError(baseErrorType, errorName) {
            var errorClass = createNamedFunction(errorName, function (message) {
                this.name = errorName;
                this.message = message;
                var stack = new Error(message).stack;
                if (stack !== undefined) {
                    this.stack =
                        this.toString() +
                        '\n' +
                        stack.replace(/^Error(:[^\n]*)?\n/, '');
                }
            });
            errorClass.prototype = Object.create(baseErrorType.prototype);
            errorClass.prototype.constructor = errorClass;
            errorClass.prototype.toString = function () {
                if (this.message === undefined) {
                    return this.name;
                } else {
                    return `${this.name}: ${this.message}`;
                }
            };
            return errorClass;
        }
        var InternalError = undefined;
        function throwInternalError(message) {
            throw new InternalError(message);
        }
        function whenDependentTypesAreResolved(
            myTypes,
            dependentTypes,
            getTypeConverters,
        ) {
            myTypes.forEach(function (type) {
                typeDependencies[type] = dependentTypes;
            });
            function onComplete(typeConverters) {
                var myTypeConverters = getTypeConverters(typeConverters);
                if (myTypeConverters.length !== myTypes.length) {
                    throwInternalError('Mismatched type converter count');
                }
                for (var i = 0; i < myTypes.length; ++i) {
                    registerType(myTypes[i], myTypeConverters[i]);
                }
            }
            var typeConverters = new Array(dependentTypes.length);
            var unregisteredTypes = [];
            var registered = 0;
            dependentTypes.forEach((dt, i) => {
                if (registeredTypes.hasOwnProperty(dt)) {
                    typeConverters[i] = registeredTypes[dt];
                } else {
                    unregisteredTypes.push(dt);
                    if (!awaitingDependencies.hasOwnProperty(dt)) {
                        awaitingDependencies[dt] = [];
                    }
                    awaitingDependencies[dt].push(() => {
                        typeConverters[i] = registeredTypes[dt];
                        ++registered;
                        if (registered === unregisteredTypes.length) {
                            onComplete(typeConverters);
                        }
                    });
                }
            });
            if (0 === unregisteredTypes.length) {
                onComplete(typeConverters);
            }
        }
        function __embind_finalize_value_array(rawTupleType) {
            var reg = tupleRegistrations[rawTupleType];
            delete tupleRegistrations[rawTupleType];
            var elements = reg.elements;
            var elementsLength = elements.length;
            var elementTypes = elements
                .map(function (elt) {
                    return elt.getterReturnType;
                })
                .concat(
                    elements.map(function (elt) {
                        return elt.setterArgumentType;
                    }),
                );
            var rawConstructor = reg.rawConstructor;
            var rawDestructor = reg.rawDestructor;
            whenDependentTypesAreResolved(
                [rawTupleType],
                elementTypes,
                function (elementTypes) {
                    elements.forEach((elt, i) => {
                        var getterReturnType = elementTypes[i];
                        var getter = elt.getter;
                        var getterContext = elt.getterContext;
                        var setterArgumentType =
                            elementTypes[i + elementsLength];
                        var setter = elt.setter;
                        var setterContext = elt.setterContext;
                        elt.read = (ptr) => {
                            return getterReturnType['fromWireType'](
                                getter(getterContext, ptr),
                            );
                        };
                        elt.write = (ptr, o) => {
                            var destructors = [];
                            setter(
                                setterContext,
                                ptr,
                                setterArgumentType['toWireType'](
                                    destructors,
                                    o,
                                ),
                            );
                            runDestructors(destructors);
                        };
                    });
                    return [
                        {
                            name: reg.name,
                            fromWireType: function (ptr) {
                                var rv = new Array(elementsLength);
                                for (var i = 0; i < elementsLength; ++i) {
                                    rv[i] = elements[i].read(ptr);
                                }
                                rawDestructor(ptr);
                                return rv;
                            },
                            toWireType: function (destructors, o) {
                                if (elementsLength !== o.length) {
                                    throw new TypeError(
                                        `Incorrect number of tuple elements for ${reg.name}: expected=${elementsLength}, actual=${o.length}`,
                                    );
                                }
                                var ptr = rawConstructor();
                                for (var i = 0; i < elementsLength; ++i) {
                                    elements[i].write(ptr, o[i]);
                                }
                                if (destructors !== null) {
                                    destructors.push(rawDestructor, ptr);
                                }
                                return ptr;
                            },
                            argPackAdvance: 8,
                            readValueFromPointer: simpleReadValueFromPointer,
                            destructorFunction: rawDestructor,
                        },
                    ];
                },
            );
        }
        var structRegistrations = {};
        var __embind_finalize_value_object = function (structType) {
            var reg = structRegistrations[structType];
            delete structRegistrations[structType];
            var rawConstructor = reg.rawConstructor;
            var rawDestructor = reg.rawDestructor;
            var fieldRecords = reg.fields;
            var fieldTypes = fieldRecords
                .map((field) => field.getterReturnType)
                .concat(fieldRecords.map((field) => field.setterArgumentType));
            whenDependentTypesAreResolved(
                [structType],
                fieldTypes,
                (fieldTypes) => {
                    var fields = {};
                    fieldRecords.forEach((field, i) => {
                        var fieldName = field.fieldName;
                        var getterReturnType = fieldTypes[i];
                        var getter = field.getter;
                        var getterContext = field.getterContext;
                        var setterArgumentType =
                            fieldTypes[i + fieldRecords.length];
                        var setter = field.setter;
                        var setterContext = field.setterContext;
                        fields[fieldName] = {
                            read: (ptr) => {
                                return getterReturnType['fromWireType'](
                                    getter(getterContext, ptr),
                                );
                            },
                            write: (ptr, o) => {
                                var destructors = [];
                                setter(
                                    setterContext,
                                    ptr,
                                    setterArgumentType['toWireType'](
                                        destructors,
                                        o,
                                    ),
                                );
                                runDestructors(destructors);
                            },
                        };
                    });
                    return [
                        {
                            name: reg.name,
                            fromWireType: function (ptr) {
                                var rv = {};
                                for (var i in fields) {
                                    rv[i] = fields[i].read(ptr);
                                }
                                rawDestructor(ptr);
                                return rv;
                            },
                            toWireType: function (destructors, o) {
                                for (var fieldName in fields) {
                                    if (!(fieldName in o)) {
                                        throw new TypeError(
                                            `Missing field: "${fieldName}"`,
                                        );
                                    }
                                }
                                var ptr = rawConstructor();
                                for (fieldName in fields) {
                                    fields[fieldName].write(ptr, o[fieldName]);
                                }
                                if (destructors !== null) {
                                    destructors.push(rawDestructor, ptr);
                                }
                                return ptr;
                            },
                            argPackAdvance: 8,
                            readValueFromPointer: simpleReadValueFromPointer,
                            destructorFunction: rawDestructor,
                        },
                    ];
                },
            );
        };
        function __embind_register_bigint(
            primitiveType,
            name,
            size,
            minRange,
            maxRange,
        ) {}
        function getShiftFromSize(size) {
            switch (size) {
                case 1:
                    return 0;
                case 2:
                    return 1;
                case 4:
                    return 2;
                case 8:
                    return 3;
                default:
                    throw new TypeError(`Unknown type size: ${size}`);
            }
        }
        function embind_init_charCodes() {
            var codes = new Array(256);
            for (var i = 0; i < 256; ++i) {
                codes[i] = String.fromCharCode(i);
            }
            embind_charCodes = codes;
        }
        var embind_charCodes = undefined;
        function readLatin1String(ptr) {
            var ret = '';
            var c = ptr;
            while (HEAPU8[c]) {
                ret += embind_charCodes[HEAPU8[c++]];
            }
            return ret;
        }
        var BindingError = undefined;
        function throwBindingError(message) {
            throw new BindingError(message);
        }
        function registerType(rawType, registeredInstance, options = {}) {
            if (!('argPackAdvance' in registeredInstance)) {
                throw new TypeError(
                    'registerType registeredInstance requires argPackAdvance',
                );
            }
            var name = registeredInstance.name;
            if (!rawType) {
                throwBindingError(
                    `type "${name}" must have a positive integer typeid pointer`,
                );
            }
            if (registeredTypes.hasOwnProperty(rawType)) {
                if (options.ignoreDuplicateRegistrations) {
                    return;
                } else {
                    throwBindingError(`Cannot register type '${name}' twice`);
                }
            }
            registeredTypes[rawType] = registeredInstance;
            delete typeDependencies[rawType];
            if (awaitingDependencies.hasOwnProperty(rawType)) {
                var callbacks = awaitingDependencies[rawType];
                delete awaitingDependencies[rawType];
                callbacks.forEach((cb) => cb());
            }
        }
        function __embind_register_bool(
            rawType,
            name,
            size,
            trueValue,
            falseValue,
        ) {
            var shift = getShiftFromSize(size);
            name = readLatin1String(name);
            registerType(rawType, {
                name: name,
                fromWireType: function (wt) {
                    return !!wt;
                },
                toWireType: function (destructors, o) {
                    return o ? trueValue : falseValue;
                },
                argPackAdvance: 8,
                readValueFromPointer: function (pointer) {
                    var heap;
                    if (size === 1) {
                        heap = HEAP8;
                    } else if (size === 2) {
                        heap = HEAP16;
                    } else if (size === 4) {
                        heap = HEAP32;
                    } else {
                        throw new TypeError(
                            'Unknown boolean type size: ' + name,
                        );
                    }
                    return this['fromWireType'](heap[pointer >> shift]);
                },
                destructorFunction: null,
            });
        }
        function ClassHandle_isAliasOf(other) {
            if (!(this instanceof ClassHandle)) {
                return false;
            }
            if (!(other instanceof ClassHandle)) {
                return false;
            }
            var leftClass = this.$$.ptrType.registeredClass;
            var left = this.$$.ptr;
            var rightClass = other.$$.ptrType.registeredClass;
            var right = other.$$.ptr;
            while (leftClass.baseClass) {
                left = leftClass.upcast(left);
                leftClass = leftClass.baseClass;
            }
            while (rightClass.baseClass) {
                right = rightClass.upcast(right);
                rightClass = rightClass.baseClass;
            }
            return leftClass === rightClass && left === right;
        }
        function shallowCopyInternalPointer(o) {
            return {
                count: o.count,
                deleteScheduled: o.deleteScheduled,
                preservePointerOnDelete: o.preservePointerOnDelete,
                ptr: o.ptr,
                ptrType: o.ptrType,
                smartPtr: o.smartPtr,
                smartPtrType: o.smartPtrType,
            };
        }
        function throwInstanceAlreadyDeleted(obj) {
            function getInstanceTypeName(handle) {
                return handle.$$.ptrType.registeredClass.name;
            }
            throwBindingError(
                getInstanceTypeName(obj) + ' instance already deleted',
            );
        }
        var finalizationRegistry = false;
        function detachFinalizer(handle) {}
        function runDestructor($$) {
            if ($$.smartPtr) {
                $$.smartPtrType.rawDestructor($$.smartPtr);
            } else {
                $$.ptrType.registeredClass.rawDestructor($$.ptr);
            }
        }
        function releaseClassHandle($$) {
            $$.count.value -= 1;
            var toDelete = 0 === $$.count.value;
            if (toDelete) {
                runDestructor($$);
            }
        }
        function downcastPointer(ptr, ptrClass, desiredClass) {
            if (ptrClass === desiredClass) {
                return ptr;
            }
            if (undefined === desiredClass.baseClass) {
                return null;
            }
            var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
            if (rv === null) {
                return null;
            }
            return desiredClass.downcast(rv);
        }
        var registeredPointers = {};
        function getInheritedInstanceCount() {
            return Object.keys(registeredInstances).length;
        }
        function getLiveInheritedInstances() {
            var rv = [];
            for (var k in registeredInstances) {
                if (registeredInstances.hasOwnProperty(k)) {
                    rv.push(registeredInstances[k]);
                }
            }
            return rv;
        }
        var deletionQueue = [];
        function flushPendingDeletes() {
            while (deletionQueue.length) {
                var obj = deletionQueue.pop();
                obj.$$.deleteScheduled = false;
                obj['delete']();
            }
        }
        var delayFunction = undefined;
        function setDelayFunction(fn) {
            delayFunction = fn;
            if (deletionQueue.length && delayFunction) {
                delayFunction(flushPendingDeletes);
            }
        }
        function init_embind() {
            Module['getInheritedInstanceCount'] = getInheritedInstanceCount;
            Module['getLiveInheritedInstances'] = getLiveInheritedInstances;
            Module['flushPendingDeletes'] = flushPendingDeletes;
            Module['setDelayFunction'] = setDelayFunction;
        }
        var registeredInstances = {};
        function getBasestPointer(class_, ptr) {
            if (ptr === undefined) {
                throwBindingError('ptr should not be undefined');
            }
            while (class_.baseClass) {
                ptr = class_.upcast(ptr);
                class_ = class_.baseClass;
            }
            return ptr;
        }
        function getInheritedInstance(class_, ptr) {
            ptr = getBasestPointer(class_, ptr);
            return registeredInstances[ptr];
        }
        function makeClassHandle(prototype, record) {
            if (!record.ptrType || !record.ptr) {
                throwInternalError('makeClassHandle requires ptr and ptrType');
            }
            var hasSmartPtrType = !!record.smartPtrType;
            var hasSmartPtr = !!record.smartPtr;
            if (hasSmartPtrType !== hasSmartPtr) {
                throwInternalError(
                    'Both smartPtrType and smartPtr must be specified',
                );
            }
            record.count = { value: 1 };
            return attachFinalizer(
                Object.create(prototype, { $$: { value: record } }),
            );
        }
        function RegisteredPointer_fromWireType(ptr) {
            var rawPointer = this.getPointee(ptr);
            if (!rawPointer) {
                this.destructor(ptr);
                return null;
            }
            var registeredInstance = getInheritedInstance(
                this.registeredClass,
                rawPointer,
            );
            if (undefined !== registeredInstance) {
                if (0 === registeredInstance.$$.count.value) {
                    registeredInstance.$$.ptr = rawPointer;
                    registeredInstance.$$.smartPtr = ptr;
                    return registeredInstance['clone']();
                } else {
                    var rv = registeredInstance['clone']();
                    this.destructor(ptr);
                    return rv;
                }
            }
            function makeDefaultHandle() {
                if (this.isSmartPointer) {
                    return makeClassHandle(
                        this.registeredClass.instancePrototype,
                        {
                            ptrType: this.pointeeType,
                            ptr: rawPointer,
                            smartPtrType: this,
                            smartPtr: ptr,
                        },
                    );
                } else {
                    return makeClassHandle(
                        this.registeredClass.instancePrototype,
                        { ptrType: this, ptr: ptr },
                    );
                }
            }
            var actualType = this.registeredClass.getActualType(rawPointer);
            var registeredPointerRecord = registeredPointers[actualType];
            if (!registeredPointerRecord) {
                return makeDefaultHandle.call(this);
            }
            var toType;
            if (this.isConst) {
                toType = registeredPointerRecord.constPointerType;
            } else {
                toType = registeredPointerRecord.pointerType;
            }
            var dp = downcastPointer(
                rawPointer,
                this.registeredClass,
                toType.registeredClass,
            );
            if (dp === null) {
                return makeDefaultHandle.call(this);
            }
            if (this.isSmartPointer) {
                return makeClassHandle(
                    toType.registeredClass.instancePrototype,
                    {
                        ptrType: toType,
                        ptr: dp,
                        smartPtrType: this,
                        smartPtr: ptr,
                    },
                );
            } else {
                return makeClassHandle(
                    toType.registeredClass.instancePrototype,
                    { ptrType: toType, ptr: dp },
                );
            }
        }
        var attachFinalizer = function (handle) {
            if ('undefined' === typeof FinalizationRegistry) {
                attachFinalizer = (handle) => handle;
                return handle;
            }
            finalizationRegistry = new FinalizationRegistry((info) => {
                releaseClassHandle(info.$$);
            });
            attachFinalizer = (handle) => {
                var $$ = handle.$$;
                var hasSmartPtr = !!$$.smartPtr;
                if (hasSmartPtr) {
                    var info = { $$: $$ };
                    finalizationRegistry.register(handle, info, handle);
                }
                return handle;
            };
            detachFinalizer = (handle) =>
                finalizationRegistry.unregister(handle);
            return attachFinalizer(handle);
        };
        function ClassHandle_clone() {
            if (!this.$$.ptr) {
                throwInstanceAlreadyDeleted(this);
            }
            if (this.$$.preservePointerOnDelete) {
                this.$$.count.value += 1;
                return this;
            } else {
                var clone = attachFinalizer(
                    Object.create(Object.getPrototypeOf(this), {
                        $$: { value: shallowCopyInternalPointer(this.$$) },
                    }),
                );
                clone.$$.count.value += 1;
                clone.$$.deleteScheduled = false;
                return clone;
            }
        }
        function ClassHandle_delete() {
            if (!this.$$.ptr) {
                throwInstanceAlreadyDeleted(this);
            }
            if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
                throwBindingError('Object already scheduled for deletion');
            }
            detachFinalizer(this);
            releaseClassHandle(this.$$);
            if (!this.$$.preservePointerOnDelete) {
                this.$$.smartPtr = undefined;
                this.$$.ptr = undefined;
            }
        }
        function ClassHandle_isDeleted() {
            return !this.$$.ptr;
        }
        function ClassHandle_deleteLater() {
            if (!this.$$.ptr) {
                throwInstanceAlreadyDeleted(this);
            }
            if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
                throwBindingError('Object already scheduled for deletion');
            }
            deletionQueue.push(this);
            if (deletionQueue.length === 1 && delayFunction) {
                delayFunction(flushPendingDeletes);
            }
            this.$$.deleteScheduled = true;
            return this;
        }
        function init_ClassHandle() {
            ClassHandle.prototype['isAliasOf'] = ClassHandle_isAliasOf;
            ClassHandle.prototype['clone'] = ClassHandle_clone;
            ClassHandle.prototype['delete'] = ClassHandle_delete;
            ClassHandle.prototype['isDeleted'] = ClassHandle_isDeleted;
            ClassHandle.prototype['deleteLater'] = ClassHandle_deleteLater;
        }
        function ClassHandle() {}
        function ensureOverloadTable(proto, methodName, humanName) {
            if (undefined === proto[methodName].overloadTable) {
                var prevFunc = proto[methodName];
                proto[methodName] = function () {
                    if (
                        !proto[methodName].overloadTable.hasOwnProperty(
                            arguments.length,
                        )
                    ) {
                        throwBindingError(
                            `Function '${humanName}' called with an invalid number of arguments (${arguments.length}) - expects one of (${proto[methodName].overloadTable})!`,
                        );
                    }
                    return proto[methodName].overloadTable[
                        arguments.length
                    ].apply(this, arguments);
                };
                proto[methodName].overloadTable = [];
                proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
            }
        }
        function exposePublicSymbol(name, value, numArguments) {
            if (Module.hasOwnProperty(name)) {
                if (
                    undefined === numArguments ||
                    (undefined !== Module[name].overloadTable &&
                        undefined !== Module[name].overloadTable[numArguments])
                ) {
                    throwBindingError(
                        `Cannot register public name '${name}' twice`,
                    );
                }
                ensureOverloadTable(Module, name, name);
                if (Module.hasOwnProperty(numArguments)) {
                    throwBindingError(
                        `Cannot register multiple overloads of a function with the same number of arguments (${numArguments})!`,
                    );
                }
                Module[name].overloadTable[numArguments] = value;
            } else {
                Module[name] = value;
                if (undefined !== numArguments) {
                    Module[name].numArguments = numArguments;
                }
            }
        }
        function RegisteredClass(
            name,
            constructor,
            instancePrototype,
            rawDestructor,
            baseClass,
            getActualType,
            upcast,
            downcast,
        ) {
            this.name = name;
            this.constructor = constructor;
            this.instancePrototype = instancePrototype;
            this.rawDestructor = rawDestructor;
            this.baseClass = baseClass;
            this.getActualType = getActualType;
            this.upcast = upcast;
            this.downcast = downcast;
            this.pureVirtualFunctions = [];
        }
        function upcastPointer(ptr, ptrClass, desiredClass) {
            while (ptrClass !== desiredClass) {
                if (!ptrClass.upcast) {
                    throwBindingError(
                        `Expected null or instance of ${desiredClass.name}, got an instance of ${ptrClass.name}`,
                    );
                }
                ptr = ptrClass.upcast(ptr);
                ptrClass = ptrClass.baseClass;
            }
            return ptr;
        }
        function constNoSmartPtrRawPointerToWireType(destructors, handle) {
            if (handle === null) {
                if (this.isReference) {
                    throwBindingError(`null is not a valid ${this.name}`);
                }
                return 0;
            }
            if (!handle.$$) {
                throwBindingError(
                    `Cannot pass "${embindRepr(handle)}" as a ${this.name}`,
                );
            }
            if (!handle.$$.ptr) {
                throwBindingError(
                    `Cannot pass deleted object as a pointer of type ${this.name}`,
                );
            }
            var handleClass = handle.$$.ptrType.registeredClass;
            var ptr = upcastPointer(
                handle.$$.ptr,
                handleClass,
                this.registeredClass,
            );
            return ptr;
        }
        function genericPointerToWireType(destructors, handle) {
            var ptr;
            if (handle === null) {
                if (this.isReference) {
                    throwBindingError(`null is not a valid ${this.name}`);
                }
                if (this.isSmartPointer) {
                    ptr = this.rawConstructor();
                    if (destructors !== null) {
                        destructors.push(this.rawDestructor, ptr);
                    }
                    return ptr;
                } else {
                    return 0;
                }
            }
            if (!handle.$$) {
                throwBindingError(
                    `Cannot pass "${embindRepr(handle)}" as a ${this.name}`,
                );
            }
            if (!handle.$$.ptr) {
                throwBindingError(
                    `Cannot pass deleted object as a pointer of type ${this.name}`,
                );
            }
            if (!this.isConst && handle.$$.ptrType.isConst) {
                throwBindingError(
                    `Cannot convert argument of type ${handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name} to parameter type ${this.name}`,
                );
            }
            var handleClass = handle.$$.ptrType.registeredClass;
            ptr = upcastPointer(
                handle.$$.ptr,
                handleClass,
                this.registeredClass,
            );
            if (this.isSmartPointer) {
                if (undefined === handle.$$.smartPtr) {
                    throwBindingError(
                        'Passing raw pointer to smart pointer is illegal',
                    );
                }
                switch (this.sharingPolicy) {
                    case 0:
                        if (handle.$$.smartPtrType === this) {
                            ptr = handle.$$.smartPtr;
                        } else {
                            throwBindingError(
                                `Cannot convert argument of type ${handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name} to parameter type ${this.name}`,
                            );
                        }
                        break;
                    case 1:
                        ptr = handle.$$.smartPtr;
                        break;
                    case 2:
                        if (handle.$$.smartPtrType === this) {
                            ptr = handle.$$.smartPtr;
                        } else {
                            var clonedHandle = handle['clone']();
                            ptr = this.rawShare(
                                ptr,
                                Emval.toHandle(function () {
                                    clonedHandle['delete']();
                                }),
                            );
                            if (destructors !== null) {
                                destructors.push(this.rawDestructor, ptr);
                            }
                        }
                        break;
                    default:
                        throwBindingError('Unsupporting sharing policy');
                }
            }
            return ptr;
        }
        function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
            if (handle === null) {
                if (this.isReference) {
                    throwBindingError(`null is not a valid ${this.name}`);
                }
                return 0;
            }
            if (!handle.$$) {
                throwBindingError(
                    `Cannot pass "${embindRepr(handle)}" as a ${this.name}`,
                );
            }
            if (!handle.$$.ptr) {
                throwBindingError(
                    `Cannot pass deleted object as a pointer of type ${this.name}`,
                );
            }
            if (handle.$$.ptrType.isConst) {
                throwBindingError(
                    `Cannot convert argument of type ${handle.$$.ptrType.name} to parameter type ${this.name}`,
                );
            }
            var handleClass = handle.$$.ptrType.registeredClass;
            var ptr = upcastPointer(
                handle.$$.ptr,
                handleClass,
                this.registeredClass,
            );
            return ptr;
        }
        function RegisteredPointer_getPointee(ptr) {
            if (this.rawGetPointee) {
                ptr = this.rawGetPointee(ptr);
            }
            return ptr;
        }
        function RegisteredPointer_destructor(ptr) {
            if (this.rawDestructor) {
                this.rawDestructor(ptr);
            }
        }
        function RegisteredPointer_deleteObject(handle) {
            if (handle !== null) {
                handle['delete']();
            }
        }
        function init_RegisteredPointer() {
            RegisteredPointer.prototype.getPointee =
                RegisteredPointer_getPointee;
            RegisteredPointer.prototype.destructor =
                RegisteredPointer_destructor;
            RegisteredPointer.prototype['argPackAdvance'] = 8;
            RegisteredPointer.prototype['readValueFromPointer'] =
                simpleReadValueFromPointer;
            RegisteredPointer.prototype['deleteObject'] =
                RegisteredPointer_deleteObject;
            RegisteredPointer.prototype['fromWireType'] =
                RegisteredPointer_fromWireType;
        }
        function RegisteredPointer(
            name,
            registeredClass,
            isReference,
            isConst,
            isSmartPointer,
            pointeeType,
            sharingPolicy,
            rawGetPointee,
            rawConstructor,
            rawShare,
            rawDestructor,
        ) {
            this.name = name;
            this.registeredClass = registeredClass;
            this.isReference = isReference;
            this.isConst = isConst;
            this.isSmartPointer = isSmartPointer;
            this.pointeeType = pointeeType;
            this.sharingPolicy = sharingPolicy;
            this.rawGetPointee = rawGetPointee;
            this.rawConstructor = rawConstructor;
            this.rawShare = rawShare;
            this.rawDestructor = rawDestructor;
            if (!isSmartPointer && registeredClass.baseClass === undefined) {
                if (isConst) {
                    this['toWireType'] = constNoSmartPtrRawPointerToWireType;
                    this.destructorFunction = null;
                } else {
                    this['toWireType'] = nonConstNoSmartPtrRawPointerToWireType;
                    this.destructorFunction = null;
                }
            } else {
                this['toWireType'] = genericPointerToWireType;
            }
        }
        function replacePublicSymbol(name, value, numArguments) {
            if (!Module.hasOwnProperty(name)) {
                throwInternalError('Replacing nonexistant public symbol');
            }
            if (
                undefined !== Module[name].overloadTable &&
                undefined !== numArguments
            ) {
                Module[name].overloadTable[numArguments] = value;
            } else {
                Module[name] = value;
                Module[name].argCount = numArguments;
            }
        }
        var dynCallLegacy = (sig, ptr, args) => {
            var f = Module['dynCall_' + sig];
            return args && args.length
                ? f.apply(null, [ptr].concat(args))
                : f.call(null, ptr);
        };
        var getWasmTableEntry = (funcPtr) => {
            return wasmTable.get(funcPtr);
        };
        var dynCall = (sig, ptr, args) => {
            if (sig.includes('j')) {
                return dynCallLegacy(sig, ptr, args);
            }
            var rtn = getWasmTableEntry(ptr).apply(null, args);
            return rtn;
        };
        var getDynCaller = (sig, ptr) => {
            var argCache = [];
            return function () {
                argCache.length = 0;
                Object.assign(argCache, arguments);
                return dynCall(sig, ptr, argCache);
            };
        };
        function embind__requireFunction(signature, rawFunction) {
            signature = readLatin1String(signature);
            function makeDynCaller() {
                if (signature.includes('j')) {
                    return getDynCaller(signature, rawFunction);
                }
                return getWasmTableEntry(rawFunction);
            }
            var fp = makeDynCaller();
            if (typeof fp != 'function') {
                throwBindingError(
                    `unknown function pointer with signature ${signature}: ${rawFunction}`,
                );
            }
            return fp;
        }
        var UnboundTypeError = undefined;
        function getTypeName(type) {
            var ptr = ___getTypeName(type);
            var rv = readLatin1String(ptr);
            _free(ptr);
            return rv;
        }
        function throwUnboundTypeError(message, types) {
            var unboundTypes = [];
            var seen = {};
            function visit(type) {
                if (seen[type]) {
                    return;
                }
                if (registeredTypes[type]) {
                    return;
                }
                if (typeDependencies[type]) {
                    typeDependencies[type].forEach(visit);
                    return;
                }
                unboundTypes.push(type);
                seen[type] = true;
            }
            types.forEach(visit);
            throw new UnboundTypeError(
                `${message}: ` + unboundTypes.map(getTypeName).join([', ']),
            );
        }
        function __embind_register_class(
            rawType,
            rawPointerType,
            rawConstPointerType,
            baseClassRawType,
            getActualTypeSignature,
            getActualType,
            upcastSignature,
            upcast,
            downcastSignature,
            downcast,
            name,
            destructorSignature,
            rawDestructor,
        ) {
            name = readLatin1String(name);
            getActualType = embind__requireFunction(
                getActualTypeSignature,
                getActualType,
            );
            if (upcast) {
                upcast = embind__requireFunction(upcastSignature, upcast);
            }
            if (downcast) {
                downcast = embind__requireFunction(downcastSignature, downcast);
            }
            rawDestructor = embind__requireFunction(
                destructorSignature,
                rawDestructor,
            );
            var legalFunctionName = makeLegalFunctionName(name);
            exposePublicSymbol(legalFunctionName, function () {
                throwUnboundTypeError(
                    `Cannot construct ${name} due to unbound types`,
                    [baseClassRawType],
                );
            });
            whenDependentTypesAreResolved(
                [rawType, rawPointerType, rawConstPointerType],
                baseClassRawType ? [baseClassRawType] : [],
                function (base) {
                    base = base[0];
                    var baseClass;
                    var basePrototype;
                    if (baseClassRawType) {
                        baseClass = base.registeredClass;
                        basePrototype = baseClass.instancePrototype;
                    } else {
                        basePrototype = ClassHandle.prototype;
                    }
                    var constructor = createNamedFunction(
                        legalFunctionName,
                        function () {
                            if (
                                Object.getPrototypeOf(this) !==
                                instancePrototype
                            ) {
                                throw new BindingError(
                                    "Use 'new' to construct " + name,
                                );
                            }
                            if (
                                undefined === registeredClass.constructor_body
                            ) {
                                throw new BindingError(
                                    name + ' has no accessible constructor',
                                );
                            }
                            var body =
                                registeredClass.constructor_body[
                                    arguments.length
                                ];
                            if (undefined === body) {
                                throw new BindingError(
                                    `Tried to invoke ctor of ${name} with invalid number of parameters (${arguments.length}) - expected (${Object.keys(registeredClass.constructor_body).toString()}) parameters instead!`,
                                );
                            }
                            return body.apply(this, arguments);
                        },
                    );
                    var instancePrototype = Object.create(basePrototype, {
                        constructor: { value: constructor },
                    });
                    constructor.prototype = instancePrototype;
                    var registeredClass = new RegisteredClass(
                        name,
                        constructor,
                        instancePrototype,
                        rawDestructor,
                        baseClass,
                        getActualType,
                        upcast,
                        downcast,
                    );
                    if (registeredClass.baseClass) {
                        if (
                            registeredClass.baseClass.__derivedClasses ===
                            undefined
                        ) {
                            registeredClass.baseClass.__derivedClasses = [];
                        }
                        registeredClass.baseClass.__derivedClasses.push(
                            registeredClass,
                        );
                    }
                    var referenceConverter = new RegisteredPointer(
                        name,
                        registeredClass,
                        true,
                        false,
                        false,
                    );
                    var pointerConverter = new RegisteredPointer(
                        name + '*',
                        registeredClass,
                        false,
                        false,
                        false,
                    );
                    var constPointerConverter = new RegisteredPointer(
                        name + ' const*',
                        registeredClass,
                        false,
                        true,
                        false,
                    );
                    registeredPointers[rawType] = {
                        pointerType: pointerConverter,
                        constPointerType: constPointerConverter,
                    };
                    replacePublicSymbol(legalFunctionName, constructor);
                    return [
                        referenceConverter,
                        pointerConverter,
                        constPointerConverter,
                    ];
                },
            );
        }
        function HandleAllocator() {
            this.allocated = [undefined];
            this.freelist = [];
            this.get = function (id) {
                return this.allocated[id];
            };
            this.has = function (id) {
                return this.allocated[id] !== undefined;
            };
            this.allocate = function (handle) {
                var id = this.freelist.pop() || this.allocated.length;
                this.allocated[id] = handle;
                return id;
            };
            this.free = function (id) {
                this.allocated[id] = undefined;
                this.freelist.push(id);
            };
        }
        var emval_handles = new HandleAllocator();
        function __emval_decref(handle) {
            if (
                handle >= emval_handles.reserved &&
                0 === --emval_handles.get(handle).refcount
            ) {
                emval_handles.free(handle);
            }
        }
        function count_emval_handles() {
            var count = 0;
            for (
                var i = emval_handles.reserved;
                i < emval_handles.allocated.length;
                ++i
            ) {
                if (emval_handles.allocated[i] !== undefined) {
                    ++count;
                }
            }
            return count;
        }
        function init_emval() {
            emval_handles.allocated.push(
                { value: undefined },
                { value: null },
                { value: true },
                { value: false },
            );
            emval_handles.reserved = emval_handles.allocated.length;
            Module['count_emval_handles'] = count_emval_handles;
        }
        var Emval = {
            toValue: (handle) => {
                if (!handle) {
                    throwBindingError(
                        'Cannot use deleted val. handle = ' + handle,
                    );
                }
                return emval_handles.get(handle).value;
            },
            toHandle: (value) => {
                switch (value) {
                    case undefined:
                        return 1;
                    case null:
                        return 2;
                    case true:
                        return 3;
                    case false:
                        return 4;
                    default: {
                        return emval_handles.allocate({
                            refcount: 1,
                            value: value,
                        });
                    }
                }
            },
        };
        function __embind_register_emval(rawType, name) {
            name = readLatin1String(name);
            registerType(rawType, {
                name: name,
                fromWireType: function (handle) {
                    var rv = Emval.toValue(handle);
                    __emval_decref(handle);
                    return rv;
                },
                toWireType: function (destructors, value) {
                    return Emval.toHandle(value);
                },
                argPackAdvance: 8,
                readValueFromPointer: simpleReadValueFromPointer,
                destructorFunction: null,
            });
        }
        function enumReadValueFromPointer(name, shift, signed) {
            switch (shift) {
                case 0:
                    return function (pointer) {
                        var heap = signed ? HEAP8 : HEAPU8;
                        return this['fromWireType'](heap[pointer]);
                    };
                case 1:
                    return function (pointer) {
                        var heap = signed ? HEAP16 : HEAPU16;
                        return this['fromWireType'](heap[pointer >> 1]);
                    };
                case 2:
                    return function (pointer) {
                        var heap = signed ? HEAP32 : HEAPU32;
                        return this['fromWireType'](heap[pointer >> 2]);
                    };
                default:
                    throw new TypeError('Unknown integer type: ' + name);
            }
        }
        function __embind_register_enum(rawType, name, size, isSigned) {
            var shift = getShiftFromSize(size);
            name = readLatin1String(name);
            function ctor() {}
            ctor.values = {};
            registerType(rawType, {
                name: name,
                constructor: ctor,
                fromWireType: function (c) {
                    return this.constructor.values[c];
                },
                toWireType: function (destructors, c) {
                    return c.value;
                },
                argPackAdvance: 8,
                readValueFromPointer: enumReadValueFromPointer(
                    name,
                    shift,
                    isSigned,
                ),
                destructorFunction: null,
            });
            exposePublicSymbol(name, ctor);
        }
        function requireRegisteredType(rawType, humanName) {
            var impl = registeredTypes[rawType];
            if (undefined === impl) {
                throwBindingError(
                    humanName + ' has unknown type ' + getTypeName(rawType),
                );
            }
            return impl;
        }
        function __embind_register_enum_value(rawEnumType, name, enumValue) {
            var enumType = requireRegisteredType(rawEnumType, 'enum');
            name = readLatin1String(name);
            var Enum = enumType.constructor;
            var Value = Object.create(enumType.constructor.prototype, {
                value: { value: enumValue },
                constructor: {
                    value: createNamedFunction(
                        `${enumType.name}_${name}`,
                        function () {},
                    ),
                },
            });
            Enum.values[enumValue] = Value;
            Enum[name] = Value;
        }
        function embindRepr(v) {
            if (v === null) {
                return 'null';
            }
            var t = typeof v;
            if (t === 'object' || t === 'array' || t === 'function') {
                return v.toString();
            } else {
                return '' + v;
            }
        }
        function floatReadValueFromPointer(name, shift) {
            switch (shift) {
                case 2:
                    return function (pointer) {
                        return this['fromWireType'](HEAPF32[pointer >> 2]);
                    };
                case 3:
                    return function (pointer) {
                        return this['fromWireType'](HEAPF64[pointer >> 3]);
                    };
                default:
                    throw new TypeError('Unknown float type: ' + name);
            }
        }
        function __embind_register_float(rawType, name, size) {
            var shift = getShiftFromSize(size);
            name = readLatin1String(name);
            registerType(rawType, {
                name: name,
                fromWireType: function (value) {
                    return value;
                },
                toWireType: function (destructors, value) {
                    return value;
                },
                argPackAdvance: 8,
                readValueFromPointer: floatReadValueFromPointer(name, shift),
                destructorFunction: null,
            });
        }
        function newFunc(constructor, argumentList) {
            if (!(constructor instanceof Function)) {
                throw new TypeError(
                    `new_ called with constructor type ${typeof constructor} which is not a function`,
                );
            }
            var dummy = createNamedFunction(
                constructor.name || 'unknownFunctionName',
                function () {},
            );
            dummy.prototype = constructor.prototype;
            var obj = new dummy();
            var r = constructor.apply(obj, argumentList);
            return r instanceof Object ? r : obj;
        }
        function craftInvokerFunction(
            humanName,
            argTypes,
            classType,
            cppInvokerFunc,
            cppTargetFunc,
            isAsync,
        ) {
            var argCount = argTypes.length;
            if (argCount < 2) {
                throwBindingError(
                    "argTypes array size mismatch! Must at least get return value and 'this' types!",
                );
            }
            var isClassMethodFunc = argTypes[1] !== null && classType !== null;
            var needsDestructorStack = false;
            for (var i = 1; i < argTypes.length; ++i) {
                if (
                    argTypes[i] !== null &&
                    argTypes[i].destructorFunction === undefined
                ) {
                    needsDestructorStack = true;
                    break;
                }
            }
            var returns = argTypes[0].name !== 'void';
            var argsList = '';
            var argsListWired = '';
            for (var i = 0; i < argCount - 2; ++i) {
                argsList += (i !== 0 ? ', ' : '') + 'arg' + i;
                argsListWired += (i !== 0 ? ', ' : '') + 'arg' + i + 'Wired';
            }
            var invokerFnBody = `\n        return function ${makeLegalFunctionName(humanName)}(${argsList}) {\n        if (arguments.length !== ${argCount - 2}) {\n          throwBindingError('function ${humanName} called with ${arguments.length} arguments, expected ${argCount - 2} args!');\n        }`;
            if (needsDestructorStack) {
                invokerFnBody += 'var destructors = [];\n';
            }
            var dtorStack = needsDestructorStack ? 'destructors' : 'null';
            var args1 = [
                'throwBindingError',
                'invoker',
                'fn',
                'runDestructors',
                'retType',
                'classParam',
            ];
            var args2 = [
                throwBindingError,
                cppInvokerFunc,
                cppTargetFunc,
                runDestructors,
                argTypes[0],
                argTypes[1],
            ];
            if (isClassMethodFunc) {
                invokerFnBody +=
                    'var thisWired = classParam.toWireType(' +
                    dtorStack +
                    ', this);\n';
            }
            for (var i = 0; i < argCount - 2; ++i) {
                invokerFnBody +=
                    'var arg' +
                    i +
                    'Wired = argType' +
                    i +
                    '.toWireType(' +
                    dtorStack +
                    ', arg' +
                    i +
                    '); // ' +
                    argTypes[i + 2].name +
                    '\n';
                args1.push('argType' + i);
                args2.push(argTypes[i + 2]);
            }
            if (isClassMethodFunc) {
                argsListWired =
                    'thisWired' +
                    (argsListWired.length > 0 ? ', ' : '') +
                    argsListWired;
            }
            invokerFnBody +=
                (returns || isAsync ? 'var rv = ' : '') +
                'invoker(fn' +
                (argsListWired.length > 0 ? ', ' : '') +
                argsListWired +
                ');\n';
            if (needsDestructorStack) {
                invokerFnBody += 'runDestructors(destructors);\n';
            } else {
                for (
                    var i = isClassMethodFunc ? 1 : 2;
                    i < argTypes.length;
                    ++i
                ) {
                    var paramName =
                        i === 1 ? 'thisWired' : 'arg' + (i - 2) + 'Wired';
                    if (argTypes[i].destructorFunction !== null) {
                        invokerFnBody +=
                            paramName +
                            '_dtor(' +
                            paramName +
                            '); // ' +
                            argTypes[i].name +
                            '\n';
                        args1.push(paramName + '_dtor');
                        args2.push(argTypes[i].destructorFunction);
                    }
                }
            }
            if (returns) {
                invokerFnBody +=
                    'var ret = retType.fromWireType(rv);\n' + 'return ret;\n';
            } else {
            }
            invokerFnBody += '}\n';
            args1.push(invokerFnBody);
            return newFunc(Function, args1).apply(null, args2);
        }
        function heap32VectorToArray(count, firstElement) {
            var array = [];
            for (var i = 0; i < count; i++) {
                array.push(HEAPU32[(firstElement + i * 4) >> 2]);
            }
            return array;
        }
        function __embind_register_function(
            name,
            argCount,
            rawArgTypesAddr,
            signature,
            rawInvoker,
            fn,
            isAsync,
        ) {
            var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
            name = readLatin1String(name);
            rawInvoker = embind__requireFunction(signature, rawInvoker);
            exposePublicSymbol(
                name,
                function () {
                    throwUnboundTypeError(
                        `Cannot call ${name} due to unbound types`,
                        argTypes,
                    );
                },
                argCount - 1,
            );
            whenDependentTypesAreResolved([], argTypes, function (argTypes) {
                var invokerArgsArray = [argTypes[0], null].concat(
                    argTypes.slice(1),
                );
                replacePublicSymbol(
                    name,
                    craftInvokerFunction(
                        name,
                        invokerArgsArray,
                        null,
                        rawInvoker,
                        fn,
                        isAsync,
                    ),
                    argCount - 1,
                );
                return [];
            });
        }
        function integerReadValueFromPointer(name, shift, signed) {
            switch (shift) {
                case 0:
                    return signed
                        ? function readS8FromPointer(pointer) {
                              return HEAP8[pointer];
                          }
                        : function readU8FromPointer(pointer) {
                              return HEAPU8[pointer];
                          };
                case 1:
                    return signed
                        ? function readS16FromPointer(pointer) {
                              return HEAP16[pointer >> 1];
                          }
                        : function readU16FromPointer(pointer) {
                              return HEAPU16[pointer >> 1];
                          };
                case 2:
                    return signed
                        ? function readS32FromPointer(pointer) {
                              return HEAP32[pointer >> 2];
                          }
                        : function readU32FromPointer(pointer) {
                              return HEAPU32[pointer >> 2];
                          };
                default:
                    throw new TypeError('Unknown integer type: ' + name);
            }
        }
        function __embind_register_integer(
            primitiveType,
            name,
            size,
            minRange,
            maxRange,
        ) {
            name = readLatin1String(name);
            if (maxRange === -1) {
                maxRange = 4294967295;
            }
            var shift = getShiftFromSize(size);
            var fromWireType = (value) => value;
            if (minRange === 0) {
                var bitshift = 32 - 8 * size;
                fromWireType = (value) => (value << bitshift) >>> bitshift;
            }
            var isUnsignedType = name.includes('unsigned');
            var checkAssertions = (value, toTypeName) => {};
            var toWireType;
            if (isUnsignedType) {
                toWireType = function (destructors, value) {
                    checkAssertions(value, this.name);
                    return value >>> 0;
                };
            } else {
                toWireType = function (destructors, value) {
                    checkAssertions(value, this.name);
                    return value;
                };
            }
            registerType(primitiveType, {
                name: name,
                fromWireType: fromWireType,
                toWireType: toWireType,
                argPackAdvance: 8,
                readValueFromPointer: integerReadValueFromPointer(
                    name,
                    shift,
                    minRange !== 0,
                ),
                destructorFunction: null,
            });
        }
        function __embind_register_memory_view(rawType, dataTypeIndex, name) {
            var typeMapping = [
                Int8Array,
                Uint8Array,
                Int16Array,
                Uint16Array,
                Int32Array,
                Uint32Array,
                Float32Array,
                Float64Array,
            ];
            var TA = typeMapping[dataTypeIndex];
            function decodeMemoryView(handle) {
                handle = handle >> 2;
                var heap = HEAPU32;
                var size = heap[handle];
                var data = heap[handle + 1];
                return new TA(heap.buffer, data, size);
            }
            name = readLatin1String(name);
            registerType(
                rawType,
                {
                    name: name,
                    fromWireType: decodeMemoryView,
                    argPackAdvance: 8,
                    readValueFromPointer: decodeMemoryView,
                },
                { ignoreDuplicateRegistrations: true },
            );
        }
        var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
            if (!(maxBytesToWrite > 0)) return 0;
            var startIdx = outIdx;
            var endIdx = outIdx + maxBytesToWrite - 1;
            for (var i = 0; i < str.length; ++i) {
                var u = str.charCodeAt(i);
                if (u >= 55296 && u <= 57343) {
                    var u1 = str.charCodeAt(++i);
                    u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
                }
                if (u <= 127) {
                    if (outIdx >= endIdx) break;
                    heap[outIdx++] = u;
                } else if (u <= 2047) {
                    if (outIdx + 1 >= endIdx) break;
                    heap[outIdx++] = 192 | (u >> 6);
                    heap[outIdx++] = 128 | (u & 63);
                } else if (u <= 65535) {
                    if (outIdx + 2 >= endIdx) break;
                    heap[outIdx++] = 224 | (u >> 12);
                    heap[outIdx++] = 128 | ((u >> 6) & 63);
                    heap[outIdx++] = 128 | (u & 63);
                } else {
                    if (outIdx + 3 >= endIdx) break;
                    heap[outIdx++] = 240 | (u >> 18);
                    heap[outIdx++] = 128 | ((u >> 12) & 63);
                    heap[outIdx++] = 128 | ((u >> 6) & 63);
                    heap[outIdx++] = 128 | (u & 63);
                }
            }
            heap[outIdx] = 0;
            return outIdx - startIdx;
        };
        var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
            return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
        };
        var lengthBytesUTF8 = (str) => {
            var len = 0;
            for (var i = 0; i < str.length; ++i) {
                var c = str.charCodeAt(i);
                if (c <= 127) {
                    len++;
                } else if (c <= 2047) {
                    len += 2;
                } else if (c >= 55296 && c <= 57343) {
                    len += 4;
                    ++i;
                } else {
                    len += 3;
                }
            }
            return len;
        };
        var UTF8Decoder =
            typeof TextDecoder != 'undefined'
                ? new TextDecoder('utf8')
                : undefined;
        var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
            var endIdx = idx + maxBytesToRead;
            var endPtr = idx;
            while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
            if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
                return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
            }
            var str = '';
            while (idx < endPtr) {
                var u0 = heapOrArray[idx++];
                if (!(u0 & 128)) {
                    str += String.fromCharCode(u0);
                    continue;
                }
                var u1 = heapOrArray[idx++] & 63;
                if ((u0 & 224) == 192) {
                    str += String.fromCharCode(((u0 & 31) << 6) | u1);
                    continue;
                }
                var u2 = heapOrArray[idx++] & 63;
                if ((u0 & 240) == 224) {
                    u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
                } else {
                    u0 =
                        ((u0 & 7) << 18) |
                        (u1 << 12) |
                        (u2 << 6) |
                        (heapOrArray[idx++] & 63);
                }
                if (u0 < 65536) {
                    str += String.fromCharCode(u0);
                } else {
                    var ch = u0 - 65536;
                    str += String.fromCharCode(
                        55296 | (ch >> 10),
                        56320 | (ch & 1023),
                    );
                }
            }
            return str;
        };
        var UTF8ToString = (ptr, maxBytesToRead) => {
            return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
        };
        function __embind_register_std_string(rawType, name) {
            name = readLatin1String(name);
            var stdStringIsUTF8 = name === 'std::string';
            registerType(rawType, {
                name: name,
                fromWireType: function (value) {
                    var length = HEAPU32[value >> 2];
                    var payload = value + 4;
                    var str;
                    if (stdStringIsUTF8) {
                        var decodeStartPtr = payload;
                        for (var i = 0; i <= length; ++i) {
                            var currentBytePtr = payload + i;
                            if (i == length || HEAPU8[currentBytePtr] == 0) {
                                var maxRead = currentBytePtr - decodeStartPtr;
                                var stringSegment = UTF8ToString(
                                    decodeStartPtr,
                                    maxRead,
                                );
                                if (str === undefined) {
                                    str = stringSegment;
                                } else {
                                    str += String.fromCharCode(0);
                                    str += stringSegment;
                                }
                                decodeStartPtr = currentBytePtr + 1;
                            }
                        }
                    } else {
                        var a = new Array(length);
                        for (var i = 0; i < length; ++i) {
                            a[i] = String.fromCharCode(HEAPU8[payload + i]);
                        }
                        str = a.join('');
                    }
                    _free(value);
                    return str;
                },
                toWireType: function (destructors, value) {
                    if (value instanceof ArrayBuffer) {
                        value = new Uint8Array(value);
                    }
                    var length;
                    var valueIsOfTypeString = typeof value == 'string';
                    if (
                        !(
                            valueIsOfTypeString ||
                            value instanceof Uint8Array ||
                            value instanceof Uint8ClampedArray ||
                            value instanceof Int8Array
                        )
                    ) {
                        throwBindingError(
                            'Cannot pass non-string to std::string',
                        );
                    }
                    if (stdStringIsUTF8 && valueIsOfTypeString) {
                        length = lengthBytesUTF8(value);
                    } else {
                        length = value.length;
                    }
                    var base = _malloc(4 + length + 1);
                    var ptr = base + 4;
                    HEAPU32[base >> 2] = length;
                    if (stdStringIsUTF8 && valueIsOfTypeString) {
                        stringToUTF8(value, ptr, length + 1);
                    } else {
                        if (valueIsOfTypeString) {
                            for (var i = 0; i < length; ++i) {
                                var charCode = value.charCodeAt(i);
                                if (charCode > 255) {
                                    _free(ptr);
                                    throwBindingError(
                                        'String has UTF-16 code units that do not fit in 8 bits',
                                    );
                                }
                                HEAPU8[ptr + i] = charCode;
                            }
                        } else {
                            for (var i = 0; i < length; ++i) {
                                HEAPU8[ptr + i] = value[i];
                            }
                        }
                    }
                    if (destructors !== null) {
                        destructors.push(_free, base);
                    }
                    return base;
                },
                argPackAdvance: 8,
                readValueFromPointer: simpleReadValueFromPointer,
                destructorFunction: function (ptr) {
                    _free(ptr);
                },
            });
        }
        var UTF16Decoder =
            typeof TextDecoder != 'undefined'
                ? new TextDecoder('utf-16le')
                : undefined;
        var UTF16ToString = (ptr, maxBytesToRead) => {
            var endPtr = ptr;
            var idx = endPtr >> 1;
            var maxIdx = idx + maxBytesToRead / 2;
            while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
            endPtr = idx << 1;
            if (endPtr - ptr > 32 && UTF16Decoder)
                return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
            var str = '';
            for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
                var codeUnit = HEAP16[(ptr + i * 2) >> 1];
                if (codeUnit == 0) break;
                str += String.fromCharCode(codeUnit);
            }
            return str;
        };
        var stringToUTF16 = (str, outPtr, maxBytesToWrite) => {
            if (maxBytesToWrite === undefined) {
                maxBytesToWrite = 2147483647;
            }
            if (maxBytesToWrite < 2) return 0;
            maxBytesToWrite -= 2;
            var startPtr = outPtr;
            var numCharsToWrite =
                maxBytesToWrite < str.length * 2
                    ? maxBytesToWrite / 2
                    : str.length;
            for (var i = 0; i < numCharsToWrite; ++i) {
                var codeUnit = str.charCodeAt(i);
                HEAP16[outPtr >> 1] = codeUnit;
                outPtr += 2;
            }
            HEAP16[outPtr >> 1] = 0;
            return outPtr - startPtr;
        };
        var lengthBytesUTF16 = (str) => {
            return str.length * 2;
        };
        var UTF32ToString = (ptr, maxBytesToRead) => {
            var i = 0;
            var str = '';
            while (!(i >= maxBytesToRead / 4)) {
                var utf32 = HEAP32[(ptr + i * 4) >> 2];
                if (utf32 == 0) break;
                ++i;
                if (utf32 >= 65536) {
                    var ch = utf32 - 65536;
                    str += String.fromCharCode(
                        55296 | (ch >> 10),
                        56320 | (ch & 1023),
                    );
                } else {
                    str += String.fromCharCode(utf32);
                }
            }
            return str;
        };
        var stringToUTF32 = (str, outPtr, maxBytesToWrite) => {
            if (maxBytesToWrite === undefined) {
                maxBytesToWrite = 2147483647;
            }
            if (maxBytesToWrite < 4) return 0;
            var startPtr = outPtr;
            var endPtr = startPtr + maxBytesToWrite - 4;
            for (var i = 0; i < str.length; ++i) {
                var codeUnit = str.charCodeAt(i);
                if (codeUnit >= 55296 && codeUnit <= 57343) {
                    var trailSurrogate = str.charCodeAt(++i);
                    codeUnit =
                        (65536 + ((codeUnit & 1023) << 10)) |
                        (trailSurrogate & 1023);
                }
                HEAP32[outPtr >> 2] = codeUnit;
                outPtr += 4;
                if (outPtr + 4 > endPtr) break;
            }
            HEAP32[outPtr >> 2] = 0;
            return outPtr - startPtr;
        };
        var lengthBytesUTF32 = (str) => {
            var len = 0;
            for (var i = 0; i < str.length; ++i) {
                var codeUnit = str.charCodeAt(i);
                if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
                len += 4;
            }
            return len;
        };
        var __embind_register_std_wstring = function (rawType, charSize, name) {
            name = readLatin1String(name);
            var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
            if (charSize === 2) {
                decodeString = UTF16ToString;
                encodeString = stringToUTF16;
                lengthBytesUTF = lengthBytesUTF16;
                getHeap = () => HEAPU16;
                shift = 1;
            } else if (charSize === 4) {
                decodeString = UTF32ToString;
                encodeString = stringToUTF32;
                lengthBytesUTF = lengthBytesUTF32;
                getHeap = () => HEAPU32;
                shift = 2;
            }
            registerType(rawType, {
                name: name,
                fromWireType: function (value) {
                    var length = HEAPU32[value >> 2];
                    var HEAP = getHeap();
                    var str;
                    var decodeStartPtr = value + 4;
                    for (var i = 0; i <= length; ++i) {
                        var currentBytePtr = value + 4 + i * charSize;
                        if (i == length || HEAP[currentBytePtr >> shift] == 0) {
                            var maxReadBytes = currentBytePtr - decodeStartPtr;
                            var stringSegment = decodeString(
                                decodeStartPtr,
                                maxReadBytes,
                            );
                            if (str === undefined) {
                                str = stringSegment;
                            } else {
                                str += String.fromCharCode(0);
                                str += stringSegment;
                            }
                            decodeStartPtr = currentBytePtr + charSize;
                        }
                    }
                    _free(value);
                    return str;
                },
                toWireType: function (destructors, value) {
                    if (!(typeof value == 'string')) {
                        throwBindingError(
                            `Cannot pass non-string to C++ string type ${name}`,
                        );
                    }
                    var length = lengthBytesUTF(value);
                    var ptr = _malloc(4 + length + charSize);
                    HEAPU32[ptr >> 2] = length >> shift;
                    encodeString(value, ptr + 4, length + charSize);
                    if (destructors !== null) {
                        destructors.push(_free, ptr);
                    }
                    return ptr;
                },
                argPackAdvance: 8,
                readValueFromPointer: simpleReadValueFromPointer,
                destructorFunction: function (ptr) {
                    _free(ptr);
                },
            });
        };
        function __embind_register_value_array(
            rawType,
            name,
            constructorSignature,
            rawConstructor,
            destructorSignature,
            rawDestructor,
        ) {
            tupleRegistrations[rawType] = {
                name: readLatin1String(name),
                rawConstructor: embind__requireFunction(
                    constructorSignature,
                    rawConstructor,
                ),
                rawDestructor: embind__requireFunction(
                    destructorSignature,
                    rawDestructor,
                ),
                elements: [],
            };
        }
        function __embind_register_value_array_element(
            rawTupleType,
            getterReturnType,
            getterSignature,
            getter,
            getterContext,
            setterArgumentType,
            setterSignature,
            setter,
            setterContext,
        ) {
            tupleRegistrations[rawTupleType].elements.push({
                getterReturnType: getterReturnType,
                getter: embind__requireFunction(getterSignature, getter),
                getterContext: getterContext,
                setterArgumentType: setterArgumentType,
                setter: embind__requireFunction(setterSignature, setter),
                setterContext: setterContext,
            });
        }
        function __embind_register_value_object(
            rawType,
            name,
            constructorSignature,
            rawConstructor,
            destructorSignature,
            rawDestructor,
        ) {
            structRegistrations[rawType] = {
                name: readLatin1String(name),
                rawConstructor: embind__requireFunction(
                    constructorSignature,
                    rawConstructor,
                ),
                rawDestructor: embind__requireFunction(
                    destructorSignature,
                    rawDestructor,
                ),
                fields: [],
            };
        }
        function __embind_register_value_object_field(
            structType,
            fieldName,
            getterReturnType,
            getterSignature,
            getter,
            getterContext,
            setterArgumentType,
            setterSignature,
            setter,
            setterContext,
        ) {
            structRegistrations[structType].fields.push({
                fieldName: readLatin1String(fieldName),
                getterReturnType: getterReturnType,
                getter: embind__requireFunction(getterSignature, getter),
                getterContext: getterContext,
                setterArgumentType: setterArgumentType,
                setter: embind__requireFunction(setterSignature, setter),
                setterContext: setterContext,
            });
        }
        function __embind_register_void(rawType, name) {
            name = readLatin1String(name);
            registerType(rawType, {
                isVoid: true,
                name: name,
                argPackAdvance: 0,
                fromWireType: function () {
                    return undefined;
                },
                toWireType: function (destructors, o) {
                    return undefined;
                },
            });
        }
        function __emval_as(handle, returnType, destructorsRef) {
            handle = Emval.toValue(handle);
            returnType = requireRegisteredType(returnType, 'emval::as');
            var destructors = [];
            var rd = Emval.toHandle(destructors);
            HEAPU32[destructorsRef >> 2] = rd;
            return returnType['toWireType'](destructors, handle);
        }
        function emval_lookupTypes(argCount, argTypes) {
            var a = new Array(argCount);
            for (var i = 0; i < argCount; ++i) {
                a[i] = requireRegisteredType(
                    HEAPU32[(argTypes + i * 4) >> 2],
                    'parameter ' + i,
                );
            }
            return a;
        }
        function __emval_call(handle, argCount, argTypes, argv) {
            handle = Emval.toValue(handle);
            var types = emval_lookupTypes(argCount, argTypes);
            var args = new Array(argCount);
            for (var i = 0; i < argCount; ++i) {
                var type = types[i];
                args[i] = type['readValueFromPointer'](argv);
                argv += type['argPackAdvance'];
            }
            var rv = handle.apply(undefined, args);
            return Emval.toHandle(rv);
        }
        var emval_symbols = {};
        function getStringOrSymbol(address) {
            var symbol = emval_symbols[address];
            if (symbol === undefined) {
                return readLatin1String(address);
            }
            return symbol;
        }
        var emval_methodCallers = [];
        function __emval_call_void_method(caller, handle, methodName, args) {
            caller = emval_methodCallers[caller];
            handle = Emval.toValue(handle);
            methodName = getStringOrSymbol(methodName);
            caller(handle, methodName, null, args);
        }
        function emval_addMethodCaller(caller) {
            var id = emval_methodCallers.length;
            emval_methodCallers.push(caller);
            return id;
        }
        var emval_registeredMethods = [];
        function __emval_get_method_caller(argCount, argTypes) {
            var types = emval_lookupTypes(argCount, argTypes);
            var retType = types[0];
            var signatureName =
                retType.name +
                '_$' +
                types
                    .slice(1)
                    .map(function (t) {
                        return t.name;
                    })
                    .join('_') +
                '$';
            var returnId = emval_registeredMethods[signatureName];
            if (returnId !== undefined) {
                return returnId;
            }
            var params = ['retType'];
            var args = [retType];
            var argsList = '';
            for (var i = 0; i < argCount - 1; ++i) {
                argsList += (i !== 0 ? ', ' : '') + 'arg' + i;
                params.push('argType' + i);
                args.push(types[1 + i]);
            }
            var functionName = makeLegalFunctionName(
                'methodCaller_' + signatureName,
            );
            var functionBody =
                'return function ' +
                functionName +
                '(handle, name, destructors, args) {\n';
            var offset = 0;
            for (var i = 0; i < argCount - 1; ++i) {
                functionBody +=
                    '    var arg' +
                    i +
                    ' = argType' +
                    i +
                    '.readValueFromPointer(args' +
                    (offset ? '+' + offset : '') +
                    ');\n';
                offset += types[i + 1]['argPackAdvance'];
            }
            functionBody += '    var rv = handle[name](' + argsList + ');\n';
            for (var i = 0; i < argCount - 1; ++i) {
                if (types[i + 1]['deleteObject']) {
                    functionBody +=
                        '    argType' + i + '.deleteObject(arg' + i + ');\n';
                }
            }
            if (!retType.isVoid) {
                functionBody +=
                    '    return retType.toWireType(destructors, rv);\n';
            }
            functionBody += '};\n';
            params.push(functionBody);
            var invokerFunction = newFunc(Function, params).apply(null, args);
            returnId = emval_addMethodCaller(invokerFunction);
            emval_registeredMethods[signatureName] = returnId;
            return returnId;
        }
        function __emval_incref(handle) {
            if (handle > 4) {
                emval_handles.get(handle).refcount += 1;
            }
        }
        function __emval_new_array() {
            return Emval.toHandle([]);
        }
        function __emval_run_destructors(handle) {
            var destructors = Emval.toValue(handle);
            runDestructors(destructors);
            __emval_decref(handle);
        }
        var _abort = () => {
            abort('');
        };
        var abortOnCannotGrowMemory = (requestedSize) => {
            abort('OOM');
        };
        var _emscripten_resize_heap = (requestedSize) => {
            var oldSize = HEAPU8.length;
            requestedSize = requestedSize >>> 0;
            abortOnCannotGrowMemory(requestedSize);
        };
        var ENV = {};
        var getExecutableName = () => {
            return thisProgram || './this.program';
        };
        var getEnvStrings = () => {
            if (!getEnvStrings.strings) {
                var lang =
                    (
                        (typeof navigator == 'object' &&
                            navigator.languages &&
                            navigator.languages[0]) ||
                        'C'
                    ).replace('-', '_') + '.UTF-8';
                var env = {
                    USER: 'web_user',
                    LOGNAME: 'web_user',
                    PATH: '/',
                    PWD: '/',
                    HOME: '/home/web_user',
                    LANG: lang,
                    _: getExecutableName(),
                };
                for (var x in ENV) {
                    if (ENV[x] === undefined) delete env[x];
                    else env[x] = ENV[x];
                }
                var strings = [];
                for (var x in env) {
                    strings.push(`${x}=${env[x]}`);
                }
                getEnvStrings.strings = strings;
            }
            return getEnvStrings.strings;
        };
        var stringToAscii = (str, buffer) => {
            for (var i = 0; i < str.length; ++i) {
                HEAP8[buffer++ >> 0] = str.charCodeAt(i);
            }
            HEAP8[buffer >> 0] = 0;
        };
        var SYSCALLS = {
            varargs: undefined,
            get: function () {
                SYSCALLS.varargs += 4;
                var ret = HEAP32[(SYSCALLS.varargs - 4) >> 2];
                return ret;
            },
            getStr: function (ptr) {
                var ret = UTF8ToString(ptr);
                return ret;
            },
        };
        var _environ_get = (__environ, environ_buf) => {
            var bufSize = 0;
            getEnvStrings().forEach(function (string, i) {
                var ptr = environ_buf + bufSize;
                HEAPU32[(__environ + i * 4) >> 2] = ptr;
                stringToAscii(string, ptr);
                bufSize += string.length + 1;
            });
            return 0;
        };
        var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
            var strings = getEnvStrings();
            HEAPU32[penviron_count >> 2] = strings.length;
            var bufSize = 0;
            strings.forEach(function (string) {
                bufSize += string.length + 1;
            });
            HEAPU32[penviron_buf_size >> 2] = bufSize;
            return 0;
        };
        var initRandomFill = () => {
            if (
                typeof crypto == 'object' &&
                typeof crypto['getRandomValues'] == 'function'
            ) {
                return (view) => crypto.getRandomValues(view);
            } else abort('initRandomDevice');
        };
        var randomFill = (view) => {
            return (randomFill = initRandomFill())(view);
        };
        var _getentropy = (buffer, size) => {
            randomFill(HEAPU8.subarray(buffer, buffer + size));
            return 0;
        };
        var isLeapYear = (year) => {
            return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
        };
        var arraySum = (array, index) => {
            var sum = 0;
            for (var i = 0; i <= index; sum += array[i++]) {}
            return sum;
        };
        var MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var MONTH_DAYS_REGULAR = [
            31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
        ];
        var addDays = (date, days) => {
            var newDate = new Date(date.getTime());
            while (days > 0) {
                var leap = isLeapYear(newDate.getFullYear());
                var currentMonth = newDate.getMonth();
                var daysInCurrentMonth = (
                    leap ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR
                )[currentMonth];
                if (days > daysInCurrentMonth - newDate.getDate()) {
                    days -= daysInCurrentMonth - newDate.getDate() + 1;
                    newDate.setDate(1);
                    if (currentMonth < 11) {
                        newDate.setMonth(currentMonth + 1);
                    } else {
                        newDate.setMonth(0);
                        newDate.setFullYear(newDate.getFullYear() + 1);
                    }
                } else {
                    newDate.setDate(newDate.getDate() + days);
                    return newDate;
                }
            }
            return newDate;
        };
        function intArrayFromString(stringy, dontAddNull, length) {
            var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
            var u8array = new Array(len);
            var numBytesWritten = stringToUTF8Array(
                stringy,
                u8array,
                0,
                u8array.length,
            );
            if (dontAddNull) u8array.length = numBytesWritten;
            return u8array;
        }
        var writeArrayToMemory = (array, buffer) => {
            HEAP8.set(array, buffer);
        };
        var _strftime = (s, maxsize, format, tm) => {
            var tm_zone = HEAP32[(tm + 40) >> 2];
            var date = {
                tm_sec: HEAP32[tm >> 2],
                tm_min: HEAP32[(tm + 4) >> 2],
                tm_hour: HEAP32[(tm + 8) >> 2],
                tm_mday: HEAP32[(tm + 12) >> 2],
                tm_mon: HEAP32[(tm + 16) >> 2],
                tm_year: HEAP32[(tm + 20) >> 2],
                tm_wday: HEAP32[(tm + 24) >> 2],
                tm_yday: HEAP32[(tm + 28) >> 2],
                tm_isdst: HEAP32[(tm + 32) >> 2],
                tm_gmtoff: HEAP32[(tm + 36) >> 2],
                tm_zone: tm_zone ? UTF8ToString(tm_zone) : '',
            };
            var pattern = UTF8ToString(format);
            var EXPANSION_RULES_1 = {
                '%c': '%a %b %d %H:%M:%S %Y',
                '%D': '%m/%d/%y',
                '%F': '%Y-%m-%d',
                '%h': '%b',
                '%r': '%I:%M:%S %p',
                '%R': '%H:%M',
                '%T': '%H:%M:%S',
                '%x': '%m/%d/%y',
                '%X': '%H:%M:%S',
                '%Ec': '%c',
                '%EC': '%C',
                '%Ex': '%m/%d/%y',
                '%EX': '%H:%M:%S',
                '%Ey': '%y',
                '%EY': '%Y',
                '%Od': '%d',
                '%Oe': '%e',
                '%OH': '%H',
                '%OI': '%I',
                '%Om': '%m',
                '%OM': '%M',
                '%OS': '%S',
                '%Ou': '%u',
                '%OU': '%U',
                '%OV': '%V',
                '%Ow': '%w',
                '%OW': '%W',
                '%Oy': '%y',
            };
            for (var rule in EXPANSION_RULES_1) {
                pattern = pattern.replace(
                    new RegExp(rule, 'g'),
                    EXPANSION_RULES_1[rule],
                );
            }
            var WEEKDAYS = [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
            ];
            var MONTHS = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
            ];
            function leadingSomething(value, digits, character) {
                var str =
                    typeof value == 'number' ? value.toString() : value || '';
                while (str.length < digits) {
                    str = character[0] + str;
                }
                return str;
            }
            function leadingNulls(value, digits) {
                return leadingSomething(value, digits, '0');
            }
            function compareByDay(date1, date2) {
                function sgn(value) {
                    return value < 0 ? -1 : value > 0 ? 1 : 0;
                }
                var compare;
                if (
                    (compare = sgn(
                        date1.getFullYear() - date2.getFullYear(),
                    )) === 0
                ) {
                    if (
                        (compare = sgn(date1.getMonth() - date2.getMonth())) ===
                        0
                    ) {
                        compare = sgn(date1.getDate() - date2.getDate());
                    }
                }
                return compare;
            }
            function getFirstWeekStartDate(janFourth) {
                switch (janFourth.getDay()) {
                    case 0:
                        return new Date(janFourth.getFullYear() - 1, 11, 29);
                    case 1:
                        return janFourth;
                    case 2:
                        return new Date(janFourth.getFullYear(), 0, 3);
                    case 3:
                        return new Date(janFourth.getFullYear(), 0, 2);
                    case 4:
                        return new Date(janFourth.getFullYear(), 0, 1);
                    case 5:
                        return new Date(janFourth.getFullYear() - 1, 11, 31);
                    case 6:
                        return new Date(janFourth.getFullYear() - 1, 11, 30);
                }
            }
            function getWeekBasedYear(date) {
                var thisDate = addDays(
                    new Date(date.tm_year + 1900, 0, 1),
                    date.tm_yday,
                );
                var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
                var janFourthNextYear = new Date(
                    thisDate.getFullYear() + 1,
                    0,
                    4,
                );
                var firstWeekStartThisYear =
                    getFirstWeekStartDate(janFourthThisYear);
                var firstWeekStartNextYear =
                    getFirstWeekStartDate(janFourthNextYear);
                if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
                    if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
                        return thisDate.getFullYear() + 1;
                    }
                    return thisDate.getFullYear();
                }
                return thisDate.getFullYear() - 1;
            }
            var EXPANSION_RULES_2 = {
                '%a': (date) => WEEKDAYS[date.tm_wday].substring(0, 3),
                '%A': (date) => WEEKDAYS[date.tm_wday],
                '%b': (date) => MONTHS[date.tm_mon].substring(0, 3),
                '%B': (date) => MONTHS[date.tm_mon],
                '%C': (date) => {
                    var year = date.tm_year + 1900;
                    return leadingNulls((year / 100) | 0, 2);
                },
                '%d': (date) => leadingNulls(date.tm_mday, 2),
                '%e': (date) => leadingSomething(date.tm_mday, 2, ' '),
                '%g': (date) => {
                    return getWeekBasedYear(date).toString().substring(2);
                },
                '%G': (date) => getWeekBasedYear(date),
                '%H': (date) => leadingNulls(date.tm_hour, 2),
                '%I': (date) => {
                    var twelveHour = date.tm_hour;
                    if (twelveHour == 0) twelveHour = 12;
                    else if (twelveHour > 12) twelveHour -= 12;
                    return leadingNulls(twelveHour, 2);
                },
                '%j': (date) => {
                    return leadingNulls(
                        date.tm_mday +
                            arraySum(
                                isLeapYear(date.tm_year + 1900)
                                    ? MONTH_DAYS_LEAP
                                    : MONTH_DAYS_REGULAR,
                                date.tm_mon - 1,
                            ),
                        3,
                    );
                },
                '%m': (date) => leadingNulls(date.tm_mon + 1, 2),
                '%M': (date) => leadingNulls(date.tm_min, 2),
                '%n': () => '\n',
                '%p': (date) => {
                    if (date.tm_hour >= 0 && date.tm_hour < 12) {
                        return 'AM';
                    }
                    return 'PM';
                },
                '%S': (date) => leadingNulls(date.tm_sec, 2),
                '%t': () => '\t',
                '%u': (date) => date.tm_wday || 7,
                '%U': (date) => {
                    var days = date.tm_yday + 7 - date.tm_wday;
                    return leadingNulls(Math.floor(days / 7), 2);
                },
                '%V': (date) => {
                    var val = Math.floor(
                        (date.tm_yday + 7 - ((date.tm_wday + 6) % 7)) / 7,
                    );
                    if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
                        val++;
                    }
                    if (!val) {
                        val = 52;
                        var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
                        if (
                            dec31 == 4 ||
                            (dec31 == 5 && isLeapYear((date.tm_year % 400) - 1))
                        ) {
                            val++;
                        }
                    } else if (val == 53) {
                        var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
                        if (
                            jan1 != 4 &&
                            (jan1 != 3 || !isLeapYear(date.tm_year))
                        )
                            val = 1;
                    }
                    return leadingNulls(val, 2);
                },
                '%w': (date) => date.tm_wday,
                '%W': (date) => {
                    var days = date.tm_yday + 7 - ((date.tm_wday + 6) % 7);
                    return leadingNulls(Math.floor(days / 7), 2);
                },
                '%y': (date) => {
                    return (date.tm_year + 1900).toString().substring(2);
                },
                '%Y': (date) => date.tm_year + 1900,
                '%z': (date) => {
                    var off = date.tm_gmtoff;
                    var ahead = off >= 0;
                    off = Math.abs(off) / 60;
                    off = (off / 60) * 100 + (off % 60);
                    return (ahead ? '+' : '-') + String('0000' + off).slice(-4);
                },
                '%Z': (date) => date.tm_zone,
                '%%': () => '%',
            };
            pattern = pattern.replace(/%%/g, '\0\0');
            for (var rule in EXPANSION_RULES_2) {
                if (pattern.includes(rule)) {
                    pattern = pattern.replace(
                        new RegExp(rule, 'g'),
                        EXPANSION_RULES_2[rule](date),
                    );
                }
            }
            pattern = pattern.replace(/\0\0/g, '%');
            var bytes = intArrayFromString(pattern, false);
            if (bytes.length > maxsize) {
                return 0;
            }
            writeArrayToMemory(bytes, s);
            return bytes.length - 1;
        };
        var _strftime_l = (s, maxsize, format, tm, loc) => {
            return _strftime(s, maxsize, format, tm);
        };
        InternalError = Module['InternalError'] = extendError(
            Error,
            'InternalError',
        );
        embind_init_charCodes();
        BindingError = Module['BindingError'] = extendError(
            Error,
            'BindingError',
        );
        init_ClassHandle();
        init_embind();
        init_RegisteredPointer();
        UnboundTypeError = Module['UnboundTypeError'] = extendError(
            Error,
            'UnboundTypeError',
        );
        init_emval();
        var wasmImports = {
            t: __embind_finalize_value_array,
            j: __embind_finalize_value_object,
            x: __embind_register_bigint,
            E: __embind_register_bool,
            i: __embind_register_class,
            D: __embind_register_emval,
            G: __embind_register_enum,
            a: __embind_register_enum_value,
            q: __embind_register_float,
            e: __embind_register_function,
            h: __embind_register_integer,
            c: __embind_register_memory_view,
            r: __embind_register_std_string,
            m: __embind_register_std_wstring,
            v: __embind_register_value_array,
            u: __embind_register_value_array_element,
            s: __embind_register_value_object,
            g: __embind_register_value_object_field,
            F: __embind_register_void,
            w: __emval_as,
            f: __emval_call,
            p: __emval_call_void_method,
            b: __emval_decref,
            o: __emval_get_method_caller,
            d: __emval_incref,
            k: __emval_new_array,
            n: __emval_run_destructors,
            l: _abort,
            C: _emscripten_resize_heap,
            A: _environ_get,
            B: _environ_sizes_get,
            y: _getentropy,
            z: _strftime_l,
        };
        var asm = createWasm();
        var ___wasm_call_ctors = function () {
            return (___wasm_call_ctors = Module['asm']['I']).apply(
                null,
                arguments,
            );
        };
        var _malloc = function () {
            return (_malloc = Module['asm']['J']).apply(null, arguments);
        };
        var _free = function () {
            return (_free = Module['asm']['K']).apply(null, arguments);
        };
        var ___getTypeName = function () {
            return (___getTypeName = Module['asm']['L']).apply(null, arguments);
        };
        var __embind_initialize_bindings = (Module[
            '__embind_initialize_bindings'
        ] = function () {
            return (__embind_initialize_bindings = Module[
                '__embind_initialize_bindings'
            ] =
                Module['asm']['M']).apply(null, arguments);
        });
        var ___errno_location = function () {
            return (___errno_location =
                Module['asm']['__errno_location']).apply(null, arguments);
        };
        var ___trap = function () {
            return (___trap = Module['asm']['O']).apply(null, arguments);
        };
        var dynCall_viijii = (Module['dynCall_viijii'] = function () {
            return (dynCall_viijii = Module['dynCall_viijii'] =
                Module['asm']['P']).apply(null, arguments);
        });
        var dynCall_iiiiij = (Module['dynCall_iiiiij'] = function () {
            return (dynCall_iiiiij = Module['dynCall_iiiiij'] =
                Module['asm']['Q']).apply(null, arguments);
        });
        var dynCall_iiiiijj = (Module['dynCall_iiiiijj'] = function () {
            return (dynCall_iiiiijj = Module['dynCall_iiiiijj'] =
                Module['asm']['R']).apply(null, arguments);
        });
        var dynCall_iiiiiijj = (Module['dynCall_iiiiiijj'] = function () {
            return (dynCall_iiiiiijj = Module['dynCall_iiiiiijj'] =
                Module['asm']['S']).apply(null, arguments);
        });
        var calledRun;
        dependenciesFulfilled = function runCaller() {
            if (!calledRun) run();
            if (!calledRun) dependenciesFulfilled = runCaller;
        };
        function run() {
            if (runDependencies > 0) {
                return;
            }
            preRun();
            if (runDependencies > 0) {
                return;
            }
            function doRun() {
                if (calledRun) return;
                calledRun = true;
                Module['calledRun'] = true;
                if (ABORT) return;
                initRuntime();
                readyPromiseResolve(Module);
                if (Module['onRuntimeInitialized'])
                    Module['onRuntimeInitialized']();
                postRun();
            }
            if (Module['setStatus']) {
                Module['setStatus']('Running...');
                setTimeout(function () {
                    setTimeout(function () {
                        Module['setStatus']('');
                    }, 1);
                    doRun();
                }, 1);
            } else {
                doRun();
            }
        }
        if (Module['preInit']) {
            if (typeof Module['preInit'] == 'function')
                Module['preInit'] = [Module['preInit']];
            while (Module['preInit'].length > 0) {
                Module['preInit'].pop()();
            }
        }
        run();

        return moduleArg.ready;
    };
})();
if (typeof exports === 'object' && typeof module === 'object')
    module.exports = CalcManager;
else if (typeof define === 'function' && define['amd'])
    define([], function () {
        return CalcManager;
    });
else if (typeof exports === 'object') exports['CalcManager'] = CalcManager;
