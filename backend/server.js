const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require("path");

const userRoutes = require('./routes/userRoutes.js');
const paperRoutes = require('./routes/paperRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportingRoutes = require('./routes/reportingRoutes');
const departmentRoutes = require('./routes/departmentRoutes'); 
const domainRoutes = require('./routes/domainRoutes'); // Import domain routes
const conferenceRoutes = require('./routes/conferenceRoutes'); // Import conference routes
const journalRoutes=require('./routes/journalRoutes.js')
const authorRoutes = require("./routes/authorRoutes.js");


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;



app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Welcome to the Research Paper Management System API!');
});

app.use('/api/users', userRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/research-papers', paperRoutes);
app.use('/api/domains', domainRoutes);  // Use domain routes
app.use('/api/conferences', conferenceRoutes);  // Use conference routes
app.use('/api/journals', journalRoutes);  // Use conference routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/authors", authorRoutes);
app.use('/api/reporting',reportingRoutes);

app.use((req, res) => {
    console.log('404 Error for:', req.url);
    res.status(404).send("404: Route not found");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
