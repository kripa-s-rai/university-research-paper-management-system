const User = require('../models/Users');
const bcrypt = require('bcryptjs');
const db = require('../db'); 

// Register user
exports.registerUser = async (req, res) => {
  const userData = req.body;

  // Ensure DepartmentID is provided in the request body
  if (!userData.department) {
    return res.status(400).json({ error: 'DepartmentID is required' });
  }

  try {
    // Call the User model's register method to save the user data
    await User.register(userData, (err, result) => {
      if (err) {
        console.error('Error registering user:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'User registered successfully!', userId: result.insertId });
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Error registering user.' });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  console.log('Login request received with user input:', req.body.userInput);
  console.log('Password provided:', req.body.password);

  const { userInput, password } = req.body;

  try {
    // Determine if userInput is an email or username
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInput);
    const searchParams = isEmail ? { email: userInput } : { name: userInput };

    console.log('Searching for user with:', searchParams);

    // Find the user in the database
    await User.findOne(searchParams, async (err, user) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Error accessing the database. Please try again.' });
      }

      console.log('User found in database:', user);

      if (!user) {
        console.error('User not found:', userInput);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Ensure the password field is retrieved correctly
      const dbPassword = typeof user.Password === 'string' ? user.Password : user.Password.toString();
      console.log('Database hashed password:', dbPassword);
      
      // Compare the provided password with the stored hashed password
      const passwordMatch = await bcrypt.compare(password, dbPassword);
      console.log('Password match result:', passwordMatch);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Successful login
      console.log('Login successful for user:', userInput);
      res.status(200).json(user);
    });
  } catch (error) {
    console.error('Unexpected error during login:', error);
    res.status(500).json({ error: 'An unexpected error occurred during login. Please try again.' });
  }
};

// Admin: Update user role
exports.updateUserRole = (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  // Check if the new role is provided
  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  User.updateUserRole(userId, role, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'User role updated successfully!' });
  });
};

exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { Name, Email } = req.body;

  // Validate input fields
  if (!Name || !Email) {
    return res.status(400).json({ message: 'Name and Email are required' });
  }

  // SQL query to update user data
  const query = 'UPDATE users SET Name = ?, Email = ? WHERE UserID = ?';
  db.query(query, [Name, Email, id], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to update user' });
    }

    if (results.affectedRows > 0) {
      return res.status(200).json({ message: 'User updated successfully' });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  });
};

exports.changePassword = async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Fetch the user's current password hash from the database
    const [user] = await db.promise().query('SELECT Password FROM users WHERE UserID = ?', [userId]);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Compare the old password with the hash in the database
    const match = await bcrypt.compare(oldPassword, user[0].Password);

    if (!match) {
      return res.status(401).json({ error: 'Incorrect old password.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    await db.promise().query('UPDATE users SET Password = ? WHERE UserID = ?', [hashedPassword, userId]);

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update password.' });
  }
};