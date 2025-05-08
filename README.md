# Chovora – Full-Stack E-commerce Website

**Chovora** is a fully functional e-commerce web application built entirely from scratch using HTML, CSS, vanilla JavaScript, Node.js, and MongoDB.  
The website allows users to browse products, register/login securely, manage their cart and favorites, and enjoy a seamless user experience across all devices.

This project was created as a practical demonstration of my full-stack development skills within my **Computer Engineering** program at Bahçeşehir University, as part of my **double major in Management Engineering**.

> Built and deployed independently by **Burak Ege Kaya** — showcasing real-world web development capabilities, including authentication, RESTful APIs, dynamic UI handling, cloud-based deployment, and SMTP integration.

---

## Live Website

 **https://chovora.com**  
A live deployment of the project — users can interact with the full experience from login to checkout.

---

## Core Features

- Secure user registration and login (JWT-based, HTTP-only cookies)
- Add-to-cart and add-to-favorites functionality with session persistence
- Live product search with dynamic filtering
- Toast notifications for user feedback
- SMTP-based contact form with real email delivery (using Nodemailer)
- Fully responsive layout (mobile & desktop)
- Cross-browser compatibility (Chrome, Safari, Opera)

---

## Tech Stack

### Frontend (served from `public/` folder)
- HTML5, CSS3, JavaScript (Vanilla)
- DOM manipulation and event-driven interface
- Responsive design via media queries

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- RESTful API architecture
- JWT-based authentication system (secure cookies)
- Nodemailer integration for contact form (SMTP-based mailing)

### Deployment
- Vercel (Frontend)
- Render (Backend)
- Custom domain connected via GoDaddy: [chovora.com](https://chovora.com)

---

## Project Structure

```bash
backend/
├── middleware/
├── models/
├── public/
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── contact.html
│   ├── login.html
│   ├── register.html
│   ├── products.html
│   ├── thanks.html
│   └── ...
├── routes/
├── .env.example
├── db.js
├── index.js
├── package.json
└── package-lock.json
```

---

## Developer

**Burak Ege Kaya**  
Computer Engineering & Management Engineering (Double Major) Student  
Bahçeşehir University  
[LinkedIn](https://www.linkedin.com/in/burak-ege-kaya/)

---

## Note & License

Originally initiated as part of a university marketing course, all aspects of this project — from the code and system architecture to the deployment pipeline — were fully designed and implemented to demonstrate software engineering and full-stack development capabilities.  
It also includes SMTP mailing integration for user contact handling.

All rights reserved.
