import axios from 'axios';

async function run() {
    try {
        console.log("Fetching jobs without filter...");
        const res = await axios.get('http://localhost:5000/career/jobs');
        const data = res.data;
        const jobs = data.jobs || data.data || (Array.isArray(data) ? data : []);
        console.log("All Jobs count:", jobs.length);
        console.log("All Jobs sample:", JSON.stringify(jobs.slice(0, 2), null, 2));
        
        console.log("\nFetching jobs for location = South Africa...");
        const resSA = await axios.get('http://localhost:5000/career/jobs', {
            params: { location: 'South Africa' }
        });
        const dataSA = resSA.data;
        const jobsSA = dataSA.jobs || dataSA.data || (Array.isArray(dataSA) ? dataSA : []);
        console.log("SA Jobs count:", jobsSA.length);
        console.log("SA Jobs data:", JSON.stringify(jobsSA, null, 2));
    } catch (err) {
        console.error("Error:", err.message);
        if (err.response) {
            console.error("Response:", err.response.data);
        }
    }
}
run();
