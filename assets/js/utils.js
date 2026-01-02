export function formatIdr(value) {
    const amount = Number(value);
    if (Number.isNaN(amount)) {
        return "Rp 0";
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function toPositiveInt(value) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
        return null;
    }
    return parsed;
}
