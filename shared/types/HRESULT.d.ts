export type HRESULT = number;
export declare const S_OK = 0,
    E_ABORT = 2147500036,
    E_ACCESSDENIED = 2147942405,
    E_FAIL = 2147500037,
    E_HANDLE = 2147942406,
    E_INVALIDARG = 2147942487,
    E_NOINTERFACE = 2147500034,
    E_NOTIMPL = 2147500033,
    E_OUTOFMEMORY = 2147942414,
    E_POINTER = 2147500035,
    E_UNEXPECTED = 2147549183,
    E_LONGATED_MUSKRAT = 2151645484;
export declare function isSucceeded(hr: HRESULT): boolean;
export declare function isFailed(hr: HRESULT): boolean;
