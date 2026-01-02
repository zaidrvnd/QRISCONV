import { createDynamicQris } from "./qris.js";
import { formatIdr, toPositiveInt } from "./utils.js";

export function createGeneratorController({
    qrisInput,
    amountInput,
    qrCodeContainer,
    qrPlaceholder,
    amountResult,
    merchantName,
}) {
    function setQrisData(value) {
        qrisInput.value = value;
    }

    function reset() {
        qrisInput.value = "";
        amountInput.value = "";
        qrCodeContainer.innerHTML = "";
        qrCodeContainer.classList.add("hidden");
        qrPlaceholder.classList.remove("hidden");
        amountResult.innerText = "Rp 0";
        merchantName.innerText = "waiting...";
        merchantName.classList.remove("bg-blue-100", "text-blue-700");
    }

    function generate() {
        try {
            const raw = qrisInput.value.trim();
            const amount = toPositiveInt(amountInput.value.trim());

            if (!amount) {
                alert("Masukkan nominal valid");
                return;
            }

            const result = createDynamicQris(raw, amount);
            qrCodeContainer.innerHTML = "";
            new QRCode(qrCodeContainer, { text: result.qrString, width: 200, height: 200 });

            qrCodeContainer.classList.remove("hidden");
            qrPlaceholder.classList.add("hidden");
            amountResult.innerText = formatIdr(amount);
            merchantName.innerText = result.merchantName;
            merchantName.classList.add("bg-blue-100", "text-blue-700");
        } catch (error) {
            alert(error.message);
        }
    }

    return {
        generate,
        reset,
        setQrisData,
    };
}
