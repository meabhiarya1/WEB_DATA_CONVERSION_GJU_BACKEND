const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const UserActivity = require("../../models/UserActivity");
const jwt = require("jsonwebtoken");

const secretKey = "omrscanner";

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(404).json({ error: "Please fill in all fields" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    const userDataToSend = {
      userName: user.userName,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      id: user.id,
    };

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Log the login event
    await UserActivity.create({
      userId: user.id,
      action: "login",
    });

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
      secretKey
    );

    res.status(200).json({ message: "Login successful", token, user: userDataToSend });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = login;
