const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

// Post route to add a person
router.post("/signup", async (req, res) => {
    try {
        const data = req.body; // assuming the request body contains the person data

        // Check if there is already an admin user
        const adminUser = await User.findOne({ role: "admin" });
        if (data.role === "admin" && adminUser) {
            return res.status(400).json({ error: "Admin user already exists" });
        }

        // Validate Aadhar Card Number must have exactly 12 digit
        if (!/^\d{12}$/.test(data.aadharCardNumber)) {
            return res.status(400).json({
                error: "Aadhar Card Number must be exactly 12 digits",
            });
        }

        // Check if a user with the same Aadhar Card Number already exists
        const existingUser = await User.findOne({
            aadharCardNumber: data.aadharCardNumber,
        });
        if (existingUser) {
            return res.status(400).json({
                error: "User with the same Aadhar Card Number already exists",
            });
        }

        // create a new User using the mongoose model
        const newUser = new User(data);

        // Save the new user to the database
        const response = await newUser.save();
        console.log("data saved");

        const payload = {
            id: response.id,
        };

        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is: ", token);

        res.status(200).json({ response: response, token: token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Log In Routes
router.post("/login", async (req, res) => {
    try {
        // Extract aadharCardNumber and password from request body
        const { aadharCardNumber, password } = req.body;

        // Check if aadharCardNumber or password is missing
        if (!aadharCardNumber || !password) {
            return res.status(400).json({
                error: "Aadhar Card Number and password are required",
            });
        }

        // Find the user by aadharCardNumber
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

        // If user does not exist or password does not match, return error
        if (!user || !(await user.comparePassword(password))) {
            return res
                .status(401)
                .json({ error: "Invalid Aadhar Card Number or Password" });
        }

        // generate token
        const payload = {
            id: user.id,
        };

        const token = generateToken(payload);

        // return token as response
        res.json({ token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/profile", jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.userPayload;
        const userId = userData.id;
        const user = await User.findById(userId);

        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put("/profile/password", async (req, res) => {
    try {
        const userId = req.user;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);

        if (!(await user.comparePassword(currentPassword))) {
            return res
                .status(401)
                .json({ error: "Invalid username and password" });
        }

        user.password = newPassword;
        await user.save();

        console.log("password updated");
        res.status(200).json({ message: "password updated" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
