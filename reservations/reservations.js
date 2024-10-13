// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDOa10HxG6-NtVRRdooS1e0B4wfDEVXOAc",
    authDomain: "reservation-eea23.firebaseapp.com",
    projectId: "reservation-eea23",
    storageBucket: "reservation-eea23.appspot.com",
    messagingSenderId: "715787830364",
    appId: "1:715787830364:web:71795be9f0d8ebe2965299"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to populate time slots from 6 PM to 11 PM (6 slots per hour)
function populateTimeSlots() {
    const timeContainer = document.getElementById("time-container");
    const times = [];

    // Create 6 slots per hour starting from 6 PM (18:00) to 11 PM (23:00)
    for (let hour = 12; hour <= 23; hour++) {
        for (let minute = 0; minute < 60; minute += 60) {
            const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            times.push(timeSlot);
        }
    }

    // Ensure the timeContainer is cleared before appending
    timeContainer.innerHTML = '';

    // Populate the time container with individual time boxes
    times.forEach(time => {
        const timeBox = document.createElement("div");
        timeBox.classList.add("time-box");
        timeBox.textContent = time;
        timeBox.dataset.value = time;
        timeBox.addEventListener("click", selectTimeSlot); // Add click event for selection
        timeContainer.appendChild(timeBox);
    });
}

// Function to handle time slot selection
function selectTimeSlot(event) {
    document.querySelectorAll('.time-box').forEach(box => box.classList.remove('selected'));
    event.target.classList.add('selected');
}

// Function to add a reservation to Firestore
async function addReservation(reservation) {
    try {
        const docRef = await addDoc(collection(db, "reservations"), reservation);
        console.log("Reservation added with ID: ", docRef.id);
        // After successfully adding the reservation, redirect to confirmation page
        redirectToConfirmationPage(reservation);
    } catch (error) {
        console.error("Error adding reservation: ", error);
        alert("Failed to add reservation. Please try again.");
    }
}

// Function to redirect to confirmation page with reservation details
function redirectToConfirmationPage(reservation) {
    const queryString = new URLSearchParams(reservation).toString();
    window.location.href = `confirmation.html?${queryString}`;
}

// Add event listener to the form
document.getElementById("reservationForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const date = document.getElementById("date").value;
    const selectedTimeBox = document.querySelector(".time-box.selected");

    if (!selectedTimeBox) {
        alert("Please select a time slot.");
        return;
    }
    const time = selectedTimeBox.dataset.value;
    const numberOfPeople = document.getElementById("number").value;

    const reservation = {
        name: name,
        email: email,
        date: date,
        time: time,
        numberOfPeople: parseInt(numberOfPeople)
    };

    addReservation(reservation);
});

// Call populateTimeSlots function to load the time slots when the page loads
window.onload = populateTimeSlots;
