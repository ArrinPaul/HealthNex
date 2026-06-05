export const ROLES = {
  SUPER_ADMIN: "super-admin",
  ADMIN: "admin",
  HEALTH_WORKER: "health-worker",
  COMMUNITY_USER: "community-user",
  PUBLIC: "public",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [ROLES.SUPER_ADMIN]: 4,
  [ROLES.ADMIN]: 3,
  [ROLES.HEALTH_WORKER]: 2,
  [ROLES.COMMUNITY_USER]: 1,
  [ROLES.PUBLIC]: 0,
};

export const VERIFICATION_STATUS = {
  NONE: "none",
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export type VerificationStatus = (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];
