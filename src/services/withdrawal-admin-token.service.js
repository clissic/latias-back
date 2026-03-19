import jwt from "jsonwebtoken";

const WITHDRAWAL_TOKEN_ISSUER = "latias-backend";
const WITHDRAWAL_TOKEN_AUDIENCE = "latias-admin-withdrawals";

class WithdrawalAdminTokenService {
  constructor() {
    this.secretKey =
      process.env.WITHDRAWAL_ADMIN_TOKEN_SECRET ||
      process.env.JWT_SECRET ||
      "your-super-secret-key-change-in-production";
    this.expiresIn = process.env.WITHDRAWAL_ADMIN_TOKEN_EXPIRES_IN || "24h";
  }

  generateToken({ withdrawalId }) {
    return jwt.sign(
      {
        withdrawalId: String(withdrawalId),
        role: "admin",
        type: "withdrawal_admin",
      },
      this.secretKey,
      {
        expiresIn: this.expiresIn,
        issuer: WITHDRAWAL_TOKEN_ISSUER,
        audience: WITHDRAWAL_TOKEN_AUDIENCE,
      }
    );
  }

  verifyToken(token) {
    return jwt.verify(token, this.secretKey, {
      issuer: WITHDRAWAL_TOKEN_ISSUER,
      audience: WITHDRAWAL_TOKEN_AUDIENCE,
    });
  }
}

export const withdrawalAdminTokenService = new WithdrawalAdminTokenService();
