// ▼▼▼ TAMPAL URL GOOGLE APPS SCRIPT ANDA DI SINI ▼▼▼
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwYc2lYwqIUlHllpcEDuEpl058cSjKKJCnm4OjK5kYZSjgFq-CdyZfLpdVhvVbjJAQF/exec"; 

// Rujukan kepada elemen-elemen di laman web
const loginSection = document.getElementById('login-section');
const selectionSection = document.getElementById('selection-section');
const loginForm = document.getElementById('login-form');
const selectionForm = document.getElementById('selection-form');
const feedbackMessage = document.getElementById('feedback-message');
const studentNameEl = document.getElementById('student-name');
const studentClassEl = document.getElementById('student-class');
const icInput = document.getElementById('kad-pengenalan');
const loginButton = document.getElementById('login-button');
const submitButton = document.getElementById('submit-button');


// Fungsi untuk memaparkan maklum balas (mesej ralat atau kejayaan)
function showFeedback(message, type) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = type; // 'success' atau 'error'
}

// Fungsi untuk melumpuhkan butang semasa proses sedang berjalan
function setLoadingState(button, isLoading, text) {
    button.disabled = isLoading;
    button.textContent = isLoading ? "Sila tunggu..." : text;
}

// 1. Apabila borang pengesahan KP dihantar
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const kp = icInput.value.trim();
    if (!kp) {
        showFeedback("Sila masukkan kad pengenalan.", "error");
        return;
    }
    
    setLoadingState(loginButton, true, "Sahkan");
    showFeedback("Mengesahkan...", "");

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: "verify", kadPengenalan: kp })
        });
        const result = await response.json();

        if (result.status === "error") { throw new Error(result.message); }
        
        // Jika berjaya, teruskan untuk memuatkan senarai sukan
        await loadSportsOptions();
        
        loginSection.classList.add('hidden');
        selectionSection.classList.remove('hidden');
        studentNameEl.textContent = result.studentInfo.nama;
        studentClassEl.textContent = result.studentInfo.kelas;
        showFeedback('', '');

    } catch (error) {
        showFeedback(error.message, 'error');
    } finally {
        setLoadingState(loginButton, false, "Sahkan");
    }
});

// Fungsi untuk mendapatkan senarai sukan yang masih available dari Apps Script
async function loadSportsOptions() {
    const response = await fetch(WEB_APP_URL); // Guna GET request
    const result = await response.json();

    if (result.status === 'success') {
        const availableSports = result.data;
        const selectPilihan1 = document.getElementById('pilihan1');
        const selectPilihan2 = document.getElementById('pilihan2');
        
        selectPilihan1.innerHTML = '<option value="">-- Pilih Sukan --</option>';
        selectPilihan2.innerHTML = '<option value="">-- Pilih Sukan --</option>';

        availableSports.forEach(sukan => {
            selectPilihan1.innerHTML += `<option value="${sukan}">${sukan}</option>`;
            selectPilihan2.innerHTML += `<option value="${sukan}">${sukan}</option>`;
        });
    } else {
        throw new Error(result.message || 'Gagal memuatkan senarai sukan.');
    }
}

// 2. Apabila borang pilihan sukan dihantar
selectionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pilihan1 = document.getElementById('pilihan1').value;
    const pilihan2 = document.getElementById('pilihan2').value;
    const kp = icInput.value;

    if (!pilihan1 || !pilihan2) {
        showFeedback('Sila pilih kedua-dua pilihan sukan.', 'error');
        return;
    }
    if (pilihan1 === pilihan2) {
        showFeedback('Pilihan 1 dan Pilihan 2 tidak boleh sama.', 'error');
        return;
    }

    setLoadingState(submitButton, true, "Hantar Pilihan");
    showFeedback("Menghantar pilihan...", "");
    
    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({ kadPengenalan: kp, pilihan1: pilihan1, pilihan2: pilihan2 }),
            headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        
        if (result.status === 'success') {
            selectionSection.innerHTML = `<h2>Terima Kasih, ${result.studentInfo.nama}!</h2>`;
            showFeedback(result.message, 'success');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showFeedback(error.message, 'error');
        setLoadingState(submitButton, false, "Hantar Pilihan");
    }
});

