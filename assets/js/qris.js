export function crc16ccitt(data) {
    let crc = 0xffff;
    for (let i = 0; i < data.length; i += 1) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j += 1) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }
        }
    }
    return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

function parseQrisTags(rawString) {
    const tags = {};
    let index = 0;

    while (index < rawString.length) {
        if (index + 4 > rawString.length) {
            break;
        }

        const tag = rawString.substr(index, 2);
        const length = Number.parseInt(rawString.substr(index + 2, 2), 10);

        if (Number.isNaN(length)) {
            break;
        }
        if (tag === "63") {
            break;
        }

        const value = rawString.substr(index + 4, length);
        tags[tag] = value;
        index += 4 + length;
    }

    return tags;
}

export function createDynamicQris(rawString, amountVal) {
    if (!rawString || !rawString.startsWith("000201")) {
        throw new Error("Format QRIS Invalid");
    }

    const tags = parseQrisTags(rawString);

    tags["01"] = "12";
    tags["54"] = String(amountVal);
    if (!tags["58"]) {
        tags["58"] = "ID";
    }

    let newBody = "";
    Object.keys(tags)
        .sort()
        .forEach((key) => {
            const value = tags[key];
            const length = value.length.toString().padStart(2, "0");
            newBody += key + length + value;
        });

    const strToCrc = `${newBody}6304`;
    const newCrc = crc16ccitt(strToCrc);

    return {
        qrString: strToCrc + newCrc,
        merchantName: tags["59"] || "Unknown Merchant",
    };
}
