# 📚 Online Bookstore

A full-stack web application for browsing books, managing a shopping cart, placing orders, and administering a book catalogue.

Built using Java, Spring Boot, React, and MySQL, this project demonstrates full-stack application development, REST APIs, database integration, authentication, and CRUD operations.

## ✨ Features

### 👤 Customer Features
- Customer registration and login
- Browse available books
- Search for books
- Add books to the shopping cart
- Update quantities and remove cart items
- Checkout and place orders
- View order history

### 🔐 Admin Features
- Admin authentication
- Add new books
- Update book details and prices
- Delete books
- Manage the book catalogue

### 🗄️ Database
- MySQL database integration
- Persistent storage for books, users, shopping carts, and orders
- Spring Data JPA for database operations

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Java | Backend programming |
| Spring Boot | Backend application framework |
| Spring Security | Application security |
| Spring Data JPA | Database access |
| Hibernate | Object-relational mapping |
| MySQL | Relational database |
| Maven | Backend build and dependency management |
| React | Frontend user interface |
| Vite | Frontend development server and build tool |
| JavaScript | Frontend functionality |
| HTML and CSS | Web page structure and styling |
| Git and GitHub | Version control and source code hosting |

## 🏗️ Project Structure

```text
online-bookstore/
├── src/
│   ├── main/
│   │   ├── java/com/bookstore/online_bookstore/
│   │   │   ├── BookController.java
│   │   │   ├── BookService.java
│   │   │   ├── BookRepository.java
│   │   │   ├── AuthController.java
│   │   │   ├── CartController.java
│   │   │   ├── OrderController.java
│   │   │   └── SecurityConfig.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── bookstore-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── mvnw
├── mvnw.cmd
├── pom.xml
└── README.md
```

## ⚙️ Prerequisites

Install the following software before running the application:

- Java Development Kit (JDK)
- MySQL Server
- Node.js and npm
- Git

VS Code or another suitable code editor is recommended.

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/jay-j78/online-bookstore.git
cd online-bookstore
```

### 2. Create the MySQL Database

Open MySQL and execute:

```sql
CREATE DATABASE online_bookstore;
```

Make sure your MySQL server is running.

### 3. Configure Environment Variables

The backend uses environment variables for database and administrator credentials.

Configure these variables in your terminal before starting the backend:

- `DB_PASSWORD` — your MySQL database password
- `BOOKSTORE_ADMIN_USERNAME` — administrator username
- `BOOKSTORE_ADMIN_PASSWORD` — administrator password

**Never commit real passwords or credentials to GitHub.**

### 4. Configure the Backend

Open `src/main/resources/application.properties`.

Confirm that the database configuration uses your local MySQL database and reads the password from an environment variable.

The database URL should be:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/online_bookstore
spring.datasource.username=root
spring.datasource.password=${DB_PASSWORD}
```

Ensure the remaining required Spring Boot properties are configured as appropriate for your application.

### 5. Run the Backend

Open PowerShell in the project root.

Set your environment variables in the current terminal session, then run:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend normally runs at:

```text
http://localhost:8080
```

Keep this terminal open while using the application.

### 6. Run the Frontend

Open a second terminal and navigate to the frontend directory:

```powershell
cd bookstore-frontend
```

Install the frontend dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Open the local URL printed in the terminal. With the default Vite configuration, it is usually:

```text
http://localhost:5173
```

Keep both the backend and frontend running.

## 🔌 Backend API

The backend exposes REST endpoints for the application's features.

| Endpoint | Purpose |
|---|---|
| `/api/books` | Retrieve the book catalogue |
| `/api/books/{id}` | Retrieve a book by ID |
| `/api/books/search` | Search for books |
| `/api/books` | Create a book |
| `/api/books/{id}` | Update or delete a book |

The HTTP method determines the operation performed on endpoints that share a path.

Additional endpoints handle authentication, shopping carts, and orders.

## 🔒 Security

- Administrator credentials are configured through environment variables.
- Spring Security protects restricted operations.
- Customer passwords should be stored using secure password hashing.
- Database credentials should not be committed to source control.

## 🎯 Learning Outcomes

This project provides practical experience with:

- Java application development
- Spring Boot application architecture
- REST API development
- Database design and integration
- Spring Data JPA and Hibernate
- Authentication and authorization
- React component development
- Frontend and backend integration
- Git and GitHub workflows
- Debugging and application testing

## 🔮 Future Improvements

Potential enhancements include:

- Book cover image management
- Pagination and advanced filtering
- Improved automated testing
- Order status management
- Deployment to a cloud platform
- Continuous integration and delivery
- Improved responsive design

## 👨‍💻 Author

**Jay Jadhav**

GitHub: [jay-j78](https://github.com/jay-j78)

## 📄 License

No license has been specified yet. Add a suitable license if you intend to permit others to reuse or modify this project.