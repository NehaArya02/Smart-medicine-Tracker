/* =====================================================
   SMARTMED - MEDICINE TRACKER
===================================================== */


/* ================= STORAGE ================= */

let medicines = JSON.parse(
    localStorage.getItem("smartMedMedicines")
) || [];

let history = JSON.parse(
    localStorage.getItem("smartMedHistory")
) || [];


/* ================= DOM ELEMENTS ================= */

const medicineForm = document.getElementById("medicineForm");
const medicineFormElement = document.getElementById("medicineFormElement");

const medicineList = document.getElementById("medicineList");
const historyList = document.getElementById("historyList");

const totalMedicines = document.getElementById("totalMedicines");
const todayMedicines = document.getElementById("todayMedicines");
const takenToday = document.getElementById("takenToday");


/* ================= SHOW FORM ================= */

function showForm() {

    if (!medicineForm) return;

    medicineForm.style.display = "block";

    medicineForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* ================= HIDE FORM ================= */

function hideForm() {

    if (!medicineForm) return;

    medicineForm.style.display = "none";

    if (medicineFormElement) {
        medicineFormElement.reset();
    }

}


/* ================= SAVE DATA ================= */

function saveMedicines() {

    localStorage.setItem(
        "smartMedMedicines",
        JSON.stringify(medicines)
    );

}


function saveHistory() {

    localStorage.setItem(
        "smartMedHistory",
        JSON.stringify(history)
    );

}


/* ================= ADD MEDICINE ================= */

if (medicineFormElement) {

    medicineFormElement.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const name =
                document.getElementById("medicineName").value.trim();

            const dose =
                document.getElementById("medicineDose").value.trim();

            const time =
                document.getElementById("medicineTime").value;


            if (!name || !dose || !time) {

                alert("Please fill all medicine details.");

                return;
            }


            const medicine = {

                id: Date.now(),

                name: name,

                dose: dose,

                time: time

            };


            medicines.push(medicine);

            saveMedicines();

            renderMedicines();

            updateStats();

            hideForm();


            speakEnglish(
                `${name} has been added successfully.`
            );

        }
    );

}


/* ================= RENDER MEDICINES ================= */

