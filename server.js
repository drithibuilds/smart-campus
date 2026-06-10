require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");

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
console.log("EMAIL FUNCTION TRIGGERED");
//sendComplaintEmail(student_email, { category, complaint });
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

async function sendComplaintEmail(toEmail, complaintData) {
  try {
    const mailOptions = {
      from: `Smart Campus <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Complaint Registered Successfully",
      html: `
        <div style="font-family:Arial;padding:10px">
          <h2>Complaint Registered</h2>
          <p><b>Category:</b> ${complaintData.category}</p>
          <p><b>Complaint:</b> ${complaintData.complaint}</p>
          <hr/>
          <p>Status: <b>Pending</b></p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

  } catch (error) {
    console.error("Email failed:", error.message);
  }
}

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

    const sql = `
        INSERT INTO complaints
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
        (?, ?, ?, 'Not Assigned', 'Medium', ?, 'Pending')
    `;

    db.query(sql,
        [student_name, student_email, category, complaint],
        async (err, result) => {

            if (err) {
                console.log(err);
                return res.send("Failed");
            }

            // ✅ EMAIL ONLY AFTER SUCCESS
            try {
                await sendComplaintEmail(student_email, {
                    student_name,
                    category,
                    complaint
                });
            } catch (e) {
                console.log("Email error:", e.message);
            }

            res.send("Complaint Added + Email Sent");
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


