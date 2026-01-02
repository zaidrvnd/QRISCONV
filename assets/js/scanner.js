let scanner = null;
let activeWrapper = null;

function createScanner(readerId, onScan) {
    scanner = new Html5QrcodeScanner(readerId, { fps: 10, qrbox: 250 });
    scanner.render((text) => onScan(text));
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
