import mongoose from 'mongoose';
import Bus from './src/models/Bus';
import { connectDatabase } from './src/config/database';


import fs from 'fs';
import path from 'path';

async function checkData() {
    try {
        await connectDatabase();

        let output = 'Checking Bus collection...\n';
        const count = await Bus.countDocuments();
        output += `Total buses: ${count} \n`;

        if (count > 0) {
            const buses = await Bus.find({});
            output += 'Sample routes found in DB:\n';
            buses.forEach(b => output += `- ${b.source} to ${b.destination} \n`);
        }

        fs.writeFileSync(path.join(__dirname, 'db_check_result.txt'), output);
        console.log('Done writing to db_check_result.txt');
        // process.exit(0); // Removed to allow fetch to run
        return;
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}



checkData().then(() => {
    console.log('\nProcessing API test...');
    fetch('http://localhost:3000/api/getHybridRecommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'Chennai', destination: 'Coimbatore' })
    })
        .then(res => res.json())
        .then(data => {
            fs.appendFileSync(path.join(__dirname, 'db_check_result.txt'), '\n\nAPI RESPONSE:\n' + JSON.stringify(data, null, 2));
            console.log('API test completed. Check db_check_result.txt');
        })
        .catch(err => {
            fs.appendFileSync(path.join(__dirname, 'db_check_result.txt'), '\n\nAPI ERROR:\n' + err.message);
            console.error('API test failed');
        });
});

