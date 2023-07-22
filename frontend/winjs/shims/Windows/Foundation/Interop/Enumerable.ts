export function Enumerable(enumerable: boolean) {
    return function (originalMethod: any, context: ClassGetterDecoratorContext | ClassSetterDecoratorContext) {
        const methodName = String(context.name);

        context.addInitializer(function () {
            Object.defineProperty(this, methodName, {
                get: function () {
                    return originalMethod.call(this);
                },
                set: function (value: any) {
                    if (enumerable) {
                        Object.defineProperty(this, methodName, {
                            value,
                            writable: true,
                            enumerable: true,
                            configurable: true
                        });
                    }
                    else {
                        originalMethod.call(this, value);
                    }
                },
                enumerable: enumerable,
                configurable: true
            });
        });
    }
}