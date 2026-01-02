import { createDynamicQris } from "./qris.js";
import { formatIdr } from "./utils.js";

export function createPosController({
    setupAlert,
    posInterface,
    staticQrisInput,
    cartItems,
    subtotalEl,
    totalEl,
    checkoutBtn,
    paymentModal,
    posQrContainer,
    modalTotal,
    successModal,
}) {
    let cart = [];
    let merchantStaticQris = "";

    function setStaticQris(value) {
        staticQrisInput.value = value;
    }

    function isSetupValid() {
        return merchantStaticQris && merchantStaticQris.startsWith("000201");
    }

    function checkSetup() {
        if (isSetupValid()) {
            setupAlert.classList.add("hidden");
            posInterface.classList.remove("opacity-50", "pointer-events-none");
        } else {
            setupAlert.classList.remove("hidden");
            posInterface.classList.add("opacity-50", "pointer-events-none");
        }
    }

    function saveSettings() {
        const input = staticQrisInput.value.trim();
        if (input.startsWith("000201")) {
            merchantStaticQris = input;
            checkSetup();
        } else {
            alert("Format QRIS tidak valid.");
        }
    }

    function renderCart() {
        if (cart.length === 0) {
            cartItems.innerHTML = `<div class="text-slate-400 py-10">Keranjang Kosong</div>`;
            checkoutBtn.classList.add("cursor-not-allowed", "bg-slate-200", "text-slate-400");
            checkoutBtn.classList.remove("bg-blue-600", "text-white", "hover:bg-blue-700");
            checkoutBtn.disabled = true;
            subtotalEl.innerText = "Rp 0";
            totalEl.innerText = "Rp 0";
            return;
        }

        let html = "";
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price;
            html += `
                <div class="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                    <div class="text-left">
                        <div class="font-medium text-slate-700">${item.name}</div>
                        <div class="text-xs text-slate-500">Rp ${item.price.toLocaleString("id-ID")}</div>
                    </div>
                    <button data-action="remove-from-cart" data-index="${index}" class="text-red-400 hover:text-red-600 p-1">✕</button>
                </div>
            `;
        });

        cartItems.innerHTML = html;
        subtotalEl.innerText = formatIdr(total);
        totalEl.innerText = formatIdr(total);

        checkoutBtn.classList.remove("cursor-not-allowed", "bg-slate-200", "text-slate-400");
        checkoutBtn.classList.add("bg-blue-600", "text-white", "hover:bg-blue-700");
        checkoutBtn.disabled = false;
    }

    function addToCart(name, price) {
        cart.push({ name, price });
        renderCart();
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        renderCart();
    }

    function clearCart() {
        cart = [];
        renderCart();
    }

    function processCheckout() {
        if (cart.length === 0) {
            return;
        }

        const total = cart.reduce((sum, item) => sum + item.price, 0);

        try {
            const result = createDynamicQris(merchantStaticQris, total);
            posQrContainer.innerHTML = "";
            new QRCode(posQrContainer, {
                text: result.qrString,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M,
            });

            modalTotal.innerText = formatIdr(total);
            paymentModal.classList.remove("hidden");
        } catch (error) {
            alert(`Gagal membuat QRIS: ${error.message}`);
        }
    }

    function cancelPayment() {
        paymentModal.classList.add("hidden");
    }

    function simulateSuccess() {
        paymentModal.classList.add("hidden");
        successModal.classList.remove("hidden");
        clearCart();
    }

    function closeSuccess() {
        successModal.classList.add("hidden");
    }

    return {
        addToCart,
        removeFromCart,
        clearCart,
        processCheckout,
        saveSettings,
        checkSetup,
        setStaticQris,
        cancelPayment,
        simulateSuccess,
        closeSuccess,
    };
}
