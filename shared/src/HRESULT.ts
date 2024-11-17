export type HRESULT = number;
export const S_OK = 0x00000000,
    E_ABORT = 0x80004004,
    E_ACCESSDENIED = 0x80070005,
    E_FAIL = 0x80004005,
    E_HANDLE = 0x80070006,
    E_INVALIDARG = 0x80070057,
    E_NOINTERFACE = 0x80004002,
    E_NOTIMPL = 0x80004001,
    E_OUTOFMEMORY = 0x8007000e,
    E_POINTER = 0x80004003,
    E_UNEXPECTED = 0x8000ffff,
    E_LONGATED_MUSKRAT = 0x803f812c;

export function isSucceeded(hr: HRESULT): boolean {
    return hr >= 0;
}

export function isFailed(hr: HRESULT): boolean {
    return hr < 0;
}
