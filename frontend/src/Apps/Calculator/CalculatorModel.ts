import { Signal } from '@preact/signals';
import {
    CalcManager,
    calc_display_t,
    calc_manager_t,
    calc_resource_provider_t,
} from './CalcManager/CalcManager';
import CalcManagerStrings from './CalcManager/en-US/strings.json';
import { CreateButtonMap } from './CalculatorButtonMap';

function getSeparator(separatorType: Intl.NumberFormatPartTypes) {
    const num = 10000.1;
    return Intl.NumberFormat()
        .formatToParts(num)
        .find((part) => part.type === separatorType).value;
}

export default class CalculatorModel {
    private root: typeof CalcManager;
    private resourceLoader: calc_resource_provider_t;
    private display: calc_display_t;
    private manager: calc_manager_t;

    private buttons: any;

    constructor(root: typeof CalcManager) {
        this.onButtonClicked = this.onButtonClicked.bind(this);
        this.buttons = CreateButtonMap(root);

        this.root = root;
        this.resourceLoader = root.calc_resource_provider_create({
            get_cengine_string: (id: string) => {
                switch (id) {
                    case 'sDecimal':
                        return getSeparator('decimal');
                    case 'sThousand':
                        return getSeparator('group');
                    case 'sGrouping':
                        return '3;0'; // TODO: this needs to come from the current locale
                    default:
                        if (!CalcManagerStrings.hasOwnProperty(id)) return id;
                        return CalcManagerStrings[
                            id as keyof typeof CalcManagerStrings
                        ];
                }
            },
        });

        const display_callbacks = {
            set_primary_display: this.setPrimaryDisplay.bind(this),
            set_is_in_error: this.setIsInError.bind(this),
            set_expression_display: this.setExpressionDisplay.bind(this),
            set_parenthesis_number: this.setParenthesisNumber.bind(this),
            on_no_right_paren_added: this.onNoRightParenAdded.bind(this),
            max_digits_reached: this.onMaxDigitsReached.bind(this),
            binary_operator_received: this.onBinaryOperatorReceived.bind(this),
            on_history_item_added: this.onMemoryItemChanged.bind(this),
            set_memorized_numbers: this.setMemorizedNumbers.bind(this),
            memory_item_changed: this.onMemoryItemChanged.bind(this),
            input_changed: this.onInputChanged.bind(this),
        };

        this.display = root.calc_display_create(display_callbacks);
        this.manager = root.calc_manager_create(
            this.display,
            this.resourceLoader,
        );
    }

    result: Signal<string> = new Signal();
    expression: Signal<string> = new Signal();

    setPrimaryDisplay(text: string, isError: boolean) {
        console.log('set_primary_display', text, isError);
        this.result.value = text;
    }

    setIsInError(isInError: boolean) {
        console.log('set_is_in_error', isInError);
    }

    setExpressionDisplay(tokens: [string, number][], commands: []) {
        console.log('set_expression_display', tokens, commands);
        let expression = '\u200B';
        for (let i = 0; i < tokens.length; i++) {
            if (i > 0 && tokens[i][0] !== ' ') expression += ' ';
            expression += tokens[i][0];
        }
        this.expression.value = expression;
    }

    setParenthesisNumber(count: number) {
        console.log('set_parenthesis_number', count);
    }

    setMemorizedNumbers(numbers: string[]) {
        console.log('set_memorized_numbers', numbers);
    }

    onNoRightParenAdded() {
        console.log('on_no_right_paren_added');
    }

    onMaxDigitsReached() {
        console.log('max_digits_reached');
    }

    onBinaryOperatorReceived() {
        console.log('binary_operator_received');
    }

    onHistoryItemAdded(addedItemIndex: number) {
        console.log('on_history_item_added', addedItemIndex);
    }

    onMemoryItemChanged(index: number) {
        console.log('memory_item_changed', index);
    }

    onInputChanged() {
        console.log('input_changed');
    }

    onButtonClicked(buttonId: string) {
        let command = this.buttons[buttonId];
        if (command === undefined) {
            console.log('Unknown button', buttonId);
            return;
        }
        console.log('on_button_clicked', buttonId, command);
        this.root.calc_manager_send_command(this.manager, command);
    }

    onKeyUp(event: KeyboardEvent) {
        const keyCommandMap = {
            '0': this.root.Command.Num0,
            '1': this.root.Command.Num1,
            '2': this.root.Command.Num2,
            '3': this.root.Command.Num3,
            '4': this.root.Command.Num4,
            '5': this.root.Command.Num5,
            '6': this.root.Command.Num6,
            '7': this.root.Command.Num7,
            '8': this.root.Command.Num8,
            '9': this.root.Command.Num9,
            '.': this.root.Command.PNT,
            '+': this.root.Command.ADD,
            '-': this.root.Command.SUB,
            '*': this.root.Command.MUL,
            '/': this.root.Command.DIV,
            '=': this.root.Command.EQU,
            enter: this.root.Command.EQU,
            return: this.root.Command.EQU,
            backspace: this.root.Command.BACK,
            delete: this.root.Command.CLEAR,
            escape: this.root.Command.CLEAR,
        };

        console.log(event.key.toLowerCase());

        const command =
            keyCommandMap[
                event.key.toLowerCase() as keyof typeof keyCommandMap
            ];
        if (command !== undefined) {
            this.root.calc_manager_send_command(this.manager, command);
        }
    }

    reset() {
        this.root.calc_manager_reset(this.manager, true);
    }
}
