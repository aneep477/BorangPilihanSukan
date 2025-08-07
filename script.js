// ▼▼▼ GANTIKAN DENGAN URL APPS SCRIPT BARU ANDA SELEPAS DEPLOY SEMULA ▼▼▼
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzF3nvCET11JEQVcPuWo5H146oASE0Fpb81nFnasxs_PIDwA4-jz2JmjKyBaZPbBfwj/exec"; 

document.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
});

async function loadInitialData() {
    try {
        const response = await fetch(WEB_APP_URL);
        if (!response.ok) throw new Error('Gagal menyambung ke server.');
        
        const result = await response.json();
        if (result.status === 'error') throw new Error(result.message);
        
        const sportsData = result.data;
        displayQuotaTable(sportsData);
        populateDropdowns(sportsData);
        
    } catch (error) {
        document.getElementById('quota-table-container').innerHTML = `<p style="color: red;">Gagal memuatkan data kuota: ${error.message}</p>`;
    }
}

function displayQuotaTable(data) {
    const container = document.getElementById('quota-table-container');
    let tableHTML = `
        <h2>Status Kuota Semasa</h2>
        <table class="quota-table">
            <thead>
                <tr>
                    <th>Sukan</th>
                    <th>Sudah Daftar</th>
                    <th>Baki Kuota</th>
                </tr>
            </thead>
            <tbody>`;

    if (data.length === 0) {
        tableHTML += `<tr><td colspan="3">Tiada data pendaftaran buat masa ini.</td></tr>`;
    } else {
        data.forEach(sport => {
            const statusClass = sport.remaining > 0 ? 'available' : 'full';
            tableHTML += `
                <tr class="${statusClass}">
                    <td>${sport.name}</td>
                    <td>${sport.registered} / ${sport.quota}</td>
                    <td>${sport.remaining}</td>
                </tr>`;
        });
    }

    tableHTML += `</tbody></table>`;
    container.innerHTML = tableHTML;
}

function populateDropdowns(data) {
    const selectPilihan1 = document.getElementById('pilihan1');
    const selectPilihan2 = document.getElementById('pilihan2');
    
    selectPilihan1.innerHTML = '<option value="">-- Pilih Sukan --</option>';
    selectPilihan2.innerHTML = '<option value="">-- Pilih Sukan --</option>';

    data.forEach(sport => {
        if (sport.remaining > 0) {
            const option = `<option value="${sport.name}">${sport.name}</option>`;
            selectPilihan1.innerHTML += option;
            selectPilihan2.innerHTML += option;
        }
    });
}

const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const kp = document.getElementById('kad-pengenalan').value.trim();
    if (!kp) {
        showFeedback("Sila masukkan kad pengenalan.", "error");
        return;
    }
    
    const loginButton = document.getElementById('login-button');
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
        
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('quota-table-container').classList.add('hidden');
        document.getElementById('selection-section').classList.remove('hidden');
        document.getElementById('student-name').textContent = result.studentInfo.nama;
        document.getElementById('student-class').textContent = result.studentInfo.kelas;
        showFeedback('', '');

    } catch (error) {
        showFeedback(error.message, 'error');
    } finally {
        setLoadingState(loginButton, false, "Sahkan");
    }
});

const selectionForm = document.getElementById('selection-form');
selectionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pilihan1 = document.getElementById('pilihan1').value;
    const pilihan2 = document.getElementById('pilihan2').value;
    const kp = document.getElementById('kad-pengenalan').value;

    if (!pilihan1 || !pilihan2) { showFeedback('Sila pilih kedua-dua pilihan sukan.', 'error'); return; }
    if (pilihan1 === pilihan2) { showFeedback('Pilihan 1 dan Pilihan 2 tidak boleh sama.', 'error'); return; }

    const submitButton = document.getElementById('submit-button');
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
            document.getElementById('selection-section').innerHTML = `<h2>Terima Kasih, ${result.studentInfo.nama}!</h2><p>Pilihan anda telah direkodkan.</p>`;
            showFeedback(result.message, 'success');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showFeedback(error.message, 'error');
        setLoadingState(submitButton, false, "Hantar Pilihan");
    }
});

function showFeedback(message, type) {
    const feedbackMessage = document.getElementById('feedback-message');
    feedbackMessage.textContent = message;
    feedbackMessage.className = type;
}

function setLoadingState(button, isLoading, originalText) {
    button.disabled = isLoading;
    button.textContent = isLoading ? "Sila tunggu..." : originalText;
}
