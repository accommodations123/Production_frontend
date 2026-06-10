import axios from 'axios';
import { execSync } from 'child_process';

async function run() {
    try {
        console.log("Triggering API request...");
        // Make request in the background
        const req = axios.get('http://localhost:5000/career/jobs');
        
        // Wait a tiny bit for connection to open, then run netstat
        await new Promise(r => setTimeout(r, 100));
        console.log("Running netstat...");
        const netstat = execSync('netstat -ano | findstr 1304').toString();
        console.log("Netstat output:\n", netstat);
        
        const res = await req;
        console.log("API response status:", res.status);
    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
