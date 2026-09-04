export const ROLES = {
  ADMIN: "admin",
  HEALTH_WORKER: "health-worker",
  PUBLIC_USER: "public-user",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [ROLES.ADMIN]: 2,
  [ROLES.HEALTH_WORKER]: 1,
  [ROLES.PUBLIC_USER]: 0,
};

export const VERIFICATION_STATUS = {
  NONE: "none",
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export type VerificationStatus = (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];
