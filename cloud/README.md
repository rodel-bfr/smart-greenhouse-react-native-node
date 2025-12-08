# Cloud Infrastructure & Landing Page

This folder contains the **Marketing Landing Page** for the ByteStorm project and the **Server Configuration Documentation**.

## 1. The Landing Page
A responsive presentation website built to market the Smart Greenhouse solution.
* **Tech Stack:** HTML5, CSS3 (Bootstrap), JavaScript, PHP (Contact Form).
* **Live Demo:** [https://smartgreenhouse.online](https://smartgreenhouse.online) *(Note: Link depends on server status)*

### Features
* **Responsive Design:** Fully adaptable mobile/desktop layout.
* **Contact Form:** Functional PHP backend connected to MySQL.
* **Modern UI:** Animations using AOS library and smooth scrolling.

## 2. Server Infrastructure (DevOps)
The application is hosted on a Virtual Private Server (VPS) running **AlmaLinux**. We configured the environment from scratch.


### Infrastructure Specs
* **Provider:** Contabo VPS
* **OS:** AlmaLinux 9.4
* **Web Server:** NGINX (Reverse Proxy)
* **Database:** MySQL (Secured)
* **Runtime:** Node.js (Backend) & PHP 8.3 (Frontend)

### Configuration Highlights
1.  **Security:** Configured `firewalld` to only allow ports 80 (HTTP), 443 (HTTPS), and 3306 (MySQL).
2.  **SSL/TLS:** Automated HTTPS using **Certbot (Let's Encrypt)**.
3.  **Process Management:** Used `PM2` to keep the Node.js backend alive.
4.  **Reverse Proxy:** Nginx is configured to serve static files (Frontend) and proxy API requests to `localhost:3000` (Backend).

## 📂 Key Documentation
* **[Server Setup Guide (PDF)](./ghid_configurare_vm.pdf)**: A step-by-step manual on how we secured and configured the Linux VPS.