function renderMedicines() {

    if (!medicineList) return;


    if (medicines.length === 0) {

        medicineList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    💊
                </div>

                <h3>
                    No medicines added yet
                </h3>

                <p>
                    Add your first medicine to start
                    tracking your schedule.
                </p>

            </div>

        `;

        return;
    }


    medicineList.innerHTML = "";


    medicines.forEach(function (medicine) {

        const card = document.createElement("div");

        card.className = "medicine-card";


        card.innerHTML = `

            <div class="medicine-info">

                <div class="medicine-icon">
                    💊
                </div>

                <div>

                    <h3>
                        ${escapeHTML(medicine.name)}
                    </h3>

                    <p>
                        Dose: ${escapeHTML(medicine.dose)}
                    </p>

                </div>

            </div>


            <div class="medicine-time">

                <span>
                    ⏰
                </span>

                <strong>
                    ${formatTime(medicine.time)}
                </strong>

            </div>


            <div class="medicine-actions">

                <button
                    class="taken-btn"
                    onclick="takeMedicine(${medicine.id})"
                >
                    ✓ Taken
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteMedicine(${medicine.id})"
                >
                    Delete
                </button>

            </div>

        `;


        medicineList.appendChild(card);

    });

}


/* ================= DELETE MEDICINE ================= */

function deleteMedicine(id) {

    const medicine = medicines.find(
        item => item.id === id
    );


    if (!medicine) return;


    const confirmDelete = confirm(
        `Delete ${medicine.name}?`
    );


    if (!confirmDelete) return;


    medicines = medicines.filter(
        item => item.id !== id
    );


    saveMedicines();

    renderMedicines();

    updateStats();

}


/* ================= TAKE MEDICINE ================= */

function takeMedicine(id) {

    const medicine = medicines.find(
        item => item.id === id
    );


    if (!medicine) return;


    const now = new Date();


    const record = {

        id: Date.now(),

        name: medicine.name,

        dose: medicine.dose,

        date: formatDate(now),

        time: formatCurrentTime(now),

        status: "Taken"

    };


    history.unshift(record);


    saveHistory();

    renderHistory();

    updateStats();


    /* ENGLISH VOICE */

    speakEnglish(
        `You have taken ${medicine.name}.`
    );


    /* HINDI VOICE */

    setTimeout(function () {

        speakHindi(
            "अब अपनी दवाई ले लीजिए।"
        );

    }, 1500);

}


/* ================= HISTORY ================= */

function renderHistory() {

    if (!historyList) return;


    if (history.length === 0) {

        historyList.innerHTML = `

            <div class="empty-history">

                <div class="history-icon">
                    📋
                </div>

                <h3>
                    No history yet
                </h3>

                <p>
                    Your medicine activity will appear here.
                </p>

            </div>

        `;

        return;
    }


    historyList.innerHTML = "";


    history.forEach(function (record) {

        const item = document.createElement("div");

        item.className = "history-item";


        item.innerHTML = `

            <div class="history-info">

                <div class="history-icon-small">
                    💊
                </div>

                <div>

                    <h3>
                        ${escapeHTML(record.name)}
                    </h3>

                    <p>
                        ${escapeHTML(record.dose)}
                    </p>

                </div>

            </div>


            <div class="history-date">

                <strong>
                    ${escapeHTML(record.date)}
                </strong>

                <span>
                    ${escapeHTML(record.time)}
                </span>

            </div>


            <div class="history-status">
                ✓ Taken
            </div>

        `;


        historyList.appendChild(item);

    });

}


/* ================= UPDATE STATS ================= */

function updateStats() {

    if (totalMedicines) {

        totalMedicines.textContent =
            medicines.length;

    }


    const today = getTodayDate();


    const todayRecords = history.filter(
        record => record.date === today
    );


    if (todayMedicines) {

        todayMedicines.textContent =
            medicines.length;

    }


    if (takenToday) {

        takenToday.textContent =
            todayRecords.length;

    }

}


/* ================= FORMAT TIME ================= */

function formatTime(time) {

    if (!time) return "";


    const parts = time.split(":");

    let hour = parseInt(parts[0]);

    const minute = parts[1];


    const period = hour >= 12
        ? "PM"
        : "AM";


    hour = hour % 12;

    if (hour === 0) {
        hour = 12;
    }


    return `${hour}:${minute} ${period}`;

}


/* ================= CURRENT TIME ================= */

function formatCurrentTime(date) {

    let hour = date.getHours();

    const minute =
        String(date.getMinutes()).padStart(2, "0");


    const period =
        hour >= 12 ? "PM" : "AM";


    hour = hour % 12;

    if (hour === 0) {
        hour = 12;
    }


    return `${hour}:${minute} ${period}`;

}


/* ================= DATE ================= */

function formatDate(date) {

    const day =
        String(date.getDate()).padStart(2, "0");

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const year =
        date.getFullYear();


    return `${day}/${month}/${year}`;

}


function getTodayDate() {

    return formatDate(new Date());

}


/* ================= ENGLISH VOICE ================= */

function speakEnglish(text) {

    if (!("speechSynthesis" in window)) {
        return;
    }


    window.speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(text);


    speech.lang = "en-IN";

    speech.rate = 0.75;

    speech.pitch = 1;

    speech.volume = 1;


    window.speechSynthesis.speak(speech);

}


/* ================= HINDI VOICE ================= */

function speakHindi(text) {

    if (!("speechSynthesis" in window)) {
        return;
    }


    window.speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(text);


    speech.lang = "hi-IN";

    speech.rate = 0.65;

    speech.pitch = 1;

    speech.volume = 1;


    window.speechSynthesis.speak(speech);

}


/* ================= REMINDER ================= */

function showReminder(medicine) {

    alert(
        `⏰ Medicine Reminder\n\n` +
        `${medicine.name}\n` +
        `Dose: ${medicine.dose}\n\n` +
        `It is time to take your medicine.`
    );


    /* ENGLISH */

    speakEnglish(
        `It is time to take ${medicine.name}.`
    );


    /* HINDI */

    setTimeout(function () {

        speakHindi(
            `अब ${medicine.name} की दवाई ले लीजिए।`
        );

    }, 1800);

}


/* ================= CHECK MEDICINE TIME ================= */

function checkMedicineTime() {

    const now = new Date();


    const currentHour =
        String(now.getHours()).padStart(2, "0");


    const currentMinute =
        String(now.getMinutes()).padStart(2, "0");


    const currentTime =
        `${currentHour}:${currentMinute}`;


    medicines.forEach(function (medicine) {

        if (medicine.time === currentTime) {

            const reminderKey =
                `reminder_${medicine.id}_${getTodayDate()}_${currentTime}`;


            if (!localStorage.getItem(reminderKey)) {

                localStorage.setItem(
                    reminderKey,
                    "shown"
                );


                showReminder(medicine);

            }

        }

    });

}


/* ================= CHECK EVERY 30 SECONDS ================= */

setInterval(
    checkMedicineTime,
    30000
);


/* ================= HTML SAFETY ================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* ================= INITIAL LOAD ================= */

renderMedicines();

renderHistory();

updateStats();

checkMedicineTime();