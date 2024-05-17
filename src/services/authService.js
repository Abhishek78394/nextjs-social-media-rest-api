import * as jose from 'jose'
const secretKey = process.env.JWT_SECRET;
import { cookies } from "next/headers";

const AuthService = {
  async issueToken(payload) {
    const secret = new TextEncoder().encode(secretKey)
    const alg = 'HS256'
    const jwt = await new jose.SignJWT({ 'urn:example:claim': true }).setProtectedHeader({ alg, payload })
    .setIssuedAt()
    .setIssuer('urn:example:issuer')
    .setAudience('urn:example:audience')
    .setExpirationTime('24h')
    .sign(secret)

    return jwt;
  },

  async verifyToken() {
    const {value} = cookies().get("token");

    if (!value) {
      return { error: "Access denied", status: 401 };
    }
    
    try {
      const secret = new TextEncoder().encode(secretKey);
      const decodedToken = await jose.jwtVerify(value, secret, {
        issuer: "urn:example:issuer",
        audience: "urn:example:audience",
      });
      return { user: decodedToken.protectedHeader.payload }; 
    } catch (error) {
      console.error("error:",error);
      if (error.message === '"exp" claim timestamp check failed') {
        return { error: "Token expired. Please login again.", status: 401 };
      } else {
        return { error: "Invalid token", status: 401 };
      }
    }
  }
};

module.exports = AuthService;
