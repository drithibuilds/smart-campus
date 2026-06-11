// ================= LOGIN =================

async function login() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const res = await fetch("/login", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email,
            password
        })

    });

    const data = await res.json();

    if (data.role === "student") {

        localStorage.setItem(
            "student",
            JSON.stringify(data)
        );

        window.location.href =
            "student.html";
    }

    else if (data.role === "admin") {

        localStorage.setItem(
            "admin",
            JSON.stringify(data)
        );

        window.location.href =
            "admin.html";
    }

    else {

        alert("Invalid Login");
    }

}



// ================= REGISTER =================

async function register() {

    const name =
        document.getElementById("name").value;

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const res = await fetch("/register", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            name,
            email,
            password

        })

    });

    const data = await res.text();

    alert(data);

    if (data === "Registration Success") {

        window.location.href =
            "login.html";
    }

}


// ================= ADD COMPLAINT =================

async function addComplaint() {

    const student = JSON.parse(

        localStorage.getItem("student")

    );

    const category =

        document.getElementById("category").value;

    const complaint =

        document.getElementById("complaint").value;


    if (category === "") {

        alert("Select Category");

        return;
    }

    if (complaint === "") {

        alert("Enter Complaint");

        return;
    }


    await fetch("/addComplaint", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            student_name: student.name,

            student_email: student.email,

            category: category,

            complaint: complaint

        })

    });

    alert("Complaint Submitted");

    clearComplaint();

    loadStudentComplaints();

}



// ================= CLEAR =================

function clearComplaint() {

    document.getElementById("category").value = "";

    document.getElementById("complaint").value = "";

}

// ================= DASHBOARD STATS =================

async function loadDashboardStats() {

    const res = await fetch("/complaints");

    const data = await res.json();

    const total = data.length;

    const pending = data.filter(

        c => c.status === "Pending"

    ).length;

    const progress = data.filter(

        c => c.status === "In Progress"

    ).length;

    const resolved = data.filter(

        c => c.status === "Resolved"

    ).length;


    document.getElementById(
        "totalComplaints"
    ).innerText = total;


    document.getElementById(
        "pendingComplaints"
    ).innerText = pending;


    document.getElementById(
        "progressComplaints"
    ).innerText = progress;


    document.getElementById(
        "resolvedComplaints"
    ).innerText = resolved;

}

// ================= LOAD STUDENT COMPLAINTS =================

async function loadStudentComplaints() {

    const student = JSON.parse(

        localStorage.getItem("student")

    );

    const res = await fetch("/complaints");

    const data = await res.json();

    let rows = "";

    data.forEach((c) => {

        if (

            c.student_email === student.email

        ) {

            rows += `

            <tr>

                <td>${c.id}</td>

                <td>${c.category}</td>

                <td>${c.complaint}</td>

                <td>${c.status}</td>

            </tr>

            `;
        }

    });

    document.getElementById(

        "tableBody"

    ).innerHTML = rows;

}



// ================= LOGOUT =================

function logout() {

    localStorage.clear();

    window.location.href =
        "login.html";

}

// ================= LOAD ADMIN COMPLAINTS =================

async function loadAdminComplaints() {

    const res = await fetch("/complaints");

    const data = await res.json();

    const searchText =

        document.getElementById("searchText")
        ? document.getElementById("searchText").value.toLowerCase()
        : "";

    const filterStatus =

        document.getElementById("filterStatus")
        ? document.getElementById("filterStatus").value
        : "";

    const filterCategory =

        document.getElementById("filterCategory")
        ? document.getElementById("filterCategory").value
        : "";

    let rows = "";

    data.forEach((c) => {

        const complaintMatch =

            c.complaint
            .toLowerCase()
            .includes(searchText);

        const statusMatch =

            filterStatus === ""
            ||
            c.status === filterStatus;

        const categoryMatch =

            filterCategory === ""
            ||
            c.category === filterCategory;

        if (

            complaintMatch
            &&
            statusMatch
            &&
            categoryMatch

        ) {

            rows += `

            <tr>

                <td>${c.id}</td>

                <td>${c.student_name}</td>

                <td>${c.student_email}</td>

                <td>${c.category}</td>

                <td>${c.complaint}</td>

                <td>

                    <select id="dept${c.id}">

                        <option value="${c.department}">
                            ${c.department}
                        </option>

                        <option value="Electrical">
                            Electrical
                        </option>

                        <option value="Water">
                            Water
                        </option>

                        <option value="WiFi">
                            WiFi
                        </option>

                        <option value="Hostel">
                            Hostel
                        </option>

                        <option value="Cleaning">
                            Cleaning
                        </option>

                        <option value="Classroom">
                            Classroom
                        </option>

                    </select>

                </td>

                <td>

                    <select id="priority${c.id}">

                        <option value="${c.priority}">
                            ${c.priority}
                        </option>

                        <option value="Low">
                            Low
                        </option>

                        <option value="Medium">
                            Medium
                        </option>

                        <option value="High">
                            High
                        </option>

                    </select>

                </td>

                <td>

                    <select id="status${c.id}">

                        <option value="${c.status}">
                            ${c.status}
                        </option>

                        <option value="Pending">
                            Pending
                        </option>

                        <option value="Assigned">
                            Assigned
                        </option>

                        <option value="In Progress">
                            In Progress
                        </option>

                        <option value="Resolved">
                            Resolved
                        </option>

                    </select>

                </td>

                <td>

                    <button onclick="updateComplaint(${c.id})">
                        Save
                    </button>

                </td>

                <td>

                    <button
                        onclick="deleteComplaint(${c.id})"
                        class="delete-btn"
                    >
                        Delete
                    </button>

                </td>

            </tr>

            `;
        }

    });

    document.getElementById(
        "tableBody"
    ).innerHTML = rows;

}



// ================= UPDATE COMPLAINT =================

async function updateComplaint(id) {

    const department =

        document.getElementById(
            `dept${id}`
        ).value;

    const priority =

        document.getElementById(
            `priority${id}`
        ).value;

    const status =

        document.getElementById(
            `status${id}`
        ).value;

    await fetch(

        `/updateComplaint/${id}`,

        {

            method: "PUT",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                department,
                priority,
                status

            })

        }

    );

    alert("Complaint Updated");

    loadAdminComplaints();

}



// ================= DELETE COMPLAINT =================

async function deleteComplaint(id) {

    const confirmDelete =

        confirm(
            "Delete Complaint?"
        );

    if (!confirmDelete) {

        return;
    }

    await fetch(

        `/deleteComplaint/${id}`,

        {

            method: "DELETE"

        }

    );

    alert("Complaint Deleted");

    loadAdminComplaints();

    loadDashboardStats();



}

// ================= LOAD STUDENT PROFILE =================

function loadStudentProfile() {

    const student =
    JSON.parse(
        localStorage.getItem("student")
    );

    if (!student) {

        window.location.href =
        "login.html";

        return;
    }

    document.getElementById(
        "studentId"
    ).value =
    student.id || "";

    document.getElementById(
        "studentName"
    ).value =
    student.name || "";

    document.getElementById(
        "studentEmail"
    ).value =
    student.email || "";

}