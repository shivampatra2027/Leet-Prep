import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

export function signAccessToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      tier: user.tier,
    },
    ACCESS_SECRET,
    { expiresIn: "15m" },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

export function signRefreshToken(user) {
  return jwt.sign(
    {
      id: user._id,
    },
    REFRESH_SECRET,
    { expiresIn: "30d" },
  );
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}
