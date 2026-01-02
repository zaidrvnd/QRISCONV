let scanner = null;
let activeWrapper = null;

function buildScannerConfig() {
    const config = { fps: 10, qrbox: 250 };
    if (typeof Html5QrcodeScanType !== "undefined") {
        config.supportedScanTypes = [
            Html5QrcodeScanType.SCAN_TYPE_CAMERA,
            Html5QrcodeScanType.SCAN_TYPE_FILE,
        ];
    }
    return config;
}

function createScanner(readerId, onScan) {
    if (typeof Html5QrcodeScanner === "undefined") {
        alert("Scanner belum tersedia. Muat ulang halaman dan pastikan koneksi stabil.");
        return;
    }

    const target = document.getElementById(readerId);
    if (target) {
        target.innerHTML = "";
    }

    scanner = new Html5QrcodeScanner(readerId, buildScannerConfig());
    scanner.render((text) => onScan(text), () => {});
}

export function toggleScanner({ wrapper, readerId, onScan }) {
    if (wrapper.classList.contains("hidden")) {
        closeScanner(wrapper);
        wrapper.classList.remove("hidden");
        activeWrapper = wrapper;
        createScanner(readerId, onScan);
        return;
    }

    closeScanner(wrapper);
}

export function closeScanner(wrapper) {
    if (wrapper) {
        wrapper.classList.add("hidden");
    }
    if (activeWrapper && activeWrapper !== wrapper) {
        activeWrapper.classList.add("hidden");
    }
    if (scanner) {
        scanner.clear();
        scanner = null;
    }
    activeWrapper = null;
}
