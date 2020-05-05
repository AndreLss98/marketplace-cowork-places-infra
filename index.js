require('dotenv').config();
const express = require("express");
const app = express();
const app_port = process.env.PORT || 3000;

app.listen(app_port, () => console.log(`Server running on port ${app_port}`));