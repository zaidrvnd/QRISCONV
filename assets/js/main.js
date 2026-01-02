import { createGeneratorController } from "./ui-generator.js";
import { createPosController } from "./ui-pos.js";
import { closeScanner, toggleScanner } from "./scanner.js";

document.addEventListener("DOMContentLoaded", () => {
    const generator = createGeneratorController({
        qrisInput: document.getElementById("qrisData"),
        amountInput: document.getElementById("amount"),
        qrCodeContainer: document.getElementById("qrcode-gen"),
        qrPlaceholder: document.getElementById("qr-placeholder-gen"),
        amountResult: document.getElementById("resultAmountGen"),
        merchantName: document.getElementById("merchantNameGen"),
    });

    const pos = createPosController({
        setupAlert: document.getElementById("pos-setup-alert"),
        posInterface: document.getElementById("pos-interface"),
        staticQrisInput: document.getElementById("pos-static-qris"),
        cartItems: document.getElementById("cart-items"),
        subtotalEl: document.getElementById("cart-subtotal"),
        totalEl: document.getElementById("cart-total"),
        checkoutBtn: document.getElementById("btn-checkout"),
        paymentModal: document.getElementById("payment-modal"),
        posQrContainer: document.getElementById("pos-qrcode"),
        modalTotal: document.getElementById("modal-total"),
        successModal: document.getElementById("success-modal"),
    });

    function switchView(view) {
        const genView = document.getElementById("view-generator");
        const demoView = document.getElementById("view-demo");
        const genTab = document.getElementById("tab-generator");
        const demoTab = document.getElementById("tab-demo");

        if (view === "generator") {
            genView.classList.remove("hidden");
            demoView.classList.add("hidden");
            genTab.className = "tab-active py-2 transition-colors";
            demoTab.className = "tab-inactive py-2 transition-colors flex items-center gap-1";
            closeScanner();
            return;
        }

        genView.classList.add("hidden");
        demoView.classList.remove("hidden");
        genTab.className = "tab-inactive py-2 transition-colors";
        demoTab.className = "tab-active py-2 transition-colors flex items-center gap-1";
        closeScanner();
        pos.checkSetup();
    }

    function handleScanResult(mode, text) {
        if (!text.startsWith("000201")) {
            alert("Bukan QRIS Valid (harus diawali 000201)");
            return;
        }

        if (mode === "gen") {
            generator.setQrisData(text);
        } else {
            pos.setStaticQris(text);
        }

        const wrapper = document.getElementById(
            mode === "gen" ? "scanner-wrapper-gen" : "scanner-wrapper-pos"
        );
        closeScanner(wrapper);
    }

    document.addEventListener("click", (event) => {
        const actionEl = event.target.closest("[data-action]");
        if (!actionEl) {
            return;
        }

        const action = actionEl.dataset.action;

        switch (action) {
            case "switch-view":
                switchView(actionEl.dataset.view);
                break;
            case "generate-qr":
                generator.generate();
                break;
            case "reset-generator":
                generator.reset();
                break;
            case "toggle-scanner": {
                const mode = actionEl.dataset.mode;
                const wrapper = document.getElementById(
                    mode === "gen" ? "scanner-wrapper-gen" : "scanner-wrapper-pos"
                );
                const readerId = mode === "gen" ? "reader-gen" : "reader-pos";
                toggleScanner({
                    wrapper,
                    readerId,
                    onScan: (text) => handleScanResult(mode, text),
                });
                break;
            }
            case "close-scanner": {
                const mode = actionEl.dataset.mode;
                const wrapper = document.getElementById(
                    mode === "gen" ? "scanner-wrapper-gen" : "scanner-wrapper-pos"
                );
                closeScanner(wrapper);
                break;
            }
            case "save-pos-settings":
                pos.saveSettings();
                break;
            case "add-to-cart": {
                const name = actionEl.dataset.name;
                const price = Number.parseInt(actionEl.dataset.price, 10);
                if (!Number.isNaN(price)) {
                    pos.addToCart(name, price);
                }
                break;
            }
            case "remove-from-cart": {
                const index = Number.parseInt(actionEl.dataset.index, 10);
                if (!Number.isNaN(index)) {
                    pos.removeFromCart(index);
                }
                break;
            }
            case "clear-cart":
                pos.clearCart();
                break;
            case "checkout":
                pos.processCheckout();
                break;
            case "cancel-payment":
                pos.cancelPayment();
                break;
            case "simulate-success":
                pos.simulateSuccess();
                break;
            case "close-success":
                pos.closeSuccess();
                break;
            default:
                break;
        }
    });

    generator.reset();
});
