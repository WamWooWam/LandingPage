
export type calc_display_t = {};
export type calc_expression_command_t = {};
export type calc_manager_t = {};
export type calc_resource_provider_t = {};

export interface calc_display_callbacks_t {
    set_primary_display: (pszText: string, isError: boolean) => void;
    set_is_in_error: (isInError: boolean) => void;
    set_expression_display: (tokens: [string, number][], commands: []) => void;
    set_parenthesis_number: (count: number) => void;
    on_no_right_paren_added: () => void;
    max_digits_reached: () => void;
    binary_operator_received: () => void;
    on_history_item_added: (index: number) => void;
    set_memorized_numbers: (memorizedNumbers: string[]) => void;
    memory_item_changed: (index: number) => void;
    input_changed: () => void;
}

export interface calc_resource_provider_callbacks_t {
    get_cengine_string: (id: string) => string;
}

declare namespace CalcManager {
    type HRESULT = number;

    function calc_display_create(callbacks: calc_display_callbacks_t): calc_display_t;
    function calc_resource_provider_create(callbacks: calc_resource_provider_callbacks_t): calc_resource_provider_t;
    function calc_manager_create(display: calc_display_t, resources: calc_resource_provider_t): calc_manager_t;
    function calc_manager_delete(calc_manager: calc_manager_t): void;
    function calc_manager_reset(manager: calc_manager_t, clearMemory: boolean): HRESULT;

    enum Command {
        DEG = 321,
        RAD = 322,
        GRAD = 323,
        Degrees = 324,
        HYP = 325,
        NULL = 0,
        SIGN = 80,
        CLEAR = 81,
        CENTR = 82,
        BACK = 83,
        PNT = 84,
        Xor = 88,
        LSHF = 89,
        RSHF = 90,
        DIV = 91,
        MUL = 92,
        ADD = 93,
        SUB = 94,
        MOD = 95,
        ROOT = 96,
        PWR = 97,
        CHOP = 98,
        ROL = 99,
        ROR = 100,
        COM = 101,
        SIN = 102,
        COS = 103,
        TAN = 104,
        SINH = 105,
        COSH = 106,
        TANH = 107,
        LN = 108,
        LOG = 109,
        SQRT = 110,
        SQR = 111,
        CUB = 112,
        FAC = 113,
        REC = 114,
        DMS = 115,
        CUBEROOT = 116, // x ^ 1/3
        POW10 = 117,    // 10 ^ x
        PERCENT = 118,
        FE = 119,
        PI = 120,
        EQU = 121,
        MCLEAR = 122,
        RECALL = 123,
        STORE = 124,
        MPLUS = 125,
        MMINUS = 126,
        EXP = 127,
        OPENP = 128,
        CLOSEP = 129,
        Num0 = 130, // The controls for 0 through F must be consecutive and in order
        Num1 = 131,
        Num2 = 132,
        Num3 = 133,
        Num4 = 134,
        Num5 = 135,
        Num6 = 136,
        Num7 = 137,
        Num8 = 138,
        Num9 = 139,
        NumA = 140,
        NumB = 141,
        NumC = 142,
        NumD = 143,
        NumE = 144,
        NumF = 145, // this is last control ID which must match the string table
        INV = 146,
        SET_RESULT = 147,
        SEC = 400,
        ASEC = 401,
        CSC = 402,
        ACSC = 403,
        COT = 404,
        ACOT = 405,
        SECH = 406,
        ASECH = 407,
        CSCH = 408,
        ACSCH = 409,
        COTH = 410,
        ACOTH = 411,
        POW2 = 412, // 2 ^ x
        Abs = 413,
        Floor = 414,
        Ceil = 415,
        ROLC = 416,
        RORC = 417,
        LogBaseY = 500,
        Nand = 501,
        Nor = 502,
        RSHFL = 505,
        Rand = 600,
        Euler = 601,
        And = 86,
        OR = 87,
        Not = 101,
        ModeBasic = 200,
        ModeScientific = 201,
        ASIN = 202,
        ACOS = 203,
        ATAN = 204,
        POWE = 205,
        ASINH = 206,
        ACOSH = 207,
        ATANH = 208,
        ModeProgrammer = 209,
        Hex = 313,
        Dec = 314,
        Oct = 315,
        Bin = 316,
        Qword = 317,
        Dword = 318,
        Word = 319,
        Byte = 320,
        BINEDITSTART = 700,
        BINPOS0 = 700,
        BINPOS1 = 701,
        BINPOS2 = 702,
        BINPOS3 = 703,
        BINPOS4 = 704,
        BINPOS5 = 705,
        BINPOS6 = 706,
        BINPOS7 = 707,
        BINPOS8 = 708,
        BINPOS9 = 709,
        BINPOS10 = 710,
        BINPOS11 = 711,
        BINPOS12 = 712,
        BINPOS13 = 713,
        BINPOS14 = 714,
        BINPOS15 = 715,
        BINPOS16 = 716,
        BINPOS17 = 717,
        BINPOS18 = 718,
        BINPOS19 = 719,
        BINPOS20 = 720,
        BINPOS21 = 721,
        BINPOS22 = 722,
        BINPOS23 = 723,
        BINPOS24 = 724,
        BINPOS25 = 725,
        BINPOS26 = 726,
        BINPOS27 = 727,
        BINPOS28 = 728,
        BINPOS29 = 729,
        BINPOS30 = 730,
        BINPOS31 = 731,
        BINPOS32 = 732,
        BINPOS33 = 733,
        BINPOS34 = 734,
        BINPOS35 = 735,
        BINPOS36 = 736,
        BINPOS37 = 737,
        BINPOS38 = 738,
        BINPOS39 = 739,
        BINPOS40 = 740,
        BINPOS41 = 741,
        BINPOS42 = 742,
        BINPOS43 = 743,
        BINPOS44 = 744,
        BINPOS45 = 745,
        BINPOS46 = 746,
        BINPOS47 = 747,
        BINPOS48 = 748,
        BINPOS49 = 749,
        BINPOS50 = 750,
        BINPOS51 = 751,
        BINPOS52 = 752,
        BINPOS53 = 753,
        BINPOS54 = 754,
        BINPOS55 = 755,
        BINPOS56 = 756,
        BINPOS57 = 757,
        BINPOS58 = 758,
        BINPOS59 = 759,
        BINPOS60 = 760,
        BINPOS61 = 761,
        BINPOS62 = 762,
        BINPOS63 = 763,
        BINEDITEND = 763
    }

    function calc_manager_set_standard_mode(manager: calc_manager_t): HRESULT;
    function calc_manager_set_scientific_mode(manager: calc_manager_t): HRESULT;
    function calc_manager_set_programmer_mode(manager: calc_manager_t): HRESULT;
    function calc_manager_send_command(manager: calc_manager_t, command: Command): HRESULT;
    function calc_manager_memorize_number(manager: calc_manager_t): HRESULT;
    function calc_manager_memorized_number_load(manager: calc_manager_t, index: number): HRESULT;
    function calc_manager_memorized_number_add(manager: calc_manager_t, index: number): HRESULT;
    function calc_manager_memorized_number_subtract(manager: calc_manager_t, index: number): HRESULT;
    function calc_manager_memorized_number_clear(manager: calc_manager_t, index: number): HRESULT;
    function calc_manager_memorized_number_clear_all(manager: calc_manager_t): HRESULT;
}

export default function Initialize(opts: any): Promise<typeof CalcManager>