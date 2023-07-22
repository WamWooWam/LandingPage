export function GenerateShim(name: string) {
    return function (value: Function, context: ClassDecoratorContext) {
        if (context.kind === 'class') {
            if (!value.toString) {
                value.toString = () => `[object ${name}]`;
            }
        }
    }
}