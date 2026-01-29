
const fetch = require('node-fetch');

async function testBooking() {
    console.log('Test: Sending booking request...');
    try {
        // 1. Get a bus ID first (optional, or hardcode one from seed)
        // We know from seed: Chennai -> Coimbatore
        const routesRes = await fetch('http://127.0.0.1:3000/api/getBusOptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source: 'Chennai', destination: 'Coimbatore' })
        });
        const routesData = await routesRes.json();

        if (!routesData.success || routesData.data.length === 0) {
            console.error('Test Failed: No buses found to book');
            return;
        }

        const busId = routesData.data[0]._id;
        console.log(`Test: Found Bus ID ${busId}`);

        // 2. Book a seat
        const bookingRes = await fetch('http://127.0.0.1:3000/api/bookBus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'demo@example.com',
                busId: busId,
                selectedSeats: ['10', '11'],
                bookingDate: new Date().toISOString()
            })
        });

        console.log(`Test: Booking Response Status: ${bookingRes.status}`);
        const text = await bookingRes.text();
        console.log('Test: Booking Response Body:', text);

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testBooking();
