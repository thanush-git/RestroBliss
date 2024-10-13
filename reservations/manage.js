// Import the Firebase functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Your Firebase configuration
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

// EmailJS Configuration
const emailJSServiceID = 'service_ymrfza9'; // Replace with your service ID
const emailJSTemplateID = 'template_fukkx58'; // Replace with your template ID
const emailJSPublicKey = 'nhSo5jQZTkBo8FPlO'; // Replace with your public key

// Function to fetch all reservations from Firestore
async function getReservations() {
    const querySnapshot = await getDocs(collection(db, "reservations"));
    const reservations = [];
    querySnapshot.forEach((doc) => {
        reservations.push({ id: doc.id, ...doc.data() });
    });
    displayReservations(reservations);
}

// Function to update reservation status (approve/reject)
async function updateReservationStatus(id, status) {
    const reservationRef = doc(db, "reservations", id);
    await updateDoc(reservationRef, {
        status: status
    });

    // Fetch reservation data to send confirmation email
    const reservationData = await getDoc(reservationRef); // Get the reservation data
    const reservation = reservationData.data();

    // Send confirmation email
    await sendConfirmationEmail(reservation, status);

    alert(`Reservation ${status}`);
    getReservations(); // Refresh reservations after action
}

// Function to delete a reservation
async function deleteReservation(id) {
    await deleteDoc(doc(db, "reservations", id));
    alert("Reservation deleted");
    getReservations(); // Refresh reservations after action
}

// Function to display reservations in the DOM
function displayReservations(reservations) {
    const reservationList = document.getElementById("reservation-list");
    reservationList.innerHTML = ''; // Clear the current list

    if (reservations.length === 0) {
        reservationList.innerHTML = '<p>No reservations found.</p>';
        return;
    }

    reservations.forEach(reservation => {
        const reservationDiv = document.createElement('div');
        reservationDiv.classList.add('reservation-item');
        reservationDiv.innerHTML = `
            <p><strong>Name:</strong> ${reservation.name}</p>
            <p><strong>Email:</strong> ${reservation.email}</p>
            <p><strong>Date:</strong> ${reservation.date}</p>
            <p><strong>Time:</strong> ${reservation.time}</p>
            <p><strong>Number of People:</strong> ${reservation.numberOfPeople}</p>
            <p><strong>Status:</strong> ${reservation.status || 'Pending'}</p>
            <button class="btn approve" data-id="${reservation.id}" data-action="approve">Approve</button>
            <button class="btn reject" data-id="${reservation.id}" data-action="reject">Reject</button>
            <button class="btn delete" data-id="${reservation.id}" data-action="delete">Delete</button>
        `;
        reservationList.appendChild(reservationDiv);
    });

    // Add event listeners to the approve, reject, and delete buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.target.getAttribute('data-id');
            const action = event.target.getAttribute('data-action');

            if (action === 'approve') {
                updateReservationStatus(id, 'Approved');
            } else if (action === 'reject') {
                updateReservationStatus(id, 'Rejected');
            } else if (action === 'delete') {
                deleteReservation(id);
            }
        });
    });
}

// Function to send confirmation email
async function sendConfirmationEmail(reservation, status) {
    const templateParams = {
        to_name: reservation.name, // Ensure to use the actual name from the reservation
        status: status,            // Use the actual status (Approved/Rejected)
        date: reservation.date,
        time: reservation.time,
        numberOfPeople: reservation.numberOfPeople,
        email: reservation.email    // You can keep this if needed for further use
    };

    const emailData = {
        service_id: emailJSServiceID,
        template_id: emailJSTemplateID,
        user_id: emailJSPublicKey,
        template_params: templateParams
    };

    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        // Check if the response is okay before parsing
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Check if the response was successful
        if (data.status === 200) {
            console.log("Confirmation email sent successfully!");
        } else {
            console.error("Failed to send email: ", data);
            alert("Failed to send confirmation email.");
        }
    } catch (error) {
        console.error("Error sending email: ", error);
        alert("Failed to send confirmation email. Please check the console for details.");
    }
}

// Fetch reservations when the page loads
window.onload = getReservations;
