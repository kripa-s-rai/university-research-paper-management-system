import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

const Profile = () => {
  const { user } = useAuth(); // Get user from context
  const [departmentName, setDepartmentName] = useState("Not assigned");
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.Name || "Not available");
      setEmail(user.Email || "Not available");
    }

    if (user && user.DepartmentID) {
      fetch(`http://localhost:5000/api/departments/${user.DepartmentID}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          const department = data.department?.DepartmentName || "Not assigned";
          setDepartmentName(department);
        })
        .catch(error => console.error("Error fetching department:", error));
    }
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    const updatedUser = {
      Name: name,
      Email: email,
    };
    fetch(`http://localhost:5000/api/users/${user.UserID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUser),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update the profile.');
        }
        return response.json();
      })
      .then((data) => {
        console.log(data.message); // Log success message
        alert('Profile updated successfully!');
      })
      .catch((error) => {
        console.error(error);
        alert('Failed to update the profile.');
      });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match!");
      return;
    }

    const passwordData = {
      userId: user.UserID,
      oldPassword,
      newPassword,
    };

    fetch('http://localhost:5000/api/users/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordData),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          setPasswordError(data.error || "Failed to change password.");
          return;
        }

        console.log("Password changed successfully:", data);
        setPasswordError(""); // Clear error message
        setIsPasswordModalOpen(false); // Close modal
      })
      .catch((error) => {
        console.error("Network error:", error);
        setPasswordError("Network error while changing password.");
      });
  };

  const handlePasswordModalClose = () => {
    setIsPasswordModalOpen(false);
    setPasswordError("");
  };

  const joinDate = user.JoinDate ? new Date(user.JoinDate).toLocaleDateString() : "Invalid Date";

  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>

      <div className="profile-image-wrapper">
        <img src="https://www.w3schools.com/howto/img_avatar.png" alt="Profile" />
      </div>

      <div className="profile-info">
        <p><strong>Name:</strong> 
          {isEditing ? (
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          ) : (
            name
          )}
        </p>

        <p><strong>Email:</strong> 
          {isEditing ? (
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          ) : (
            email
          )}
        </p>

        <p><strong>Role:</strong> {user.Role || "Not available"}</p>
        <p><strong>Department:</strong> {departmentName}</p>
        <p><strong>Join Date:</strong> {joinDate}</p>
      </div>

      <button 
        className="edit-profile-button" 
        onClick={isEditing ? handleSaveClick : handleEditClick}
      >
        {isEditing ? "Save Changes" : "Edit Profile"}
      </button>

      <button 
        className="edit-profile-button" 
        onClick={() => setIsPasswordModalOpen(true)}
      >
        Change Password
      </button>

      {isPasswordModalOpen && (
        <div className="password-modal">
          <div className="modal-content">
            <span className="close-modal" onClick={handlePasswordModalClose}>&times;</span>
            <h3>Change Password</h3>
            <form>
              <div>
                <label>Old Password</label>
                <input 
                  type="password" 
                  value={oldPassword} 
                  onChange={(e) => setOldPassword(e.target.value)} 
                />
              </div>
              <div>
                <label>New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                />
              </div>
              <div>
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                />
              </div>
              {passwordError && <p className="error">{passwordError}</p>}
              <button type="button" onClick={handleChangePassword}>Save Password</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
