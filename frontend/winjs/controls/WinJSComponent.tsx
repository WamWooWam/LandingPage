import { Component, ComponentChildren, Ref, h } from "preact";
import { JSXInternal } from "preact/src/jsx";

interface IControl {
    dispose(): void;
}

type ComponentProps<TSelf, T extends IControl>
    = { [P in keyof T]?: T[P]; } & { children?: ComponentChildren; ref?: Ref<TSelf> };

type ComponentPropsWithElement<TSelf, T extends IControl, E extends keyof HTMLElementTagNameMap>
    = ComponentProps<TSelf, T> & Omit<JSXInternal.HTMLAttributes<HTMLElementTagNameMap[E]>, "ref" | "icon">;

type ComponentState<T extends IControl> = {
    control?: T;
}

export default abstract class WinJSComponent<
    TSelf extends WinJSComponent<TSelf, E, T, P, S>,
    E extends IControl,
    T extends keyof HTMLElementTagNameMap,
    P = ComponentPropsWithElement<TSelf, E, T>,
    S extends ComponentState<E> = { control?: E }
> extends Component<P, S> {

    private tagName: T;
    constructor(props: P, tagName: T) {
        super(props);
        this.tagName = tagName;
        this.state = {} as S;
    }

    shouldComponentUpdate(): boolean {
        return false;
    }

    componentDidMount(): void {
        let control = this.createControl(this.base as HTMLElementTagNameMap[T]);
        this.setState({ control: control });
    }

    componentWillUnmount(): void {
        this.state.control.dispose();
    }

    componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
        if (this.state.control === undefined) return;

        const updateProps = (propName: keyof P & keyof E) => {
            if (this.props[propName] !== nextProps[propName])
                this.state.control[propName] = nextProps[propName] as any;
        };


        for (let propName in this.props)
            updateProps(propName as keyof P & keyof E);
    }

    render() {
        return h(this.tagName, this.props as any, this.props.children);
    }

    get control(): E {
        return this.state.control;
    }

    abstract createControl(element: HTMLElementTagNameMap[T]): E;
}