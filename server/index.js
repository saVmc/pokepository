/* Python Implementation, comment out js implementaion below before running

    const spawn = require("child_process").spawn;
    // you can add arguments with spawn('python',["path/to/script.py", arg1, arg2, ...])
    const pythonProcess = spawn('python',["database_manager.py"]);

*/

const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(
  path.join(__dirname, "..", "database", "data_source.db"),
);

const express = require("express");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.listen(5000, () =>
  console.log(
    "Server is running on Port 5000, visit http://localhost:5000/ or http://127.0.0.1:5000 to access your website",
  ),
);
