import axios from 'axios';

async function run() {
    try {
        const res = await axios.get('http://localhost:5000/career/jobs');
        const jobs = res.data.jobs || res.data.data || (Array.isArray(res.data) ? res.data : []);
        console.log("All Jobs count:", jobs.length);
        jobs.forEach((j, index) => {
            console.log(`Job ${index + 1}: ID: ${j.id}, Title: "${j.title}", Location: "${j.location}", Status: "${j.status}"`);
        });
    } catch (err) {
        console.error("Error:", err.message);
    }
}
run();
