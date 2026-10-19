# Run website:

## [Click here](https://camposjohnearl-byte.github.io/AccessPoint-VISITOR-MANAGEMENT/#)

AccessPoint: Visitor Management System

A robust, web-based Visitor Management System (VMS) engineered to streamline entry processes, monitor guest traffic, enhance campus/facility security, and maintain accurate digital logs. Designed with scalability and ease of use in mind, this application replaces traditional paper logbooks with an efficient, centralized digital registry.

🚀 Features

Digital Visitor Registration: Seamlessly capture visitor credentials, contact details, host information, and purpose of visit.

Real-Time Tracking & Logs: Monitor active visitors currently inside the premises and inspect comprehensive historical logs.

Check-In / Check-Out Workflow: Fast entry and exit processing to minimize lobby congestion and queues.

Admin Dashboard: Centralized control panel providing aggregate metrics, user administration, and system configurations.

Search & Filter Tools: Instantly look up past visitors by name, date, or affiliation for audit and security checks.

Responsive UI: Clean, mobile-friendly interface designed for smooth navigation across desktops, laptops, and tablets.

🛠️ Tech Stack

Frontend: HTML5, CSS3, JavaScript, Bootstrap

Backend: PHP

Database: MySQL

Local Development Environment: XAMPP (Apache & MySQL) / Visual Studio Code

📦 Project Structure

AccessPoint-VISITOR-MANAGEMENT/
├── assets/             # CSS, JavaScript, images, and vendor files
├── database/           # SQL database dump and schema files
├── includes/           # Reusable components (e.g., header, footer, database connection)
├── pages/              # Core application modules (dashboard, check-in, logs, users)
├── index.php           # Landing / Login page
└── README.md           # Project documentation


⚙️ Installation and Setup

Follow these steps to set up the project locally on your machine:

Prerequisites

Download and install XAMPP (or an equivalent local server stack supporting PHP and MySQL).

Visual Studio Code (recommended for code inspection and editing).

Step 1: Clone the Repository

Clone this repository into your local web server directory (e.g., htdocs folder in XAMPP):

git clone https://github.com/camposjohnearl-byte/AccessPoint-VISITOR-MANAGEMENT.git


(Or download the ZIP archive and extract it directly into C:/xampp/htdocs/AccessPoint-VISITOR-MANAGEMENT/)

Step 2: Start Local Server

Open the XAMPP Control Panel.

Start Apache and MySQL.

Step 3: Configure the Database

Open your browser and navigate to http://localhost/phpmyadmin/.

Create a new database named accesspoint_db (or the name specified in your configuration files).

Import the provided SQL schema file located in the database/ folder (database/accesspoint_db.sql).

Step 4: Update Database Credentials (If Needed)

Verify that your database connection settings in your configuration/connection file (typically located inside includes/ or config scripts) match your local setup:

$host = "localhost";
$username = "root";
$password = "";
$dbname = "accesspoint_db";


Step 5: Run the Application

Open your web browser and access the project via:

http://localhost/AccessPoint-VISITOR-MANAGEMENT/


📷 Usage Guide

Authentication: Log in using authorized administrator credentials to access the secure management console.

Dashboard Overview: View live metrics of current visitors inside the facility and recent activity logs.

Registering a Visitor: Fill out the visitor form with personal details and host information to log an incoming guest.

Checkout: Update visitor status upon departure to keep real-time occupancy counts accurate.

🤝 Contributing

Contributions, bug reports, and feature requests are welcome! Feel free to fork the repository and submit pull requests.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

👤 Author

John Earl P. Campos

GitHub: @camposjohnearl-byte
