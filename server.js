const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer);

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("public"));

const db = mysql.createConnection({

    host: process.env.MYSQLHOST,

    user: process.env.MYSQLUSER,

    password: process.env.MYSQLPASSWORD,

    port: process.env.MYSQLPORT,

    database: process.env.MYSQLDATABASE

});

console.log("HOST:", process.env.MYSQLHOST);
console.log("PORT:", process.env.MYSQLPORT);
console.log("USER:", process.env.MYSQLUSER);
console.log("DATABASE:", process.env.MYSQLDATABASE);
db.connect((err) => {

    if (err) {

        console.log(err);

    } else {

        console.log("MySQL Connected");

    }

});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "login.html")
    );

});

// ================= REGISTER =================

app.post("/register", (req, res) => {

    const {

        name,
        email,
        password

    } = req.body;

    const sql =

        "INSERT INTO users(name,email,password,role) VALUES(?,?,?,'student')";

    db.query(

        sql,

        [
            name,
            email,
            password
        ],

        (err, result) => {

            if (err) {

                console.log(err);

                res.send("Registration Failed");

            }

            else {

                res.send("Registration Success");

            }

        }

    );

});



// ================= LOGIN =================

app.post("/login", (req, res) => {

    const {

        email,
        password

    } = req.body;

    const sql =

        "SELECT * FROM users WHERE email=? AND password=?";

    db.query(

        sql,

        [
            email,
            password
        ],

        (err, result) => {

            if (err) {

                console.log(err);

                res.json({});

            }

            else {

                if (result.length > 0) {

                    res.json(result[0]);

                }

                else {

                    res.json({});

                }

            }

        }

    );

});

// ================= UPDATE COMPLAINT =================

app.put(

    "/updateComplaint/:id",

    (req, res) => {

        const id = req.params.id;

        const {

            department,
            priority,
            status

        } = req.body;

        const sql =

            `UPDATE complaints
             SET department=?,
                 priority=?,
                 status=?
             WHERE id=?`;

        db.query(

            sql,

            [

                department,
                priority,
                status,
                id

            ],

            (err, result) => {

                if (err) {

                    console.log(err);

                    res.send("Failed");

                }

                else {

                    res.send("Updated");

                }

            }

        );

    }

);

// ================= DELETE COMPLAINT =================

app.delete(

    "/deleteComplaint/:id",

    (req, res) => {

        const id = req.params.id;

        const sql =

            "DELETE FROM complaints WHERE id=?";

        db.query(

            sql,

            [id],

            (err, result) => {

                if (err) {

                    console.log(err);

                    res.send("Failed");

                }

                else {

                    res.send("Deleted");

                }

            }

        );

    }

);

// ================= ADD COMPLAINT =================

app.post("/addComplaint", (req, res) => {

    const {

        student_name,
        student_email,
        category,
        complaint

    } = req.body;

    const sql =

        `INSERT INTO complaints
        (
            student_name,
            student_email,
            category,
            department,
            priority,
            complaint,
            status
        )
        VALUES
        (
            ?,
            ?,
            ?,
            'Not Assigned',
            'Medium',
            ?,
            'Pending'
        )`;

    db.query(

        sql,

        [

            student_name,

            student_email,

            category,

            complaint

        ],

        (err, result) => {

            if (err) {

                console.log(err);

                res.send("Failed");

            }

            else {

                

                transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: student_email,
  subject: "Complaint Registered",
  html: `
    <h2>Complaint Submitted Successfully</h2>
    <p>Hello ${student_name},</p>
    <p>Your complaint has been registered.</p>
    <p><b>Category:</b> ${category}</p>
    <p><b>Status:</b> Pending</p>
  `
}, (mailErr) => {
  if (mailErr) {
    console.log(mailErr);
  }
});

res.send("Complaint Added");

            }

        }

    );

});

// ================= GET COMPLAINTS =================

app.get("/complaints", (req, res) => {

    const sql =
        "SELECT * FROM complaints ORDER BY id DESC";

    db.query(

        sql,

        (err, result) => {

            if (err) {

                console.log(err);

                res.json([]);

            }

            else {

                res.json(result);

            }

        }

    );

});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
   console.log(`Server running on Port ${PORT}`);
});


