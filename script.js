// ▼▼▼ PASTE YOUR GOOGLE APPS SCRIPT URL HERE ▼▼▼
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyI9XQ14526h-xmfHUm98F1bBk0l6nPqcnCZIeOqWgnpWKWNJl1CX0Fc21RH98NyzBu/exec"; 

// DOM Element References
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

// Function to display feedback messages
function showFeedback(message, type) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = type; // 'success' or 'error'
}

// Function to manage button loading state
function setLoadingState(button, isLoading, originalText) {
    button.disabled = isLoading;
    button.textContent = isLoading ? "Sila tunggu..." : originalText;
}

// 1. Handle the initial IC verification form
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
            body: JSON.stringify({ action: "verify", kadPengenalan: kp })
        });
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        const result = await response.json();

        if (result.status === "error") throw new Error(result.message);
        
        // If verification is successful, load sports options
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

// Function to fetch available sports list from the backend
async function loadSportsOptions() {
    const response = await fetch(WEB_APP_URL); // Simple GET request
    if (!response.ok) throw new Error('Gagal memuatkan senarai sukan.');
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

// 2. Handle the final sports selection form submission
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
            body: JSON.stringify({ kadPengenalan: kp, pilihan1: pilihan1, pilihan2: pilihan2 })
        });
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
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


