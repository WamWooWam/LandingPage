import { Component, createContext } from "preact";
import { CalculatorButton } from "./CalculatorButton";
import { CalcManager } from "./CalcManager/CalcManager";
import CalculatorModel from "./CalculatorModel";
import { AutoTextSize } from 'auto-text-size'
import ViewBox from "./ViewBox";
import CalculatorNavBar from "./CalculatorNavBar";
import Calculator from "./Calculator";
import Memory from "./Memory";


type MainPageProps = {
    model: CalculatorModel;
}

export const ViewModelContext = createContext<CalculatorModel>(null)

export default class MainPage extends Component<MainPageProps, { result: string }> {
    componentDidMount(): void {
        this.props.model.reset();
        document.addEventListener("keydown", this.onKeyUp.bind(this));
    }

    componentWillUnmount(): void {
        document.removeEventListener("keydown", this.onKeyUp.bind(this));
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