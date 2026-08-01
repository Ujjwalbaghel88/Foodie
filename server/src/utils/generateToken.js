import jwt from "jsonwebtoken";
import getAuthCookieOptions from "./authCookieOptions.js";

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
    ...getAuthCookieOptions(),
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return token;
};

export default generateToken;
