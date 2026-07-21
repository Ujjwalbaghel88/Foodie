import jwt from "jsonwebtoken";

const generateToken = (user, res) => {
  const payload = {
    id: user._id,
    email: user.email,
    userType: user.userType,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};

export default generateToken;
