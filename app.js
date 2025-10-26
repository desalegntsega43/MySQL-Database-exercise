<<<<<<< HEAD
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

// MySQL Database Connection
const mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "myDBuser",
  password: "myDBuser",
  database: "myDB",
  port: 3306
});

// Connect to MySQL
mysqlConnection.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection error:", err);
    return;
  }
  console.log("✅ Connected to MySQL database");
  createTablesSequentially();
});

// Table creation queries
const tableQueries = [
  `CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_url VARCHAR(200),
    product_name VARCHAR(100)
  )`,
  `CREATE TABLE IF NOT EXISTS product_description (
    description_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    product_brief_description VARCHAR(255) NOT NULL,
    product_description VARCHAR(255) NOT NULL,
    product_img VARCHAR(255) NOT NULL,
    product_link VARCHAR(255) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS product_price (
    price_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    starting_price DECIMAL(10,2) NOT NULL,
    price_range VARCHAR(255) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(100) NOT NULL UNIQUE,
    user_password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
  )`
];

// Create tables sequentially
function createTablesSequentially() {
  tableQueries.forEach((query, index) => {
    mysqlConnection.query(query, (err) => {
      if (err) {
        console.error(`❌ Table creation error for query ${index + 1}:`, err);
      } else {
        console.log(`✅ Table ${index + 1} created/verified successfully`);
      }
    });
  });
}

// ==================== ROUTES ====================

