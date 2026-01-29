
const http = require('http');

const data = JSON.stringify({
    userId: 'demo@example.com',
    busId: '659d40b0e52b2a1234567890', // Dummy ID, expect 404 or 400, but NOT hang
    selectedSeats: ['99'],
    bookingDate: new Date().toISOString()
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/bookBus',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Test: Sending request to /api/bookBus...');
const req = http.request(options, (res) => {
    console.log(`Test: StatusCode: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('Test: Response Body:', body);
    });
});

req.on('error', (error) => {
    console.error('Test: Error:', error);
});

req.on('timeout', () => {
    console.error('Test: Request Timed Out');
    req.destroy();
});

req.setTimeout(5000); // 5s timeout
req.write(data);
req.end();
