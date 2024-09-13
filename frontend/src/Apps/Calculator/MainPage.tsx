import { Component, createContext } from "preact";

import { AutoTextSize } from 'auto-text-size'
import { CalcManager } from "./CalcManager/CalcManager";
import Calculator from "./Calculator";
import { CalculatorButton } from "./CalculatorButton";
import CalculatorModel from "./CalculatorModel";
import CalculatorNavBar from "./CalculatorNavBar";
import Memory from "./Memory";
import ViewBox from "./ViewBox";

type MainPageProps = {
    model: CalculatorModel;
}

export const ViewModelContext = createContext<CalculatorModel>(null)

export default class MainPage extends Component<MainPageProps, { result: string }> {

    constructor(props: MainPageProps) {
        super(props);
        this.onKeyUp = this.onKeyUp.bind(this);
    }

    componentDidMount(): void {
        this.props.model.reset();
        document.addEventListener("keydown", this.onKeyUp);
    }

    componentWillUnmount(): void {
        document.removeEventListener("keydown", this.onKeyUp);
    }

    onKeyUp(e: KeyboardEvent): void {
        this.props.model.onKeyUp(e);
    }

    render() {
        return (
            <ViewModelContext.Provider value={this.props.model}>
                <div class="calc-root">
                    <ViewBox>
                        <div class="calc-grid">
                            <CalculatorNavBar />
                            <div class="calc-panel">
                                <Calculator/>
                                <Memory />
                            </div>
                        </div>
                    </ViewBox>
                </div>
            </ViewModelContext.Provider>
        );
    }
}