// 1. Main Dashboard
app.get("/", (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>MySQL Database API</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f0f2f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .status { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .links { display: grid; grid-template-columns: 1fr; gap: 15px; margin: 30px 0; }
        .link-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; text-decoration: none; color: #333; transition: transform 0.2s; }
        .link-card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); background: #e3f2fd; }
        .link-title { font-weight: bold; color: #007bff; margin-bottom: 8px; font-size: 18px; }
        .link-url { color: #666; font-size: 14px; }
        .link-description { color: #888; margin-top: 5px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 MySQL Database Dashboard</h1>
        
        <div class="status">
          <strong>✅ Database Status:</strong> Connected successfully to MySQL database
        </div>

        <h2>🔗 Available Pages:</h2>
        <div class="links">
          <a href="/view" class="link-card">
            <div class="link-title">📊 Database Tables Viewer</div>
            <div class="link-url">${BASE_URL}/view</div>
            <div class="link-description">View all data with Update and Delete buttons</div>
          </a>
          
          <a href="/add-product-form" class="link-card">
            <div class="link-title">➕ Add Product Form</div>
            <div class="link-url">${BASE_URL}/add-product-form</div>
            <div class="link-description">Add new products to the database</div>
          </a>

          <a href="/add-user-form" class="link-card">
            <div class="link-title">👥 Add User Form</div>
            <div class="link-url">${BASE_URL}/add-user-form</div>
            <div class="link-description">Register new users in the system</div>
          </a>

          <a href="/add-order-form" class="link-card">
            <div class="link-title">🛒 Add Order Form</div>
            <div class="link-url">${BASE_URL}/add-order-form</div>
            <div class="link-description">Create new orders linking users and products</div>
          </a>

          <a href="/manage-products" class="link-card">
            <div class="link-title">📦 Manage Products</div>
            <div class="link-url">${BASE_URL}/manage-products</div>
            <div class="link-description">Update and Delete existing products</div>
          </a>

          <a href="/manage-users" class="link-card">
            <div class="link-title">👥 Manage Users</div>
            <div class="link-url">${BASE_URL}/manage-users</div>
            <div class="link-description">Update and Delete existing users</div>
          </a>

          <a href="/manage-orders" class="link-card">
            <div class="link-title">🛒 Manage Orders</div>
            <div class="link-url">${BASE_URL}/manage-orders</div>
            <div class="link-description">Update and Delete existing orders</div>
          </a>
        </div>

        <div style="margin-top: 30px; padding: 15px; background: #e7f3ff; border-radius: 5px;">
          <strong>💡 Tip:</strong> Your database is running on <strong>localhost:3306</strong> with database name <strong>myDB</strong>
        </div>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

// ==================== PRODUCT ROUTES ====================

// Add Product Form
app.get("/add-product-form", (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Add Product</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f0f2f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; margin-bottom: 30px; }
        form { margin-top: 20px; }
        label { display: block; margin: 15px 0 5px; font-weight: bold; color: #555; }
        input, textarea { 
          width: 100%; 
          padding: 12px; 
          border: 1px solid #ddd; 
          border-radius: 5px; 
          box-sizing: border-box; 
          font-size: 16px;
          margin-bottom: 10px;
        }
        input:focus, textarea:focus {
          border-color: #007bff;
          outline: none;
          box-shadow: 0 0 5px rgba(0,123,255,0.3);
        }
        button { 
          background: #007bff; 
          color: white; 
          padding: 15px 30px; 
          border: none; 
          border-radius: 5px; 
          cursor: pointer; 
          margin-top: 20px; 
          font-size: 16px; 
          width: 100%;
          transition: background 0.3s;
        }
        button:hover { background: #0056b3; }
        .result { 
          margin-top: 20px; 
          padding: 15px; 
          border-radius: 5px; 
          display: none;
          text-align: center;
        }
        .success { 
          background: #d4edda; 
          color: #155724; 
          border: 1px solid #c3e6cb; 
        }
        .error { 
          background: #f8d7da; 
          color: #721c24; 
          border: 1px solid #f5c6cb; 
        }
        .back-link { 
          display: inline-block; 
          margin-top: 20px; 
          color: #007bff; 
          text-decoration: none; 
          text-align: center;
          width: 100%;
        }
        .back-link:hover { text-decoration: underline; }
        .form-group { margin-bottom: 20px; }
        .required::after { content: " *"; color: red; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>➕ Add New Product</h1>
        <form id="productForm">
          <div class="form-group">
            <label class="required">Product Name:</label>
            <input type="text" name="product_name" required placeholder="Enter product name">
          </div>
          
          <div class="form-group">
            <label class="required">Starting Price ($):</label>
            <input type="number" name="starting_price" step="0.01" required placeholder="Enter starting price">
          </div>
          
          <div class="form-group">
            <label>Price Range:</label>
            <input type="text" name="price_range" placeholder="e.g., 999-1499">
          </div>
          
          <div class="form-group">
            <label>Brief Description:</label>
            <textarea name="product_brief_description" placeholder="Enter brief description" rows="3"></textarea>
          </div>
          
          <div class="form-group">
            <label>Full Description:</label>
            <textarea name="product_description" placeholder="Enter full description" rows="4"></textarea>
          </div>
          
          <div class="form-group">
            <label>Image URL:</label>
            <input type="text" name="product_img" placeholder="Enter image URL">
          </div>
          
          <div class="form-group">
            <label>Product Link:</label>
            <input type="text" name="product_link" placeholder="Enter product link">
          </div>
          
          <button type="submit">Add Product</button>
        </form>
        
        <div id="result" class="result"></div>
        
        <a href="/" class="back-link">← Back to Dashboard</a>
        <a href="/manage-products" class="back-link">📦 Manage Products →</a>
      </div>

      <script>
        document.getElementById('productForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const formData = new FormData(this);
          const data = Object.fromEntries(formData);
          
          try {
            const response = await fetch('/add-product', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            const resultDiv = document.getElementById('result');
            if (response.ok) {
              resultDiv.innerHTML = '<strong>✅ Success!</strong> ' + result.message + 
                (result.productId ? '<br>Product ID: ' + result.productId : '');
              resultDiv.className = 'result success';
              
              // CLEAR THE FORM AFTER SUCCESSFUL SUBMISSION
              document.getElementById('productForm').reset();
              
            } else {
              resultDiv.innerHTML = '<strong>❌ Error:</strong> ' + result.error;
              resultDiv.className = 'result error';
            }
            resultDiv.style.display = 'block';
            
            // Scroll to result
            resultDiv.scrollIntoView({ behavior: 'smooth' });
            
          } catch (error) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<strong>❌ Network Error:</strong> ' + error.message;
            resultDiv.className = 'result error';
            resultDiv.style.display = 'block';
          }
        });
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

// Manage Products Page
app.get("/manage-products", (req, res) => {
  const query = `
    SELECT 
      p.product_id,
      p.product_name,
      p.product_url,
      pd.product_brief_description,
      pd.product_description,
      pd.product_img,
      pd.product_link,
      pp.starting_price,
      pp.price_range
    FROM products p
    LEFT JOIN product_description pd ON p.product_id = pd.product_id
    LEFT JOIN product_price pp ON p.product_id = pp.product_id
  `;
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error("Products retrieval error:", err);
      return res.status(500).send("Error retrieving products");
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Manage Products</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f0f2f5; }
          .container { max-width: 1200px; margin: 0 auto; }
          .nav { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          h1 { color: #333; margin: 0; }
          .nav-links { margin-top: 15px; }
          .nav-links a { margin-right: 15px; text-decoration: none; color: #007bff; }
          .nav-links a:hover { text-decoration: underline; }
          table { border-collapse: collapse; margin-bottom: 30px; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-radius: 5px; overflow: hidden; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .btn { 
            padding: 6px 12px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            text-decoration: none; 
            display: inline-block; 
            text-align: center;
            font-size: 14px;
          }
          .btn-edit { background: #ffc107; color: #212529; }
          .btn-delete { background: #dc3545; color: white; }
          .btn:hover { opacity: 0.8; }
          .actions { display: flex; gap: 5px; }
          .no-data { padding: 20px; background: white; border-radius: 5px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="nav">
            <h1>📦 Manage Products</h1>
            <div class="nav-links">
              <a href="/">🏠 Main Dashboard</a>
              <a href="/add-product-form">➕ Add New Product</a>
              <a href="/view">📊 View All Tables</a>
            </div>
          </div>

          <h2>Product List</h2>
          ${results.length > 0 ? `
            <table>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Brief Description</th>
                <th>Actions</th>
              </tr>
              ${results.map(product => `
                <tr>
                  <td>${product.product_id}</td>
                  <td>${product.product_name}</td>
                  <td>$${product.starting_price}</td>
                  <td>${product.product_brief_description || 'N/A'}</td>
                  <td class="actions">
                    <a href="/edit-product-form/${product.product_id}" class="btn btn-edit">✏️ Edit</a>
                    <a href="/delete-product/${product.product_id}" class="btn btn-delete" onclick="return confirm('Are you sure you want to delete this product?')">🗑️ Delete</a>
                  </td>
                </tr>
              `).join('')}
            </table>
          ` : `
            <div class="no-data">
              <p>No products found. <a href="/add-product-form">Add your first product</a></p>
            </div>
          `}
        </div>
      </body>
      </html>
    `;
    res.send(html);
  });
});

// Edit Product Form
app.get("/edit-product-form/:id", (req, res) => {
  const productId = req.params.id;
  
  const query = `
    SELECT 
      p.product_id,
      p.product_name,
      p.product_url,
      pd.product_brief_description,
      pd.product_description,
      pd.product_img,
      pd.product_link,
      pp.starting_price,
      pp.price_range
    FROM products p
    LEFT JOIN product_description pd ON p.product_id = pd.product_id
    LEFT JOIN product_price pp ON p.product_id = pp.product_id
    WHERE p.product_id = ?
  `;
  
  mysqlConnection.query(query, [productId], (err, results) => {
    if (err) {
      console.error("Product retrieval error:", err);
      return res.status(500).send("Error retrieving product");
    }
    
    if (results.length === 0) {
      return res.status(404).send("Product not found");
    }
    
    const product = results[0];
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Edit Product</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f0f2f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #333; text-align: center; margin-bottom: 30px; }
          form { margin-top: 20px; }
          label { display: block; margin: 15px 0 5px; font-weight: bold; color: #555; }
          input, textarea { 
            width: 100%; 
            padding: 12px; 
            border: 1px solid #ddd; 
            border-radius: 5px; 
            box-sizing: border-box; 
            font-size: 16px;
            margin-bottom: 10px;
          }
          input:focus, textarea:focus {
            border-color: #007bff;
            outline: none;
            box-shadow: 0 0 5px rgba(0,123,255,0.3);
          }
          button { 
            background: #007bff; 
            color: white; 
            padding: 15px 30px; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            margin-top: 20px; 
            font-size: 16px; 
            width: 100%;
            transition: background 0.3s;
          }
          button:hover { background: #0056b3; }
          .result { 
            margin-top: 20px; 
            padding: 15px; 
            border-radius: 5px; 
            display: none;
            text-align: center;
          }
          .success { 
            background: #d4edda; 
            color: #155724; 
            border: 1px solid #c3e6cb; 
          }
          .error { 
            background: #f8d7da; 
            color: #721c24; 
            border: 1px solid #f5c6cb; 
          }
          .back-link { 
            display: inline-block; 
            margin-top: 20px; 
            color: #007bff; 
            text-decoration: none; 
            text-align: center;
            width: 100%;
          }
          .back-link:hover { text-decoration: underline; }
          .form-group { margin-bottom: 20px; }
          .required::after { content: " *"; color: red; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✏️ Edit Product</h1>
          <form id="editProductForm">
            <input type="hidden" name="product_id" value="${product.product_id}">
            
            <div class="form-group">
              <label class="required">Product Name:</label>
              <input type="text" name="product_name" value="${product.product_name}" required>
            </div>
            
            <div class="form-group">
              <label class="required">Starting Price ($):</label>
              <input type="number" name="starting_price" value="${product.starting_price}" step="0.01" required>
            </div>
            
            <div class="form-group">
              <label>Price Range:</label>
              <input type="text" name="price_range" value="${product.price_range}">
            </div>
            
            <div class="form-group">
              <label>Brief Description:</label>
              <textarea name="product_brief_description" rows="3">${product.product_brief_description || ''}</textarea>
            </div>
            
            <div class="form-group">
              <label>Full Description:</label>
              <textarea name="product_description" rows="4">${product.product_description || ''}</textarea>
            </div>
            
            <div class="form-group">
              <label>Image URL:</label>
              <input type="text" name="product_img" value="${product.product_img}">
            </div>
            
            <div class="form-group">
              <label>Product Link:</label>
              <input type="text" name="product_link" value="${product.product_link}">
            </div>
            
            <button type="submit">Update Product</button>
          </form>
          
          <div id="result" class="result"></div>
          
          <a href="/manage-products" class="back-link">← Back to Manage Products</a>
        </div>

        <script>
          document.getElementById('editProductForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            try {
              const response = await fetch('/update-product', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
              });
              
              const result = await response.json();
              
              const resultDiv = document.getElementById('result');
              if (response.ok) {
                resultDiv.innerHTML = '<strong>✅ Success!</strong> ' + result.message;
                resultDiv.className = 'result success';
              } else {
                resultDiv.innerHTML = '<strong>❌ Error:</strong> ' + result.error;
                resultDiv.className = 'result error';
              }
              resultDiv.style.display = 'block';
              
              // Scroll to result
              resultDiv.scrollIntoView({ behavior: 'smooth' });
              
            } catch (error) {
              const resultDiv = document.getElementById('result');
              resultDiv.innerHTML = '<strong>❌ Network Error:</strong> ' + error.message;
              resultDiv.className = 'result error';
              resultDiv.style.display = 'block';
            }
          });
        </script>
      </body>
      </html>
    `;
    res.send(html);
  });
});

// ==================== USER ROUTES ====================

// Add User Form
app.get("/add-user-form", (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Add User</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f0f2f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; margin-bottom: 30px; }
        form { margin-top: 20px; }
        label { display: block; margin: 15px 0 5px; font-weight: bold; color: #555; }
        input { 
          width: 100%; 
          padding: 12px; 
          border: 1px solid #ddd; 
          border-radius: 5px; 
          box-sizing: border-box; 
          font-size: 16px;
          margin-bottom: 10px;
        }
        input:focus {
          border-color: #28a745;
          outline: none;
          box-shadow: 0 0 5px rgba(40,167,69,0.3);
        }
        button { 
          background: #28a745; 
          color: white; 
          padding: 15px 30px; 
          border: none; 
          border-radius: 5px; 
          cursor: pointer; 
          margin-top: 20px; 
          font-size: 16px; 
          width: 100%;
          transition: background 0.3s;
        }
        button:hover { background: #218838; }
        .result { 
          margin-top: 20px; 
          padding: 15px; 
          border-radius: 5px; 
          display: none;
          text-align: center;
        }
        .success { 
          background: #d4edda; 
          color: #155724; 
          border: 1px solid #c3e6cb; 
        }
        .error { 
          background: #f8d7da; 
          color: #721c24; 
          border: 1px solid #f5c6cb; 
        }
        .back-link { 
          display: inline-block; 
          margin-top: 20px; 
          color: #007bff; 
          text-decoration: none; 
          text-align: center;
          width: 100%;
        }
        .back-link:hover { text-decoration: underline; }
        .form-group { margin-bottom: 20px; }
        .required::after { content: " *"; color: red; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>👥 Add New User</h1>
        <form id="userForm">
          <div class="form-group">
            <label class="required">User Name:</label>
            <input type="text" name="user_name" required placeholder="Enter user name">
          </div>
          
          <div class="form-group">
            <label class="required">Email:</label>
            <input type="email" name="user_email" required placeholder="Enter email address">
          </div>
          
          <div class="form-group">
            <label class="required">Password:</label>
            <input type="password" name="user_password" required placeholder="Enter password">
          </div>
          
          <button type="submit">Add User</button>
        </form>
        
        <div id="result" class="result"></div>
        
        <a href="/" class="back-link">← Back to Dashboard</a>
        <a href="/manage-users" class="back-link">👥 Manage Users →</a>
      </div>

      <script>
        document.getElementById('userForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const formData = new FormData(this);
          const data = Object.fromEntries(formData);
          
          try {
            const response = await fetch('/add-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            const resultDiv = document.getElementById('result');
            if (response.ok) {
              resultDiv.innerHTML = '<strong>✅ Success!</strong> ' + result.message + 
                (result.userId ? '<br>User ID: ' + result.userId : '');
              resultDiv.className = 'result success';
              
              // CLEAR THE FORM AFTER SUCCESSFUL SUBMISSION
              document.getElementById('userForm').reset();
              
            } else {
              resultDiv.innerHTML = '<strong>❌ Error:</strong> ' + result.error;
              resultDiv.className = 'result error';
            }
            resultDiv.style.display = 'block';
            
            // Scroll to result
            resultDiv.scrollIntoView({ behavior: 'smooth' });
            
          } catch (error) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<strong>❌ Network Error:</strong> ' + error.message;
            resultDiv.className = 'result error';
            resultDiv.style.display = 'block';
          }
        });
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

// Manage Users Page
app.get("/manage-users", (req, res) => {
  mysqlConnection.query("SELECT user_id, user_name, user_email, created_at FROM users", (err, results) => {
    if (err) {
      console.error("Users retrieval error:", err);
      return res.status(500).send("Error retrieving users");
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Manage Users</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f0f2f5; }
          .container { max-width: 1200px; margin: 0 auto; }
          .nav { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          h1 { color: #333; margin: 0; }
          .nav-links { margin-top: 15px; }
          .nav-links a { margin-right: 15px; text-decoration: none; color: #007bff; }
          .nav-links a:hover { text-decoration: underline; }
          table { border-collapse: collapse; margin-bottom: 30px; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-radius: 5px; overflow: hidden; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .btn { 
            padding: 6px 12px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            text-decoration: none; 
            display: inline-block; 
            text-align: center;
            font-size: 14px;
          }
          .btn-edit { background: #ffc107; color: #212529; }
          .btn-delete { background: #dc3545; color: white; }
          .btn:hover { opacity: 0.8; }
          .actions { display: flex; gap: 5px; }
          .no-data { padding: 20px; background: white; border-radius: 5px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="nav">
            <h1>👥 Manage Users</h1>
            <div class="nav-links">
              <a href="/">🏠 Main Dashboard</a>
              <a href="/add-user-form">➕ Add New User</a>
              <a href="/view">📊 View All Tables</a>
            </div>
          </div>

          <h2>User List</h2>
          ${results.length > 0 ? `
            <table>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
              ${results.map(user => `
                <tr>
                  <td>${user.user_id}</td>
                  <td>${user.user_name}</td>
                  <td>${user.user_email}</td>
                  <td>${new Date(user.created_at).toLocaleDateString()}</td>
                  <td class="actions">
                    <a href="/edit-user-form/${user.user_id}" class="btn btn-edit">✏️ Edit</a>
                    <a href="/delete-user/${user.user_id}" class="btn btn-delete" onclick="return confirm('Are you sure you want to delete this user?')">🗑️ Delete</a>
                  </td>
                </tr>
              `).join('')}
            </table>
          ` : `
            <div class="no-data">
              <p>No users found. <a href="/add-user-form">Add your first user</a></p>
            </div>
          `}
        </div>
      </body>
      </html>
    `;
    res.send(html);
  });
});

// Edit User Form
app.get("/edit-user-form/:id", (req, res) => {
  const userId = req.params.id;
  
  mysqlConnection.query("SELECT * FROM users WHERE user_id = ?", [userId], (err, results) => {
    if (err) {
      console.error("User retrieval error:", err);
      return res.status(500).send("Error retrieving user");
    }
    
    if (results.length === 0) {
      return res.status(404).send("User not found");
    }
    
    const user = results[0];
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Edit User</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f0f2f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #333; text-align: center; margin-bottom: 30px; }
          form { margin-top: 20px; }
          label { display: block; margin: 15px 0 5px; font-weight: bold; color: #555; }
          input { 
            width: 100%; 
            padding: 12px; 
            border: 1px solid #ddd; 
            border-radius: 5px; 
            box-sizing: border-box; 
            font-size: 16px;
            margin-bottom: 10px;
          }
          input:focus {
            border-color: #28a745;
            outline: none;
            box-shadow: 0 0 5px rgba(40,167,69,0.3);
          }
          button { 
            background: #28a745; 
            color: white; 
            padding: 15px 30px; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            margin-top: 20px; 
            font-size: 16px; 
            width: 100%;
            transition: background 0.3s;
          }
          button:hover { background: #218838; }
          .result { 
            margin-top: 20px; 
            padding: 15px; 
            border-radius: 5px; 
            display: none;
            text-align: center;
          }
          .success { 
            background: #d4edda; 
            color: #155724; 
            border: 1px solid #c3e6cb; 
          }
          .error { 
            background: #f8d7da; 
            color: #721c24; 
            border: 1px solid #f5c6cb; 
          }
          .back-link { 
            display: inline-block; 
            margin-top: 20px; 
            color: #007bff; 
            text-decoration: none; 
            text-align: center;
            width: 100%;
          }
          .back-link:hover { text-decoration: underline; }
          .form-group { margin-bottom: 20px; }
          .required::after { content: " *"; color: red; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✏️ Edit User</h1>
          <form id="editUserForm">
            <input type="hidden" name="user_id" value="${user.user_id}">
            
            <div class="form-group">
              <label class="required">User Name:</label>
              <input type="text" name="user_name" value="${user.user_name}" required>
            </div>
            
            <div class="form-group">
              <label class="required">Email:</label>
              <input type="email" name="user_email" value="${user.user_email}" required>
            </div>
            
            <div class="form-group">
              <label class="required">Password:</label>
              <input type="password" name="user_password" value="${user.user_password}" required>
            </div>
            
            <button type="submit">Update User</button>
          </form>
          
          <div id="result" class="result"></div>
          
          <a href="/manage-users" class="back-link">← Back to Manage Users</a>
        </div>

        <script>
          document.getElementById('editUserForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            try {
              const response = await fetch('/update-user', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
              });
              
              const result = await response.json();
              
              const resultDiv = document.getElementById('result');
              if (response.ok) {
                resultDiv.innerHTML = '<strong>✅ Success!</strong> ' + result.message;
                resultDiv.className = 'result success';
              } else {
                resultDiv.innerHTML = '<strong>❌ Error:</strong> ' + result.error;
                resultDiv.className = 'result error';
              }
              resultDiv.style.display = 'block';
              
              // Scroll to result
              resultDiv.scrollIntoView({ behavior: 'smooth' });
              
            } catch (error) {
              const resultDiv = document.getElementById('result');
              resultDiv.innerHTML = '<strong>❌ Network Error:</strong> ' + error.message;
              resultDiv.className = 'result error';
              resultDiv.style.display = 'block';
            }
          });
        </script>
      </body>
      </html>
    `;
    res.send(html);
  });
});

// ==================== ORDER ROUTES ====================

// Add Order Form
app.get("/add-order-form", (req, res) => {
  // First, get users and products for dropdowns
  mysqlConnection.query("SELECT user_id, user_name FROM users", (err, users) => {
    if (err) {
      console.error("Error fetching users:", err);
      users = [];
    }
    
    mysqlConnection.query("SELECT product_id, product_name FROM products", (err, products) => {
      if (err) {
        console.error("Error fetching products:", err);
        products = [];
      }
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Add Order</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f0f2f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; text-align: center; margin-bottom: 30px; }
            form { margin-top: 20px; }
            label { display: block; margin: 15px 0 5px; font-weight: bold; color: #555; }
            select, input { 
              width: 100%; 
              padding: 12px; 
              border: 1px solid #ddd; 
              border-radius: 5px; 
              box-sizing: border-box; 
              font-size: 16px;
              margin-bottom: 10px;
            }
            select:focus, input:focus {
              border-color: #ffc107;
              outline: none;
              box-shadow: 0 0 5px rgba(255,193,7,0.3);
            }
            button { 
              background: #ffc107; 
              color: #212529; 
              padding: 15px 30px; 
              border: none; 
              border-radius: 5px; 
              cursor: pointer; 
              margin-top: 20px; 
              font-size: 16px; 
              width: 100%;
              transition: background 0.3s;
              font-weight: bold;
            }
            button:hover { background: #e0a800; }
            .result { 
              margin-top: 20px; 
              padding: 15px; 
              border-radius: 5px; 
              display: none;
              text-align: center;
            }
            .success { 
              background: #d4edda; 
              color: #155724; 
              border: 1px solid #c3e6cb; 
            }
            .error { 
              background: #f8d7da; 
              color: #721c24; 
              border: 1px solid #f5c6cb; 
            }
            .back-link { 
              display: inline-block; 
              margin-top: 20px; 
              color: #007bff; 
              text-decoration: none; 
              text-align: center;
              width: 100%;
            }
            .back-link:hover { text-decoration: underline; }
            .form-group { margin-bottom: 20px; }
            .required::after { content: " *"; color: red; }
            .info { 
              background: #d1ecf1; 
              color: #0c5460; 
              padding: 10px; 
              border-radius: 5px; 
              margin-bottom: 20px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🛒 Create New Order</h1>
            
            ${users.length === 0 || products.length === 0 ? `
              <div class="info">
                <strong>ℹ️ Note:</strong> You need to have at least one user and one product to create an order.
                <br><a href="/add-user-form">Add User</a> | <a href="/add-product-form">Add Product</a>
              </div>
            ` : ''}
            
            <form id="orderForm">
              <div class="form-group">
                <label class="required">Select User:</label>
                <select name="user_id" required>
                  <option value="">Select a user</option>
                  ${users.map(user => `<option value="${user.user_id}">${user.user_name} (ID: ${user.user_id})</option>`).join('')}
                </select>
              </div>
              
              <div class="form-group">
                <label class="required">Select Product:</label>
                <select name="product_id" required>
                  <option value="">Select a product</option>
                  ${products.map(product => `<option value="${product.product_id}">${product.product_name} (ID: ${product.product_id})</option>`).join('')}
                </select>
              </div>
              
              <div class="form-group">
                <label>Quantity:</label>
                <input type="number" name="quantity" value="1" min="1" placeholder="Enter quantity">
              </div>
              
              <div class="form-group">
                <label>Order Status:</label>
                <select name="status">
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <button type="submit" ${users.length === 0 || products.length === 0 ? 'disabled' : ''}>Create Order</button>
            </form>
            
            <div id="result" class="result"></div>
            
            <a href="/" class="back-link">← Back to Dashboard</a>
            <a href="/manage-orders" class="back-link">🛒 Manage Orders →</a>
          </div>

          <script>
            document.getElementById('orderForm').addEventListener('submit', async function(e) {
              e.preventDefault();
              
              const formData = new FormData(this);
              const data = Object.fromEntries(formData);
              
              try {
                const response = await fetch('/add-order', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                const resultDiv = document.getElementById('result');
                if (response.ok) {
                  resultDiv.innerHTML = '<strong>✅ Success!</strong> ' + result.message + 
                    (result.orderId ? '<br>Order ID: ' + result.orderId : '');
                  resultDiv.className = 'result success';
                  
                  // CLEAR THE FORM AFTER SUCCESSFUL SUBMISSION
                  document.getElementById('orderForm').reset();
                  
                } else {
                  resultDiv.innerHTML = '<strong>❌ Error:</strong> ' + result.error;
                  resultDiv.className = 'result error';
                }
                resultDiv.style.display = 'block';
                
                // Scroll to result
                resultDiv.scrollIntoView({ behavior: 'smooth' });
                
              } catch (error) {
                const resultDiv = document.getElementById('result');
                resultDiv.innerHTML = '<strong>❌ Network Error:</strong> ' + error.message;
                resultDiv.className = 'result error';
                resultDiv.style.display = 'block';
              }
            });
          </script>
        </body>
        </html>
      `;
      res.send(html);
    });
  });
});

// Manage Orders Page
app.get("/manage-orders", (req, res) => {
  const query = `
    SELECT 
      o.order_id,
      o.quantity,
      o.status,
      o.order_date,
      u.user_name,
      u.user_id,
      p.product_name,
      p.product_id
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.user_id
    LEFT JOIN products p ON o.product_id = p.product_id
  `;
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error("Orders retrieval error:", err);
      return res.status(500).send("Error retrieving orders");
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Manage Orders</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f0f2f5; }
          .container { max-width: 1200px; margin: 0 auto; }
          .nav { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          h1 { color: #333; margin: 0; }
          .nav-links { margin-top: 15px; }
          .nav-links a { margin-right: 15px; text-decoration: none; color: #007bff; }
          .nav-links a:hover { text-decoration: underline; }
          table { border-collapse: collapse; margin-bottom: 30px; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-radius: 5px; overflow: hidden; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .btn { 
            padding: 6px 12px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            text-decoration: none; 
            display: inline-block; 
            text-align: center;
            font-size: 14px;
          }
          .btn-edit { background: #ffc107; color: #212529; }
          .btn-delete { background: #dc3545; color: white; }
          .btn:hover { opacity: 0.8; }
          .actions { display: flex; gap: 5px; }
          .no-data { padding: 20px; background: white; border-radius: 5px; text-align: center; color: #666; }
          .status-pending { color: #856404; background: #fff3cd; padding: 4px 8px; border-radius: 4px; }
          .status-completed { color: #155724; background: #d4edda; padding: 4px 8px; border-radius: 4px; }
          .status-cancelled { color: #721c24; background: #f8d7da; padding: 4px 8px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="nav">
            <h1>🛒 Manage Orders</h1>
            <div class="nav-links">
              <a href="/">🏠 Main Dashboard</a>
              <a href="/add-order-form">➕ Add New Order</a>
              <a href="/view">📊 View All Tables</a>
            </div>
          </div>

          <h2>Order List</h2>
          ${results.length > 0 ? `
            <table>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Order Date</th>
                <th>Actions</th>
              </tr>
              ${results.map(order => `
                <tr>
                  <td>${order.order_id}</td>
                  <td>${order.user_name} (ID: ${order.user_id})</td>
                  <td>${order.product_name} (ID: ${order.product_id})</td>
                  <td>${order.quantity}</td>
                  <td><span class="status-${order.status}">${order.status}</span></td>
                  <td>${new Date(order.order_date).toLocaleDateString()}</td>
                  <td class="actions">
                    <a href="/edit-order-form/${order.order_id}" class="btn btn-edit">✏️ Edit</a>
                    <a href="/delete-order/${order.order_id}" class="btn btn-delete" onclick="return confirm('Are you sure you want to delete this order?')">🗑️ Delete</a>
                  </td>
                </tr>
              `).join('')}
            </table>
          ` : `
            <div class="no-data">
              <p>No orders found. <a href="/add-order-form">Create your first order</a></p>
            </div>
          `}
        </div>
      </body>
      </html>
    `;
    res.send(html);
  });
});

// Edit Order Form
app.get("/edit-order-form/:id", (req, res) => {
  const orderId = req.params.id;
  
  // Get the order details
  const orderQuery = `
    SELECT 
      o.order_id,
      o.user_id,
      o.product_id,
      o.quantity,
      o.status,
      u.user_name,
      p.product_name
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.user_id
    LEFT JOIN products p ON o.product_id = p.product_id
    WHERE o.order_id = ?
  `;
  
  mysqlConnection.query(orderQuery, [orderId], (err, orderResults) => {
    if (err) {
      console.error("Order retrieval error:", err);
      return res.status(500).send("Error retrieving order");
    }
    
    if (orderResults.length === 0) {
      return res.status(404).send("Order not found");
    }
    
    const order = orderResults[0];
    
    // Get users and products for dropdowns
    mysqlConnection.query("SELECT user_id, user_name FROM users", (err, users) => {
      if (err) {
        console.error("Error fetching users:", err);
        users = [];
      }
      
      mysqlConnection.query("SELECT product_id, product_name FROM products", (err, products) => {
        if (err) {
          console.error("Error fetching products:", err);
          products = [];
        }
        
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Edit Order</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; background: #f0f2f5; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              h1 { color: #333; text-align: center; margin-bottom: 30px; }
              form { margin-top: 20px; }
              label { display: block; margin: 15px 0 5px; font-weight: bold; color: #555; }
              select, input { 
                width: 100%; 
                padding: 12px; 
                border: 1px solid #ddd; 
                border-radius: 5px; 
                box-sizing: border-box; 
                font-size: 16px;
                margin-bottom: 10px;
              }
              select:focus, input:focus {
                border-color: #ffc107;
                outline: none;
                box-shadow: 0 0 5px rgba(255,193,7,0.3);
              }
              button { 
                background: #ffc107; 
                color: #212529; 
                padding: 15px 30px; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer; 
                margin-top: 20px; 
                font-size: 16px; 
                width: 100%;
                transition: background 0.3s;
                font-weight: bold;
              }
              button:hover { background: #e0a800; }
              .result { 
                margin-top: 20px; 
                padding: 15px; 
                border-radius: 5px; 
                display: none;
                text-align: center;
              }
              .success { 
                background: #d4edda; 
                color: #155724; 
                border: 1px solid #c3e6cb; 
              }
              .error { 
                background: #f8d7da; 
                color: #721c24; 
                border: 1px solid #f5c6cb; 
              }
              .back-link { 
                display: inline-block; 
                margin-top: 20px; 
                color: #007bff; 
                text-decoration: none; 
                text-align: center;
                width: 100%;
              }
              .back-link:hover { text-decoration: underline; }
              .form-group { margin-bottom: 20px; }
              .required::after { content: " *"; color: red; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✏️ Edit Order</h1>
              <form id="editOrderForm">
                <input type="hidden" name="order_id" value="${order.order_id}">
                
                <div class="form-group">
                  <label class="required">Select User:</label>
                  <select name="user_id" required>
                    <option value="">Select a user</option>
                    ${users.map(user => `<option value="${user.user_id}" ${user.user_id == order.user_id ? 'selected' : ''}>${user.user_name} (ID: ${user.user_id})</option>`).join('')}
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="required">Select Product:</label>
                  <select name="product_id" required>
                    <option value="">Select a product</option>
                    ${products.map(product => `<option value="${product.product_id}" ${product.product_id == order.product_id ? 'selected' : ''}>${product.product_name} (ID: ${product.product_id})</option>`).join('')}
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Quantity:</label>
                  <input type="number" name="quantity" value="${order.quantity}" min="1">
                </div>
                
                <div class="form-group">
                  <label>Order Status:</label>
                  <select name="status">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                  </select>
                </div>
                
                <button type="submit">Update Order</button>
              </form>
              
              <div id="result" class="result"></div>
              
              <a href="/manage-orders" class="back-link">← Back to Manage Orders</a>
            </div>

            <script>
              document.getElementById('editOrderForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const data = Object.fromEntries(formData);
                
                try {
                  const response = await fetch('/update-order', {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                  });
                  
                  const result = await response.json();
                  
                  const resultDiv = document.getElementById('result');
                  if (response.ok) {
                    resultDiv.innerHTML = '<strong>✅ Success!</strong> ' + result.message;
                    resultDiv.className = 'result success';
                  } else {
                    resultDiv.innerHTML = '<strong>❌ Error:</strong> ' + result.error;
                    resultDiv.className = 'result error';
                  }
                  resultDiv.style.display = 'block';
                  
                  // Scroll to result
                  resultDiv.scrollIntoView({ behavior: 'smooth' });
                  
                } catch (error) {
                  const resultDiv = document.getElementById('result');
                  resultDiv.innerHTML = '<strong>❌ Network Error:</strong> ' + error.message;
                  resultDiv.className = 'result error';
                  resultDiv.style.display = 'block';
                }
              });
            </script>
          </body>
          </html>
        `;
        res.send(html);
      });
    });
  });
});

// ==================== DATABASE VIEWER ====================

// Database Viewer with Update/Delete buttons
app.get("/view", (req, res) => {
  const tables = ["products", "product_description", "product_price", "users", "orders"];
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Database Tables</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f0f2f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .nav { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        h1 { color: #333; margin: 0; }
        .nav-links { margin-top: 15px; }
        .nav-links a { margin-right: 15px; text-decoration: none; color: #007bff; }
        .nav-links a:hover { text-decoration: underline; }
        table { border-collapse: collapse; margin-bottom: 30px; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-radius: 5px; overflow: hidden; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        h2 { color: #666; margin-top: 30px; margin-bottom: 15px; }
        .no-data { padding: 20px; background: white; border-radius: 5px; text-align: center; color: #666; }
        .table-count { color: #888; font-size: 14px; margin-bottom: 10px; }
        .password-masked { color: #999; font-style: italic; }
        .btn { 
          padding: 6px 12px; 
          border: none; 
          border-radius: 4px; 
          cursor: pointer; 
          text-decoration: none; 
          display: inline-block; 
          text-align: center;
          font-size: 14px;
        }
        .btn-edit { background: #ffc107; color: #212529; }
        .btn-delete { background: #dc3545; color: white; }
        .btn:hover { opacity: 0.8; }
        .actions { display: flex; gap: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="nav">
          <h1>📊 Database Tables Viewer</h1>
          <div class="nav-links">
            <a href="/">🏠 Main Dashboard</a>
            <a href="/add-product-form">➕ Add Product</a>
            <a href="/add-user-form">👥 Add User</a>
            <a href="/add-order-form">🛒 Add Order</a>
            <a href="/manage-products">📦 Manage Products</a>
            <a href="/manage-users">👥 Manage Users</a>
            <a href="/manage-orders">🛒 Manage Orders</a>
          </div>
        </div>
  `;

  function renderTable(index = 0) {
    if (index >= tables.length) {
      html += `</div></body></html>`;
      return res.send(html);
    }

    mysqlConnection.query(`SELECT * FROM ${tables[index]}`, (err, results) => {
      if (err) {
        html += `<div class="no-data" style="color: red;">Error retrieving ${tables[index]}: ${err.message}</div>`;
      } else {
        html += `<h2>${tables[index]}</h2>`;
        html += `<div class="table-count">Total records: ${results.length}</div>`;
        
        if (results.length > 0) {
          html += "<table><tr>";
          Object.keys(results[0]).forEach(col => html += `<th>${col}</th>`);
          // Add Actions column header
          html += `<th>Actions</th>`;
          html += "</tr>";
          
          results.forEach(row => {
            html += "<tr>";
            Object.entries(row).forEach(([key, val]) => {
              let displayVal = val;
              if (val === null) displayVal = '<em style="color: #999;">NULL</em>';
              else if (val === '') displayVal = '<em style="color: #999;">Empty</em>';
              else if (key === 'user_password') displayVal = '<span class="password-masked">••••••••</span>';
              html += `<td>${displayVal}</td>`;
            });
            
            // Add action buttons based on table type
            let editUrl = '#';
            let deleteUrl = '#';
            let idField = '';
            
            if (tables[index] === 'products') {
              idField = 'product_id';
              editUrl = `/edit-product-form/${row.product_id}`;
              deleteUrl = `/delete-product/${row.product_id}`;
            } else if (tables[index] === 'users') {
              idField = 'user_id';
              editUrl = `/edit-user-form/${row.user_id}`;
              deleteUrl = `/delete-user/${row.user_id}`;
            } else if (tables[index] === 'orders') {
              idField = 'order_id';
              editUrl = `/edit-order-form/${row.order_id}`;
              deleteUrl = `/delete-order/${row.order_id}`;
            }
            
            if (idField) {
              html += `<td class="actions">
                <a href="${editUrl}" class="btn btn-edit">✏️ Edit</a>
                <a href="${deleteUrl}" class="btn btn-delete" onclick="return confirm('Are you sure you want to delete this record?')">🗑️ Delete</a>
              </td>`;
            } else {
              html += `<td>No actions</td>`;
            }
            
            html += "</tr>";
          });
          html += "</table>";
        } else {
          html += `<div class="no-data">No data found in ${tables[index]} table</div>`;
        }
      }
      
      renderTable(index + 1);
    });
  }

  renderTable();
});

// ==================== API ENDPOINTS ====================

// Add Product API
app.post("/add-product", (req, res) => {
  const { 
    product_name, 
    product_brief_description, 
    product_description, 
    product_img, 
    product_link, 
    starting_price, 
    price_range
  } = req.body;

  if (!product_name || !starting_price) {
    return res.status(400).json({ error: "Product name and starting price are required" });
  }

  mysqlConnection.query(
    "INSERT INTO products (product_url, product_name) VALUES (?, ?)",
    ["http://localhost:3001/products", product_name],
    (err, productResult) => {
      if (err) {
        console.error("Product insertion error:", err);
        return res.status(500).json({ error: "Failed to insert product" });
      }
      
      const productId = productResult.insertId;

      mysqlConnection.query(
        "INSERT INTO product_description (product_id, product_brief_description, product_description, product_img, product_link) VALUES (?, ?, ?, ?, ?)",
        [productId, product_brief_description || "No description", product_description || "No description", product_img || "default.jpg", product_link || "http://localhost:3001/products"],
        (err) => {
          if (err) {
            console.error("Description insertion error:", err);
            return res.status(500).json({ error: "Failed to insert product description" });
          }

          mysqlConnection.query(
            "INSERT INTO product_price (product_id, starting_price, price_range) VALUES (?, ?, ?)",
            [productId, starting_price, price_range || "Not specified"],
            (err) => {
              if (err) {
                console.error("Price insertion error:", err);
                return res.status(500).json({ error: "Failed to insert product price" });
              }

              res.json({ 
                message: "Product inserted successfully! Form has been cleared.",
                productId 
              });
            }
          );
        }
      );
    }
  );
});

// Update Product API
app.put("/update-product", (req, res) => {
  const { 
    product_id,
    product_name, 
    product_brief_description, 
    product_description, 
    product_img, 
    product_link, 
    starting_price, 
    price_range
  } = req.body;

  if (!product_id || !product_name || !starting_price) {
    return res.status(400).json({ error: "Product ID, name and starting price are required" });
  }

  // Update products table
  mysqlConnection.query(
    "UPDATE products SET product_name = ? WHERE product_id = ?",
    [product_name, product_id],
    (err) => {
      if (err) {
        console.error("Product update error:", err);
        return res.status(500).json({ error: "Failed to update product" });
      }

      // Update product_description table
      mysqlConnection.query(
        "UPDATE product_description SET product_brief_description = ?, product_description = ?, product_img = ?, product_link = ? WHERE product_id = ?",
        [product_brief_description || "No description", product_description || "No description", product_img || "default.jpg", product_link || "http://localhost:3001/products", product_id],
        (err) => {
          if (err) {
            console.error("Description update error:", err);
            return res.status(500).json({ error: "Failed to update product description" });
          }

          // Update product_price table
          mysqlConnection.query(
            "UPDATE product_price SET starting_price = ?, price_range = ? WHERE product_id = ?",
            [starting_price, price_range || "Not specified", product_id],
            (err) => {
              if (err) {
                console.error("Price update error:", err);
                return res.status(500).json({ error: "Failed to update product price" });
              }

              res.json({ 
                message: "Product updated successfully!"
              });
            }
          );
        }
      );
    }
  );
});

// Delete Product API
app.get("/delete-product/:id", (req, res) => {
  const productId = req.params.id;
  
  mysqlConnection.query("DELETE FROM products WHERE product_id = ?", [productId], (err) => {
    if (err) {
      console.error("Product deletion error:", err);
      return res.redirect("/manage-products?error=Failed to delete product");
    }
    
    res.redirect("/manage-products?success=Product deleted successfully");
  });
});

// Add User API
app.post("/add-user", (req, res) => {
  const { 
    user_name, 
    user_email, 
    user_password 
  } = req.body;

  if (!user_name || !user_email || !user_password) {
    return res.status(400).json({ error: "User name, email, and password are required" });
  }

  mysqlConnection.query(
    "INSERT INTO users (user_name, user_email, user_password) VALUES (?, ?, ?)",
    [user_name, user_email, user_password],
    (err, result) => {
      if (err) {
        console.error("User insertion error:", err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: "Failed to insert user" });
      }
      
      res.json({ 
        message: "User registered successfully! Form has been cleared.",
        userId: result.insertId
      });
    }
  );
});

// Update User API
app.put("/update-user", (req, res) => {
  const { 
    user_id,
    user_name, 
    user_email, 
    user_password 
  } = req.body;

  if (!user_id || !user_name || !user_email || !user_password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  mysqlConnection.query(
    "UPDATE users SET user_name = ?, user_email = ?, user_password = ? WHERE user_id = ?",
    [user_name, user_email, user_password, user_id],
    (err) => {
      if (err) {
        console.error("User update error:", err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: "Failed to update user" });
      }
      
      res.json({ 
        message: "User updated successfully!"
      });
    }
  );
});

// Delete User API
app.get("/delete-user/:id", (req, res) => {
  const userId = req.params.id;
  
  mysqlConnection.query("DELETE FROM users WHERE user_id = ?", [userId], (err) => {
    if (err) {
      console.error("User deletion error:", err);
      return res.redirect("/manage-users?error=Failed to delete user");
    }
    
    res.redirect("/manage-users?success=User deleted successfully");
  });
});

// Add Order API
app.post("/add-order", (req, res) => {
  const { 
    user_id, 
    product_id, 
    quantity,
    status
  } = req.body;

  if (!user_id || !product_id) {
    return res.status(400).json({ error: "User and Product are required" });
  }

  mysqlConnection.query(
    "INSERT INTO orders (user_id, product_id, quantity, status) VALUES (?, ?, ?, ?)",
    [user_id, product_id, quantity || 1, status || 'pending'],
    (err, result) => {
      if (err) {
        console.error("Order insertion error:", err);
        return res.status(500).json({ error: "Failed to create order" });
      }
      
      res.json({ 
        message: "Order created successfully! Form has been cleared.",
        orderId: result.insertId
      });
    }
  );
});

// Update Order API
app.put("/update-order", (req, res) => {
  const { 
    order_id,
    user_id, 
    product_id, 
    quantity,
    status
  } = req.body;

  if (!order_id || !user_id || !product_id) {
    return res.status(400).json({ error: "Order ID, User and Product are required" });
  }

  mysqlConnection.query(
    "UPDATE orders SET user_id = ?, product_id = ?, quantity = ?, status = ? WHERE order_id = ?",
    [user_id, product_id, quantity || 1, status || 'pending', order_id],
    (err) => {
      if (err) {
        console.error("Order update error:", err);
        return res.status(500).json({ error: "Failed to update order" });
      }
      
      res.json({ 
        message: "Order updated successfully!"
      });
    }
  );
});

// Delete Order API
app.get("/delete-order/:id", (req, res) => {
  const orderId = req.params.id;
  
  mysqlConnection.query("DELETE FROM orders WHERE order_id = ?", [orderId], (err) => {
    if (err) {
      console.error("Order deletion error:", err);
      return res.redirect("/manage-orders?error=Failed to delete order");
    }
    
    res.redirect("/manage-orders?success=Order deleted successfully");
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  🚀 Server running successfully!
  
  🔗 YOUR LINKS:
  📊 ${BASE_URL}/view - Database Tables Viewer (with Update/Delete buttons)
  🏠 ${BASE_URL} - Main Dashboard
  ➕ ${BASE_URL}/add-product-form - Add Product Form
  👥 ${BASE_URL}/add-user-form - Add User Form
  🛒 ${BASE_URL}/add-order-form - Add Order Form
  📦 ${BASE_URL}/manage-products - Manage Products (Update/Delete)
  👥 ${BASE_URL}/manage-users - Manage Users (Update/Delete)
  🛒 ${BASE_URL}/manage-orders - Manage Orders (Update/Delete)

  ⚡ Simply click the links above or copy them into your browser!
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  mysqlConnection.end();
  process.exit(0);
=======
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

// MySQL Database Connection
const mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "myDBuser",
  password: "myDBuser",
  database: "myDB",
  port: 3306
});

// Connect to MySQL
mysqlConnection.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection error:", err);
    return;
  }
  console.log("✅ Connected to MySQL database");
  createTablesSequentially();
});

// Table creation queries
const tableQueries = [
  `CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_url VARCHAR(200),
    product_name VARCHAR(100)
  )`,
  `CREATE TABLE IF NOT EXISTS product_description (
    description_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    product_brief_description VARCHAR(255) NOT NULL,
    product_description VARCHAR(255) NOT NULL,
    product_img VARCHAR(255) NOT NULL,
    product_link VARCHAR(255) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS product_price (
    price_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    starting_price DECIMAL(10,2) NOT NULL,
    price_range VARCHAR(255) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(100) NOT NULL UNIQUE,
    user_password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
  )`
];

// Create tables sequentially
function createTablesSequentially() {
  tableQueries.forEach((query, index) => {
    mysqlConnection.query(query, (err) => {
      if (err) {
        console.error(`❌ Table creation error for query ${index + 1}:`, err);
      } else {
        console.log(`✅ Table ${index + 1} created/verified successfully`);
      }
    });
  });
}

// ==================== ROUTES ====================

// 1. Main Dashboard
app.get("/", (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>MySQL Database API</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f0f2f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .status { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .links { display: grid; grid-template-columns: 1fr; gap: 15px; margin: 30px 0; }
        .link-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; text-decoration: none; color: #333; transition: transform 0.2s; }
        .link-card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); background: #e3f2fd; }
        .link-title { font-weight: bold; color: #007bff; margin-bottom: 8px; font-size: 18px; }
        .link-url { color: #666; font-size: 14px; }
        .link-description { color: #888; margin-top: 5px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 MySQL Database Dashboard</h1>
        
        <div class="status">
          <strong>✅ Database Status:</strong> Connected successfully to MySQL database
        </div>

        <h2>🔗 Available Pages:</h2>
        <div class="links">
          <a href="/view" class="link-card">
            <div class="link-title">📊 Database Tables Viewer</div>
            <div class="link-url">${BASE_URL}/view</div>
            <div class="link-description">View all data with Update and Delete buttons</div>
          </a>
          
          <a href="/add-product-form" class="link-card">
            <div class="link-title">➕ Add Product Form</div>
            <div class="link-url">${BASE_URL}/add-product-form</div>
            <div class="link-description">Add new products to the database</div>
          </a>

          <a href="/add-user-form" class="link-card">
            <div class="link-title">👥 Add User Form</div>
            <div class="link-url">${BASE_URL}/add-user-form</div>
            <div class="link-description">Register new users in the system</div>
          </a>

          <a href="/add-order-form" class="link-card">
            <div class="link-title">🛒 Add Order Form</div>
            <div class="link-url">${BASE_URL}/add-order-form</div>
            <div class="link-description">Create new orders linking users and products</div>
          </a>

          <a href="/manage-products" class="link-card">
            <div class="link-title">📦 Manage Products</div>
            <div class="link-url">${BASE_URL}/manage-products</div>
            <div class="link-description">Update and Delete existing products</div>
          </a>

          <a href="/manage-users" class="link-card">
            <div class="link-title">👥 Manage Users</div>
            <div class="link-url">${BASE_URL}/manage-users</div>
            <div class="link-description">Update and Delete existing users</div>
          </a>

          <a href="/manage-orders" class="link-card">
            <div class="link-title">🛒 Manage Orders</div>
            <div class="link-url">${BASE_URL}/manage-orders</div>
            <div class="link-description">Update and Delete existing orders</div>
          </a>
        </div>

        <div style="margin-top: 30px; padding: 15px; background: #e7f3ff; border-radius: 5px;">
          <strong>💡 Tip:</strong> Your database is running on <strong>localhost:3306</strong> with database name <strong>myDB</strong>
        </div>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

// ==================== PRODUCT ROUTES ====================

// Add Product Form
app.get("/add-product-form", (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Add Product</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f0f2f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; margin-bottom: 30px; }
        form { margin-top: 20px; }
        label { display: block; margin: 15px 0 5px; font-weight: bold; color: #555; }
        input, textarea { 
          width: 100%; 
          padding: 12px; 
          border: 1px solid #ddd; 
          border-radius: 5px; 
          box-sizing: border-box; 
          font-size: 16px;
          margin-bottom: 10px;
        }
        input:focus, textarea:focus {
          border-color: #007bff;
          outline: none;
          box-shadow: 0 0 5px rgba(0,123,255,0.3);
        }
        button { 
          background: #007bff; 
          color: white; 
          padding: 15px 30px; 
          border: none; 
          border-radius: 5px; 
          cursor: pointer; 
          margin-top: 20px; 
          font-size: 16px; 
          width: 100%;
          transition: background 0.3s;
        }
        button:hover { background: #0056b3; }
        .result { 
          margin-top: 20px; 
          padding: 15px; 
          border-radius: 5px; 
          display: none;
          text-align: center;
        }
        .success { 
          background: #d4edda; 
          color: #155724; 
          border: 1px solid #c3e6cb; 
        }
        .error { 
          background: #f8d7da; 
          color: #721c24; 
          border: 1px solid #f5c6cb; 
        }
        .back-link { 
          display: inline-block; 
          margin-top: 20px; 
          color: #007bff; 
          text-decoration: none; 
          text-align: center;
          width: 100%;
        }
        .back-link:hover { text-decoration: underline; }
        .form-group { margin-bottom: 20px; }
        .required::after { content: " *"; color: red; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>➕ Add New Product</h1>
        <form id="productForm">
          <div class="form-group">
            <label class="required">Product Name:</label>
            <input type="text" name="product_name" required placeholder="Enter product name">
          </div>
          
          <div class="form-group">
            <label class="required">Starting Price ($):</label>
            <input type="number" name="starting_price" step="0.01" required placeholder="Enter starting price">
          </div>
          
          <div class="form-group">
            <label>Price Range:</label>
            <input type="text" name="price_range" placeholder="e.g., 999-1499">
          </div>
          
          <div class="form-group">
            <label>Brief Description:</label>
            <textarea name="product_brief_description" placeholder="Enter brief description" rows="3"></textarea>
          </div>
          
          <div class="form-group">
            <label>Full Description:</label>
            <textarea name="product_description" placeholder="Enter full description" rows="4"></textarea>
          </div>
          
          <div class="form-group">
            <label>Image URL:</label>
            <input type="text" name="product_img" placeholder="Enter image URL">
          </div>
          
          <div class="form-group">
            <label>Product Link:</label>
            <input type="text" name="product_link" placeholder="Enter product link">
          </div>
          
          <button type="submit">Add Product</button>
        </form>
        
        <div id="result" class="result"></div>
        
        <a href="/" class="back-link">← Back to Dashboard</a>
        <a href="/manage-products" class="back-link">📦 Manage Products →</a>
      </div>

      <script>
        document.getElementById('productForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const formData = new FormData(this);
          const data = Object.fromEntries(formData);
          
          try {
            const response = await fetch('/add-product', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            const resultDiv = document.getElementById('result');
            if (response.ok) {
              resultDiv.innerHTML = '<strong>✅ Success!</strong> ' + result.message + 
                (result.productId ? '<br>Product ID: ' + result.productId : '');
              resultDiv.className = 'result success';
              
              // CLEAR THE FORM AFTER SUCCESSFUL SUBMISSION
              document.getElementById('productForm').reset();
              
            } else {
              resultDiv.innerHTML = '<strong>❌ Error:</strong> ' + result.error;
              resultDiv.className = 'result error';
            }
            resultDiv.style.display = 'block';
            
            // Scroll to result
            resultDiv.scrollIntoView({ behavior: 'smooth' });
            
          } catch (error) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<strong>❌ Network Error:</strong> ' + error.message;
            resultDiv.className = 'result error';
            resultDiv.style.display = 'block';
          }
        });
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

// Manage Products Page
app.get("/manage-products", (req, res) => {
  const query = `
    SELECT 
      p.product_id,
      p.product_name,
      p.product_url,
      pd.product_brief_description,
      pd.product_description,
      pd.product_img,
      pd.product_link,
      pp.starting_price,
      pp.price_range
    FROM products p
    LEFT JOIN product_description pd ON p.product_id = pd.product_id
    LEFT JOIN product_price pp ON p.product_id = pp.product_id
  `;
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error("Products retrieval error:", err);
      return res.status(500).send("Error retrieving products");
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Manage Products</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f0f2f5; }
          .container { max-width: 1200px; margin: 0 auto; }
          .nav { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          h1 { color: #333; margin: 0; }
          .nav-links { margin-top: 15px; }
          .nav-links a { margin-right: 15px; text-decoration: none; color: #007bff; }
          .nav-links a:hover { text-decoration: underline; }
          table { border-collapse: collapse; margin-bottom: 30px; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-radius: 5px; overflow: hidden; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .btn { 
            padding: 6px 12px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            text-decoration: none; 
            display: inline-block; 
            text-align: center;
            font-size: 14px;
          }
          .btn-edit { background: #ffc107; color: #212529; }
          .btn-delete { background: #dc3545; color: white; }
          .btn:hover { opacity: 0.8; }
          .actions { display: flex; gap: 5px; }
          .no-data { padding: 20px; background: white; border-radius: 5px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="nav">
            <h1>📦 Manage Products</h1>
            <div class="nav-links">
              <a href="/">🏠 Main Dashboard</a>
              <a href="/add-product-form">➕ Add New Product</a>
              <a href="/view">📊 View All Tables</a>
            </div>
          </div>

          <h2>Product List</h2>
          ${results.length > 0 ? `
            <table>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Brief Description</th>
                <th>Actions</th>
              </tr>
              ${results.map(product => `
                <tr>
                  <td>${product.product_id}</td>
                  <td>${product.product_name}</td>
                  <td>$${product.starting_price}</td>
                  <td>${product.product_brief_description || 'N/A'}</td>
                  <td class="actions">
                    <a href="/edit-product-form/${product.product_id}" class="btn btn-edit">✏️ Edit</a>
                    <a href="/delete-product/${product.product_id}" class="btn btn-delete" onclick="return confirm('Are you sure you want to delete this product?')">🗑️ Delete</a>
                  </td>
                </tr>
              `).join('')}
            </table>
          ` : `
            <div class="no-data">
              <p>No products found. <a href="/add-product-form">Add your first product</a></p>
            </div>
          `}
        </div>
      </body>
      </html>
    `;
    res.send(html);
  });
});

// Edit Product Form
app.get("/edit-product-form/:id", (req, res) => {
  const productId = req.params.id;
  
  const query = `
    SELECT 
      p.product_id,
      p.product_name,
      p.product_url,
      pd.product_brief_description,
      pd.product_description,
      pd.product_img,
      pd.product_link,
      pp.starting_price,
      pp.price_range
    FROM products p
    LEFT JOIN product_description pd ON p.product_id = pd.product_id
    LEFT JOIN product_price pp ON p.product_id = pp.product_id
    WHERE p.product_id = ?
  `;
  
  mysqlConnection.query(query, [productId], (err, results) => {
    if (err) {
      console.error("Product retrieval error:", err);
      return res.status(500).send("Error retrieving product");
    }
    
    if (results.length === 0) {
      return res.status(404).send("Product not found");
    }
    
    const product = results[0];
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Edit Product</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f0f2f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #333; text-align: center; margin-bottom: 30px; }
          form { margin-top: 20px; }
          label { display: block; margin: 15px 0 5px; font-weight: bold; color: #555; }
          input, textarea { 
            width: 100%; 
            padding: 12px; 
            border: 1px solid #ddd; 
            border-radius: 5px; 
            box-sizing: border-box; 
            font-size: 16px;
            margin-bottom: 10px;
          }
          input:focus, textarea:focus {
            border-color: #007bff;
            outline: none;
            box-shadow: 0 0 5px rgba(0,123,255,0.3);
          }
          button { 
            background: #007bff; 
            color: white; 
            padding: 15px 30px; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            margin-top: 20px; 
            font-size: 16px; 
            width: 100%;
            transition: background 0.3s;
          }
          button:hover { background: #0056b3; }
          .result { 
            margin-top: 20px; 
            padding: 15px; 
            border-radius: 5px; 
            display: none;
            text-align: center;
          }
          .success { 
            background: #d4edda; 
            color: #155724; 
            border: 1px solid #c3e6cb; 
          }
          .error { 
            background: #f8d7da; 
            color: #721c24; 
            border: 1px solid #f5c6cb; 
          }
          .back-link { 
            display: inline-block; 
            margin-top: 20px; 
            color: #007bff; 
            text-decoration: none; 
            text-align: center;
            width: 100%;
          }
          .back-link:hover { text-decoration: underline; }
          .form-group { margin-bottom: 20px; }
          .required::after { content: " *"; color: red; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✏️ Edit Product</h1>
          <form id="editProductForm">
            <input type="hidden" name="product_id" value="${product.product_id}">
            
            <div class="form-group">
              <label class="required">Product Name:</label>
              <input type="text" name="product_name" value="${product.product_name}" required>
            </div>
            
            <div class="form-group">
              <label class="required">Starting Price ($):</label>
              <input type="number" name="starting_price" value="${product.starting_price}" step="0.01" required>
            </div>
            
            <div class="form-group">
              <label>Price Range:</label>
              <input type="text" name="price_range" value="${product.price_range}">
            </div>
            
            <div class="form-group">
              <label>Brief Description:</label>
              <textarea name="product_brief_description" rows="3">${product.product_brief_description || ''}</textarea>
            </div>
            
            <div class="form-group">
              <label>Full Description:</label>
              <textarea name="product_description" rows="4">${product.product_description || ''}</textarea>
            </div>
            
            <div class="form-group">
              <label>Image URL:</label>
              <input type="text" name="product_img" value="${product.product_img}">
            </div>
            
            <div class="form-group">
              <label>Product Link:</label>
              <input type="text" name="product_link" value="${product.product_link}">
            </div>
            
            <button type="submit">Update Product</button>
          </form>
          
          <div id="result" class="result"></div>
          
          <a href="/manage-products" class="back-link">← Back to Manage Products</a>
        </div>

        <script>
          document.getElementById('editProductForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            try {
              const response = await fetch('/update-product', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
              });
              
              const result = await response.json();
              
              const resultDiv = document.getElementById('result');
              if (response.ok) {
                resultDiv.innerHTML = '<strong>✅ Success!</strong> ' + result.message;
                resultDiv.className = 'result success';
              } else {
                resultDiv.innerHTML = '<strong>❌ Error:</strong> ' + result.error;
                resultDiv.className = 'result error';
              }
              resultDiv.style.display = 'block';
              
              // Scroll to result
              resultDiv.scrollIntoView({ behavior: 'smooth' });
              
            } catch (error) {
              const resultDiv = document.getElementById('result');
              resultDiv.innerHTML = '<strong>❌ Network Error:</strong> ' + error.message;
              resultDiv.className = 'result error';
              resultDiv.style.display = 'block';
            }
          });
        </script>
      </body>
      </html>
    `;
    res.send(html);
  });
});

// ==================== USER ROUTES ====================

// Add User Form
app.get("/add-user-form", (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Add User</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f0f2f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; margin-bottom: 30px; }
        form { margin-top: 20px; }
        label { display: block; margin: 15px 0 5px; font-weight: bold; color: #555; }
        input { 
          width: 100%; 
          padding: 12px; 
          border: 1px solid #ddd; 
          border-radius: 5px; 
          box-sizing: border-box; 
          font-size: 16px;
          margin-bottom: 10px;
        }
        input:focus {
          border-color: #28a745;
          outline: none;
          box-shadow: 0 0 5px rgba(40,167,69,0.3);
        }
        button { 
          background: #28a745; 
          color: white; 
          padding: 15px 30px; 
          border: none; 
          border-radius: 5px; 
          cursor: pointer; 
          margin-top: 20px; 
          font-size: 16px; 
          width: 100%;
          transition: background 0.3s;
        }
        button:hover { background: #218838; }
        .result { 
          margin-top: 20px; 
          padding: 15px; 
          border-radius: 5px; 
          display: none;
          text-align: center;
        }
        .success { 
          background: #d4edda; 
          color: #155724; 
          border: 1px solid #c3e6cb; 
        }
        .error { 
          background: #f8d7da; 
          color: #721c24; 
          border: 1px solid #f5c6cb; 
        }
        .back-link { 
          display: inline-block; 
          margin-top: 20px; 
          color: #007bff; 
          text-decoration: none; 
          text-align: center;
          width: 100%;
        }
        .back-link:hover { text-decoration: underline; }
        .form-group { margin-bottom: 20px; }
        .required::after { content: " *"; color: red; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>👥 Add New User</h1>
        <form id="userForm">
          <div class="form-group">
            <label class="required">User Name:</label>
            <input type="text" name="user_name" required placeholder="Enter user name">
          </div>
          
          <div class="form-group">
            <label class="required">Email:</label>
            <input type="email" name="user_email" required placeholder="Enter email address">
          </div>
          
          <div class="form-group">
            <label class="required">Password:</label>
            <input type="password" name="user_password" required placeholder="Enter password">
          </div>
          
          <button type="submit">Add User</button>
        </form>
        
        <div id="result" class="result"></div>
        
        <a href="/" class="back-link">← Back to Dashboard</a>
        <a href="/manage-users" class="back-link">👥 Manage Users →</a>
      </div>

      <script>
        document.getElementById('userForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const formData = new FormData(this);
          const data = Object.fromEntries(formData);
          
          try {
            const response = await fetch('/add-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            const resultDiv = document.getElementById('result');
            if (response.ok) {
              resultDiv.innerHTML = '<strong>✅ Success!</strong> ' + result.message + 
                (result.userId ? '<br>User ID: ' + result.userId : '');
              resultDiv.className = 'result success';
              
              // CLEAR THE FORM AFTER SUCCESSFUL SUBMISSION
              document.getElementById('userForm').reset();
              
            } else {
              resultDiv.innerHTML = '<strong>❌ Error:</strong> ' + result.error;
              resultDiv.className = 'result error';
            }
            resultDiv.style.display = 'block';
            
            // Scroll to result
            resultDiv.scrollIntoView({ behavior: 'smooth' });
            
          } catch (error) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<strong>❌ Network Error:</strong> ' + error.message;
            resultDiv.className = 'result error';
            resultDiv.style.display = 'block';
          }
        });
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

// Manage Users Page
app.get("/manage-users", (req, res) => {
  mysqlConnection.query("SELECT user_id, user_name, user_email, created_at FROM users", (err, results) => {
    if (err) {
      console.error("Users retrieval error:", err);
      return res.status(500).send("Error retrieving users");
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Manage Users</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f0f2f5; }
          .container { max-width: 1200px; margin: 0 auto; }
          .nav { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          h1 { color: #333; margin: 0; }
          .nav-links { margin-top: 15px; }
          .nav-links a { margin-right: 15px; text-decoration: none; color: #007bff; }
          .nav-links a:hover { text-decoration: underline; }
          table { border-collapse: collapse; margin-bottom: 30px; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-radius: 5px; overflow: hidden; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .btn { 
            padding: 6px 12px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            text-decoration: none; 
            display: inline-block; 
            text-align: center;
            font-size: 14px;
          }
          .btn-edit { background: #ffc107; color: #212529; }
          .btn-delete { background: #dc3545; color: white; }
          .btn:hover { opacity: 0.8; }
          .actions { display: flex; gap: 5px; }
          .no-data { padding: 20px; background: white; border-radius: 5px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="nav">
            <h1>👥 Manage Users</h1>
            <div class="nav-links">
              <a href="/">🏠 Main Dashboard</a>
              <a href="/add-user-form">➕ Add New User</a>
              <a href="/view">📊 View All Tables</a>
            </div>
          </div>

          <h2>User List</h2>
          ${results.length > 0 ? `
            <table>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
              ${results.map(user => `
                <tr>
                  <td>${user.user_id}</td>
                  <td>${user.user_name}</td>
                  <td>${user.user_email}</td>
                  <td>${new Date(user.created_at).toLocaleDateString()}</td>
                  <td class="actions">
                    <a href="/edit-user-form/${user.user_id}" class="btn btn-edit">✏️ Edit</a>
                    <a href="/delete-user/${user.user_id}" class="btn btn-delete" onclick="return confirm('Are you sure you want to delete this user?')">🗑️ Delete</a>
                  </td>
                </tr>
              `).join('')}
            </table>
          ` : `
            <div class="no-data">
              <p>No users found. <a href="/add-user-form">Add your first user</a></p>
            </div>
          `}
        </div>
      </body>
      </html>
    `;
    res.send(html);
  });
});

// Edit User Form
app.get("/edit-user-form/:id", (req, res) => {
  const userId = req.params.id;
  
  mysqlConnection.query("SELECT * FROM users WHERE user_id = ?", [userId], (err, results) => {
    if (err) {
      console.error("User retrieval error:", err);
      return res.status(500).send("Error retrieving user");
    }
    
    if (results.length === 0) {
      return res.status(404).send("User not found");
    }
    
    const user = results[0];
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Edit User</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f0f2f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #333; text-align: center; margin-bottom: 30px; }
          form { margin-top: 20px; }
          label { display: block; margin: 15px 0 5px; font-weight: bold; color: #555; }
          input { 
            width: 100%; 
            padding: 12px; 
            border: 1px solid #ddd; 
            border-radius: 5px; 
            box-sizing: border-box; 
            font-size: 16px;
            margin-bottom: 10px;
          }
          input:focus {
            border-color: #28a745;
            outline: none;
            box-shadow: 0 0 5px rgba(40,167,69,0.3);
          }
          button { 
            background: #28a745; 
            color: white; 
            padding: 15px 30px; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            margin-top: 20px; 
            font-size: 16px; 
            width: 100%;
            transition: background 0.3s;
          }
          button:hover { background: #218838; }
          .result { 
            margin-top: 20px; 
            padding: 15px; 
            border-radius: 5px; 
            display: none;
            text-align: center;
          }
          .success { 
            background: #d4edda; 
            color: #155724; 
            border: 1px solid #c3e6cb; 
          }
          .error { 
            background: #f8d7da; 
            color: #721c24; 
            border: 1px solid #f5c6cb; 
          }
          .back-link { 
            display: inline-block; 
            margin-top: 20px; 
            color: #007bff; 
            text-decoration: none; 
            text-align: center;
            width: 100%;
          }
          .back-link:hover { text-decoration: underline; }
          .form-group { margin-bottom: 20px; }
          .required::after { content: " *"; color: red; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✏️ Edit User</h1>
          <form id="editUserForm">
            <input type="hidden" name="user_id" value="${user.user_id}">
            
            <div class="form-group">
              <label class="required">User Name:</label>
              <input type="text" name="user_name" value="${user.user_name}" required>
            </div>
            
            <div class="form-group">
              <label class="required">Email:</label>
              <input type="email" name="user_email" value="${user.user_email}" required>
            </div>
            
            <div class="form-group">
              <label class="required">Password:</label>
              <input type="password" name="user_password" value="${user.user_password}" required>
            </div>
            
            <button type="submit">Update User</button>
          </form>
          
          <div id="result" class="result"></div>
          
          <a href="/manage-users" class="back-link">← Back to Manage Users</a>
        </div>

        <script>
          document.getElementById('editUserForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            try {
              const response = await fetch('/update-user', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
              });
              
              const result = await response.json();
              
              const resultDiv = document.getElementById('result');
              if (response.ok) {
                resultDiv.innerHTML = '<strong>✅ Success!</strong> ' + result.message;
                resultDiv.className = 'result success';
              } else {
                resultDiv.innerHTML = '<strong>❌ Error:</strong> ' + result.error;
                resultDiv.className = 'result error';
              }
              resultDiv.style.display = 'block';
              
              // Scroll to result
              resultDiv.scrollIntoView({ behavior: 'smooth' });
              
            } catch (error) {
              const resultDiv = document.getElementById('result');
              resultDiv.innerHTML = '<strong>❌ Network Error:</strong> ' + error.message;
              resultDiv.className = 'result error';
              resultDiv.style.display = 'block';
            }
          });
        </script>
      </body>
      </html>
    `;
    res.send(html);
  });
});

// ==================== ORDER ROUTES ====================

// Add Order Form
app.get("/add-order-form", (req, res) => {
  // First, get users and products for dropdowns
  mysqlConnection.query("SELECT user_id, user_name FROM users", (err, users) => {
    if (err) {
      console.error("Error fetching users:", err);
      users = [];
    }
    
    mysqlConnection.query("SELECT product_id, product_name FROM products", (err, products) => {
      if (err) {
        console.error("Error fetching products:", err);
        products = [];
      }
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Add Order</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f0f2f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; text-align: center; margin-bottom: 30px; }
            form { margin-top: 20px; }
            label { display: block; margin: 15px 0 5px; font-weight: bold; color: #555; }
            select, input { 
              width: 100%; 
              padding: 12px; 
              border: 1px solid #ddd; 
              border-radius: 5px; 
              box-sizing: border-box; 
              font-size: 16px;
              margin-bottom: 10px;
            }
            select:focus, input:focus {
              border-color: #ffc107;
              outline: none;
              box-shadow: 0 0 5px rgba(255,193,7,0.3);
            }
            button { 
              background: #ffc107; 
              color: #212529; 
              padding: 15px 30px; 
              border: none; 
              border-radius: 5px; 
              cursor: pointer; 
              margin-top: 20px; 
              font-size: 16px; 
              width: 100%;
              transition: background 0.3s;
              font-weight: bold;
            }
            button:hover { background: #e0a800; }
            .result { 
              margin-top: 20px; 
              padding: 15px; 
              border-radius: 5px; 
              display: none;
              text-align: center;
            }
            .success { 
              background: #d4edda; 
              color: #155724; 
              border: 1px solid #c3e6cb; 
            }
            .error { 
              background: #f8d7da; 
              color: #721c24; 
              border: 1px solid #f5c6cb; 
            }
            .back-link { 
              display: inline-block; 
              margin-top: 20px; 
              color: #007bff; 
              text-decoration: none; 
              text-align: center;
              width: 100%;
            }
            .back-link:hover { text-decoration: underline; }
            .form-group { margin-bottom: 20px; }
            .required::after { content: " *"; color: red; }
            .info { 
              background: #d1ecf1; 
              color: #0c5460; 
              padding: 10px; 
              border-radius: 5px; 
              margin-bottom: 20px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🛒 Create New Order</h1>
            
            ${users.length === 0 || products.length === 0 ? `
              <div class="info">
                <strong>ℹ️ Note:</strong> You need to have at least one user and one product to create an order.
                <br><a href="/add-user-form">Add User</a> | <a href="/add-product-form">Add Product</a>
              </div>
            ` : ''}
            
            <form id="orderForm">
              <div class="form-group">
                <label class="required">Select User:</label>
                <select name="user_id" required>
                  <option value="">Select a user</option>
                  ${users.map(user => `<option value="${user.user_id}">${user.user_name} (ID: ${user.user_id})</option>`).join('')}
                </select>
              </div>
              
              <div class="form-group">
                <label class="required">Select Product:</label>
                <select name="product_id" required>
                  <option value="">Select a product</option>
                  ${products.map(product => `<option value="${product.product_id}">${product.product_name} (ID: ${product.product_id})</option>`).join('')}
                </select>
              </div>
              
              <div class="form-group">
                <label>Quantity:</label>
                <input type="number" name="quantity" value="1" min="1" placeholder="Enter quantity">
              </div>
              
              <div class="form-group">
                <label>Order Status:</label>
                <select name="status">
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <button type="submit" ${users.length === 0 || products.length === 0 ? 'disabled' : ''}>Create Order</button>
            </form>
            
            <div id="result" class="result"></div>
            
            <a href="/" class="back-link">← Back to Dashboard</a>
            <a href="/manage-orders" class="back-link">🛒 Manage Orders →</a>
          </div>

          <script>
            document.getElementById('orderForm').addEventListener('submit', async function(e) {
              e.preventDefault();
              
              const formData = new FormData(this);
              const data = Object.fromEntries(formData);
              
              try {
                const response = await fetch('/add-order', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                const resultDiv = document.getElementById('result');
                if (response.ok) {
                  resultDiv.innerHTML = '<strong>✅ Success!</strong> ' + result.message + 
                    (result.orderId ? '<br>Order ID: ' + result.orderId : '');
                  resultDiv.className = 'result success';
                  
                  // CLEAR THE FORM AFTER SUCCESSFUL SUBMISSION
                  document.getElementById('orderForm').reset();
                  
                } else {
                  resultDiv.innerHTML = '<strong>❌ Error:</strong> ' + result.error;
                  resultDiv.className = 'result error';
                }
                resultDiv.style.display = 'block';
                
                // Scroll to result
                resultDiv.scrollIntoView({ behavior: 'smooth' });
                
              } catch (error) {
                const resultDiv = document.getElementById('result');
                resultDiv.innerHTML = '<strong>❌ Network Error:</strong> ' + error.message;
                resultDiv.className = 'result error';
                resultDiv.style.display = 'block';
              }
            });
          </script>
        </body>
        </html>
      `;
      res.send(html);
    });
  });
});

// Manage Orders Page
app.get("/manage-orders", (req, res) => {
  const query = `
    SELECT 
      o.order_id,
      o.quantity,
      o.status,
      o.order_date,
      u.user_name,
      u.user_id,
      p.product_name,
      p.product_id
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.user_id
    LEFT JOIN products p ON o.product_id = p.product_id
  `;
  
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error("Orders retrieval error:", err);
      return res.status(500).send("Error retrieving orders");
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Manage Orders</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f0f2f5; }
          .container { max-width: 1200px; margin: 0 auto; }
          .nav { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          h1 { color: #333; margin: 0; }
          .nav-links { margin-top: 15px; }
          .nav-links a { margin-right: 15px; text-decoration: none; color: #007bff; }
          .nav-links a:hover { text-decoration: underline; }
          table { border-collapse: collapse; margin-bottom: 30px; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-radius: 5px; overflow: hidden; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .btn { 
            padding: 6px 12px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            text-decoration: none; 
            display: inline-block; 
            text-align: center;
            font-size: 14px;
          }
          .btn-edit { background: #ffc107; color: #212529; }
          .btn-delete { background: #dc3545; color: white; }
          .btn:hover { opacity: 0.8; }
          .actions { display: flex; gap: 5px; }
          .no-data { padding: 20px; background: white; border-radius: 5px; text-align: center; color: #666; }
          .status-pending { color: #856404; background: #fff3cd; padding: 4px 8px; border-radius: 4px; }
          .status-completed { color: #155724; background: #d4edda; padding: 4px 8px; border-radius: 4px; }
          .status-cancelled { color: #721c24; background: #f8d7da; padding: 4px 8px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="nav">
            <h1>🛒 Manage Orders</h1>
            <div class="nav-links">
              <a href="/">🏠 Main Dashboard</a>
              <a href="/add-order-form">➕ Add New Order</a>
              <a href="/view">📊 View All Tables</a>
            </div>
          </div>

          <h2>Order List</h2>
          ${results.length > 0 ? `
            <table>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Order Date</th>
                <th>Actions</th>
              </tr>
              ${results.map(order => `
                <tr>
                  <td>${order.order_id}</td>
                  <td>${order.user_name} (ID: ${order.user_id})</td>
                  <td>${order.product_name} (ID: ${order.product_id})</td>
                  <td>${order.quantity}</td>
                  <td><span class="status-${order.status}">${order.status}</span></td>
                  <td>${new Date(order.order_date).toLocaleDateString()}</td>
                  <td class="actions">
                    <a href="/edit-order-form/${order.order_id}" class="btn btn-edit">✏️ Edit</a>
                    <a href="/delete-order/${order.order_id}" class="btn btn-delete" onclick="return confirm('Are you sure you want to delete this order?')">🗑️ Delete</a>
                  </td>
                </tr>
              `).join('')}
            </table>
          ` : `
            <div class="no-data">
              <p>No orders found. <a href="/add-order-form">Create your first order</a></p>
            </div>
          `}
        </div>
      </body>
      </html>
    `;
    res.send(html);
  });
});

// Edit Order Form
app.get("/edit-order-form/:id", (req, res) => {
  const orderId = req.params.id;
  
  // Get the order details
  const orderQuery = `
    SELECT 
      o.order_id,
      o.user_id,
      o.product_id,
      o.quantity,
      o.status,
      u.user_name,
      p.product_name
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.user_id
    LEFT JOIN products p ON o.product_id = p.product_id
    WHERE o.order_id = ?
  `;
  
  mysqlConnection.query(orderQuery, [orderId], (err, orderResults) => {
    if (err) {
      console.error("Order retrieval error:", err);
      return res.status(500).send("Error retrieving order");
    }
    
    if (orderResults.length === 0) {
      return res.status(404).send("Order not found");
    }
    
    const order = orderResults[0];
    
    // Get users and products for dropdowns
    mysqlConnection.query("SELECT user_id, user_name FROM users", (err, users) => {
      if (err) {
        console.error("Error fetching users:", err);
        users = [];
      }
      
      mysqlConnection.query("SELECT product_id, product_name FROM products", (err, products) => {
        if (err) {
          console.error("Error fetching products:", err);
          products = [];
        }
        
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Edit Order</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; background: #f0f2f5; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              h1 { color: #333; text-align: center; margin-bottom: 30px; }
              form { margin-top: 20px; }
              label { display: block; margin: 15px 0 5px; font-weight: bold; color: #555; }
              select, input { 
                width: 100%; 
                padding: 12px; 
                border: 1px solid #ddd; 
                border-radius: 5px; 
                box-sizing: border-box; 
                font-size: 16px;
                margin-bottom: 10px;
              }
              select:focus, input:focus {
                border-color: #ffc107;
                outline: none;
                box-shadow: 0 0 5px rgba(255,193,7,0.3);
              }
              button { 
                background: #ffc107; 
                color: #212529; 
                padding: 15px 30px; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer; 
                margin-top: 20px; 
                font-size: 16px; 
                width: 100%;
                transition: background 0.3s;
                font-weight: bold;
              }
              button:hover { background: #e0a800; }
              .result { 
                margin-top: 20px; 
                padding: 15px; 
                border-radius: 5px; 
                display: none;
                text-align: center;
              }
              .success { 
                background: #d4edda; 
                color: #155724; 
                border: 1px solid #c3e6cb; 
              }
              .error { 
                background: #f8d7da; 
                color: #721c24; 
                border: 1px solid #f5c6cb; 
              }
              .back-link { 
                display: inline-block; 
                margin-top: 20px; 
                color: #007bff; 
                text-decoration: none; 
                text-align: center;
                width: 100%;
              }
              .back-link:hover { text-decoration: underline; }
              .form-group { margin-bottom: 20px; }
              .required::after { content: " *"; color: red; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✏️ Edit Order</h1>
              <form id="editOrderForm">
                <input type="hidden" name="order_id" value="${order.order_id}">
                
                <div class="form-group">
                  <label class="required">Select User:</label>
                  <select name="user_id" required>
                    <option value="">Select a user</option>
                    ${users.map(user => `<option value="${user.user_id}" ${user.user_id == order.user_id ? 'selected' : ''}>${user.user_name} (ID: ${user.user_id})</option>`).join('')}
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="required">Select Product:</label>
                  <select name="product_id" required>
                    <option value="">Select a product</option>
                    ${products.map(product => `<option value="${product.product_id}" ${product.product_id == order.product_id ? 'selected' : ''}>${product.product_name} (ID: ${product.product_id})</option>`).join('')}
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Quantity:</label>
                  <input type="number" name="quantity" value="${order.quantity}" min="1">
                </div>
                
                <div class="form-group">
                  <label>Order Status:</label>
                  <select name="status">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                  </select>
                </div>
                
                <button type="submit">Update Order</button>
              </form>
              
              <div id="result" class="result"></div>
              
              <a href="/manage-orders" class="back-link">← Back to Manage Orders</a>
            </div>

            <script>
              document.getElementById('editOrderForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const data = Object.fromEntries(formData);
                
                try {
                  const response = await fetch('/update-order', {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                  });
                  
                  const result = await response.json();
                  
                  const resultDiv = document.getElementById('result');
                  if (response.ok) {
                    resultDiv.innerHTML = '<strong>✅ Success!</strong> ' + result.message;
                    resultDiv.className = 'result success';
                  } else {
                    resultDiv.innerHTML = '<strong>❌ Error:</strong> ' + result.error;
                    resultDiv.className = 'result error';
                  }
                  resultDiv.style.display = 'block';
                  
                  // Scroll to result
                  resultDiv.scrollIntoView({ behavior: 'smooth' });
                  
                } catch (error) {
                  const resultDiv = document.getElementById('result');
                  resultDiv.innerHTML = '<strong>❌ Network Error:</strong> ' + error.message;
                  resultDiv.className = 'result error';
                  resultDiv.style.display = 'block';
                }
              });
            </script>
          </body>
          </html>
        `;
        res.send(html);
      });
    });
  });
});

// ==================== DATABASE VIEWER ====================

// Database Viewer with Update/Delete buttons
app.get("/view", (req, res) => {
  const tables = ["products", "product_description", "product_price", "users", "orders"];
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Database Tables</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f0f2f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .nav { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        h1 { color: #333; margin: 0; }
        .nav-links { margin-top: 15px; }
        .nav-links a { margin-right: 15px; text-decoration: none; color: #007bff; }
        .nav-links a:hover { text-decoration: underline; }
        table { border-collapse: collapse; margin-bottom: 30px; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-radius: 5px; overflow: hidden; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        h2 { color: #666; margin-top: 30px; margin-bottom: 15px; }
        .no-data { padding: 20px; background: white; border-radius: 5px; text-align: center; color: #666; }
        .table-count { color: #888; font-size: 14px; margin-bottom: 10px; }
        .password-masked { color: #999; font-style: italic; }
        .btn { 
          padding: 6px 12px; 
          border: none; 
          border-radius: 4px; 
          cursor: pointer; 
          text-decoration: none; 
          display: inline-block; 
          text-align: center;
          font-size: 14px;
        }
        .btn-edit { background: #ffc107; color: #212529; }
        .btn-delete { background: #dc3545; color: white; }
        .btn:hover { opacity: 0.8; }
        .actions { display: flex; gap: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="nav">
          <h1>📊 Database Tables Viewer</h1>
          <div class="nav-links">
            <a href="/">🏠 Main Dashboard</a>
            <a href="/add-product-form">➕ Add Product</a>
            <a href="/add-user-form">👥 Add User</a>
            <a href="/add-order-form">🛒 Add Order</a>
            <a href="/manage-products">📦 Manage Products</a>
            <a href="/manage-users">👥 Manage Users</a>
            <a href="/manage-orders">🛒 Manage Orders</a>
          </div>
        </div>
  `;

  function renderTable(index = 0) {
    if (index >= tables.length) {
      html += `</div></body></html>`;
      return res.send(html);
    }

    mysqlConnection.query(`SELECT * FROM ${tables[index]}`, (err, results) => {
      if (err) {
        html += `<div class="no-data" style="color: red;">Error retrieving ${tables[index]}: ${err.message}</div>`;
      } else {
        html += `<h2>${tables[index]}</h2>`;
        html += `<div class="table-count">Total records: ${results.length}</div>`;
        
        if (results.length > 0) {
          html += "<table><tr>";
          Object.keys(results[0]).forEach(col => html += `<th>${col}</th>`);
          // Add Actions column header
          html += `<th>Actions</th>`;
          html += "</tr>";
          
          results.forEach(row => {
            html += "<tr>";
            Object.entries(row).forEach(([key, val]) => {
              let displayVal = val;
              if (val === null) displayVal = '<em style="color: #999;">NULL</em>';
              else if (val === '') displayVal = '<em style="color: #999;">Empty</em>';
              else if (key === 'user_password') displayVal = '<span class="password-masked">••••••••</span>';
              html += `<td>${displayVal}</td>`;
            });
            
            // Add action buttons based on table type
            let editUrl = '#';
            let deleteUrl = '#';
            let idField = '';
            
            if (tables[index] === 'products') {
              idField = 'product_id';
              editUrl = `/edit-product-form/${row.product_id}`;
              deleteUrl = `/delete-product/${row.product_id}`;
            } else if (tables[index] === 'users') {
              idField = 'user_id';
              editUrl = `/edit-user-form/${row.user_id}`;
              deleteUrl = `/delete-user/${row.user_id}`;
            } else if (tables[index] === 'orders') {
              idField = 'order_id';
              editUrl = `/edit-order-form/${row.order_id}`;
              deleteUrl = `/delete-order/${row.order_id}`;
            }
            
            if (idField) {
              html += `<td class="actions">
                <a href="${editUrl}" class="btn btn-edit">✏️ Edit</a>
                <a href="${deleteUrl}" class="btn btn-delete" onclick="return confirm('Are you sure you want to delete this record?')">🗑️ Delete</a>
              </td>`;
            } else {
              html += `<td>No actions</td>`;
            }
            
            html += "</tr>";
          });
          html += "</table>";
        } else {
          html += `<div class="no-data">No data found in ${tables[index]} table</div>`;
        }
      }
      
      renderTable(index + 1);
    });
  }

  renderTable();
});

// ==================== API ENDPOINTS ====================

// Add Product API
app.post("/add-product", (req, res) => {
  const { 
    product_name, 
    product_brief_description, 
    product_description, 
    product_img, 
    product_link, 
    starting_price, 
    price_range
  } = req.body;

  if (!product_name || !starting_price) {
    return res.status(400).json({ error: "Product name and starting price are required" });
  }

  mysqlConnection.query(
    "INSERT INTO products (product_url, product_name) VALUES (?, ?)",
    ["http://localhost:3001/products", product_name],
    (err, productResult) => {
      if (err) {
        console.error("Product insertion error:", err);
        return res.status(500).json({ error: "Failed to insert product" });
      }
      
      const productId = productResult.insertId;

      mysqlConnection.query(
        "INSERT INTO product_description (product_id, product_brief_description, product_description, product_img, product_link) VALUES (?, ?, ?, ?, ?)",
        [productId, product_brief_description || "No description", product_description || "No description", product_img || "default.jpg", product_link || "http://localhost:3001/products"],
        (err) => {
          if (err) {
            console.error("Description insertion error:", err);
            return res.status(500).json({ error: "Failed to insert product description" });
          }

          mysqlConnection.query(
            "INSERT INTO product_price (product_id, starting_price, price_range) VALUES (?, ?, ?)",
            [productId, starting_price, price_range || "Not specified"],
            (err) => {
              if (err) {
                console.error("Price insertion error:", err);
                return res.status(500).json({ error: "Failed to insert product price" });
              }

              res.json({ 
                message: "Product inserted successfully! Form has been cleared.",
                productId 
              });
            }
          );
        }
      );
    }
  );
});

// Update Product API
app.put("/update-product", (req, res) => {
  const { 
    product_id,
    product_name, 
    product_brief_description, 
    product_description, 
    product_img, 
    product_link, 
    starting_price, 
    price_range
  } = req.body;

  if (!product_id || !product_name || !starting_price) {
    return res.status(400).json({ error: "Product ID, name and starting price are required" });
  }

  // Update products table
  mysqlConnection.query(
    "UPDATE products SET product_name = ? WHERE product_id = ?",
    [product_name, product_id],
    (err) => {
      if (err) {
        console.error("Product update error:", err);
        return res.status(500).json({ error: "Failed to update product" });
      }

      // Update product_description table
      mysqlConnection.query(
        "UPDATE product_description SET product_brief_description = ?, product_description = ?, product_img = ?, product_link = ? WHERE product_id = ?",
        [product_brief_description || "No description", product_description || "No description", product_img || "default.jpg", product_link || "http://localhost:3001/products", product_id],
        (err) => {
          if (err) {
            console.error("Description update error:", err);
            return res.status(500).json({ error: "Failed to update product description" });
          }

          // Update product_price table
          mysqlConnection.query(
            "UPDATE product_price SET starting_price = ?, price_range = ? WHERE product_id = ?",
            [starting_price, price_range || "Not specified", product_id],
            (err) => {
              if (err) {
                console.error("Price update error:", err);
                return res.status(500).json({ error: "Failed to update product price" });
              }

              res.json({ 
                message: "Product updated successfully!"
              });
            }
          );
        }
      );
    }
  );
});

// Delete Product API
app.get("/delete-product/:id", (req, res) => {
  const productId = req.params.id;
  
  mysqlConnection.query("DELETE FROM products WHERE product_id = ?", [productId], (err) => {
    if (err) {
      console.error("Product deletion error:", err);
      return res.redirect("/manage-products?error=Failed to delete product");
    }
    
    res.redirect("/manage-products?success=Product deleted successfully");
  });
});

// Add User API
app.post("/add-user", (req, res) => {
  const { 
    user_name, 
    user_email, 
    user_password 
  } = req.body;

  if (!user_name || !user_email || !user_password) {
    return res.status(400).json({ error: "User name, email, and password are required" });
  }

  mysqlConnection.query(
    "INSERT INTO users (user_name, user_email, user_password) VALUES (?, ?, ?)",
    [user_name, user_email, user_password],
    (err, result) => {
      if (err) {
        console.error("User insertion error:", err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: "Failed to insert user" });
      }
      
      res.json({ 
        message: "User registered successfully! Form has been cleared.",
        userId: result.insertId
      });
    }
  );
});

// Update User API
app.put("/update-user", (req, res) => {
  const { 
    user_id,
    user_name, 
    user_email, 
    user_password 
  } = req.body;

  if (!user_id || !user_name || !user_email || !user_password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  mysqlConnection.query(
    "UPDATE users SET user_name = ?, user_email = ?, user_password = ? WHERE user_id = ?",
    [user_name, user_email, user_password, user_id],
    (err) => {
      if (err) {
        console.error("User update error:", err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: "Failed to update user" });
      }
      
      res.json({ 
        message: "User updated successfully!"
      });
    }
  );
});

// Delete User API
app.get("/delete-user/:id", (req, res) => {
  const userId = req.params.id;
  
  mysqlConnection.query("DELETE FROM users WHERE user_id = ?", [userId], (err) => {
    if (err) {
      console.error("User deletion error:", err);
      return res.redirect("/manage-users?error=Failed to delete user");
    }
    
    res.redirect("/manage-users?success=User deleted successfully");
  });
});

// Add Order API
app.post("/add-order", (req, res) => {
  const { 
    user_id, 
    product_id, 
    quantity,
    status
  } = req.body;

  if (!user_id || !product_id) {
    return res.status(400).json({ error: "User and Product are required" });
  }

  mysqlConnection.query(
    "INSERT INTO orders (user_id, product_id, quantity, status) VALUES (?, ?, ?, ?)",
    [user_id, product_id, quantity || 1, status || 'pending'],
    (err, result) => {
      if (err) {
        console.error("Order insertion error:", err);
        return res.status(500).json({ error: "Failed to create order" });
      }
      
      res.json({ 
        message: "Order created successfully! Form has been cleared.",
        orderId: result.insertId
      });
    }
  );
});

// Update Order API
app.put("/update-order", (req, res) => {
  const { 
    order_id,
    user_id, 
    product_id, 
    quantity,
    status
  } = req.body;

  if (!order_id || !user_id || !product_id) {
    return res.status(400).json({ error: "Order ID, User and Product are required" });
  }

  mysqlConnection.query(
    "UPDATE orders SET user_id = ?, product_id = ?, quantity = ?, status = ? WHERE order_id = ?",
    [user_id, product_id, quantity || 1, status || 'pending', order_id],
    (err) => {
      if (err) {
        console.error("Order update error:", err);
        return res.status(500).json({ error: "Failed to update order" });
      }
      
      res.json({ 
        message: "Order updated successfully!"
      });
    }
  );
});

// Delete Order API
app.get("/delete-order/:id", (req, res) => {
  const orderId = req.params.id;
  
  mysqlConnection.query("DELETE FROM orders WHERE order_id = ?", [orderId], (err) => {
    if (err) {
      console.error("Order deletion error:", err);
      return res.redirect("/manage-orders?error=Failed to delete order");
    }
    
    res.redirect("/manage-orders?success=Order deleted successfully");
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  🚀 Server running successfully!
  
  🔗 YOUR LINKS:
  📊 ${BASE_URL}/view - Database Tables Viewer (with Update/Delete buttons)
  🏠 ${BASE_URL} - Main Dashboard
  ➕ ${BASE_URL}/add-product-form - Add Product Form
  👥 ${BASE_URL}/add-user-form - Add User Form
  🛒 ${BASE_URL}/add-order-form - Add Order Form
  📦 ${BASE_URL}/manage-products - Manage Products (Update/Delete)
  👥 ${BASE_URL}/manage-users - Manage Users (Update/Delete)
  🛒 ${BASE_URL}/manage-orders - Manage Orders (Update/Delete)

  ⚡ Simply click the links above or copy them into your browser!
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  mysqlConnection.end();
  process.exit(0);
>>>>>>> 5444ad8 (mysql database practies created)
});