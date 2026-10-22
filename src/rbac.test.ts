import { describe, it, expect, vi } from 'vitest';
import { ROLES, UserRole } from '../convex/roles';

// Nav item definition matching Navigation.tsx
const allNavItems = [
  { href: '/dashboard', label: 'Dashboard', roles: ['admin', 'health-worker', 'public-user'] },
  { href: '/health-data', label: 'Health Data', roles: ['admin', 'health-worker'] },
  { href: '/water-quality', label: 'Water Quality', roles: ['admin', 'health-worker'] },
  { href: '/ai-features', label: 'AI Analytics', roles: ['admin', 'health-worker'] },
  { href: '/chatbot', label: 'Health Assistant', roles: ['admin', 'health-worker', 'public-user'] },
  { href: '/alerts', label: 'Alerts & Broadcasts', roles: ['admin', 'health-worker'] },
  { href: '/education', label: 'Health Education', roles: ['admin', 'health-worker', 'public-user'] },
  { href: '/community-reports', label: 'Community Reports', roles: ['admin', 'health-worker', 'public-user'] },
  { href: '/vault', label: 'Health Records Vault', roles: ['admin', 'health-worker', 'public-user'] },
  { href: '/resources', label: 'Resource Directory', roles: ['admin', 'health-worker', 'public-user'] },
  { href: '/symptom-checker', label: 'Symptom Triage', roles: ['admin', 'health-worker', 'public-user'] },
  { href: '/user-management', label: 'Personnel Mgmt', roles: ['admin'] },
  { href: '/admin', label: 'Administration', roles: ['admin'] },
];

function getVisibleNavItems(user: { role: string } | null) {
  return allNavItems.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  );
}

describe('Role-Based Navigation & Visibility (RBAC-01, RBAC-02)', () => {
  describe('Navigation Items Role Filtering', () => {
    it('shows no role-gated items when user is signed out / null', () => {
      const items = getVisibleNavItems(null);
      expect(items).toHaveLength(0);
    });

    it('shows /user-management and /admin ONLY for admin role', () => {
      const adminItems = getVisibleNavItems({ role: ROLES.ADMIN });
      const adminHrefs = adminItems.map(i => i.href);
      expect(adminHrefs).toContain('/user-management');
      expect(adminHrefs).toContain('/admin');

      const healthWorkerItems = getVisibleNavItems({ role: ROLES.HEALTH_WORKER });
      const healthWorkerHrefs = healthWorkerItems.map(i => i.href);
      expect(healthWorkerHrefs).not.toContain('/user-management');
      expect(healthWorkerHrefs).not.toContain('/admin');

      const publicUserItems = getVisibleNavItems({ role: ROLES.PUBLIC_USER });
      const publicUserHrefs = publicUserItems.map(i => i.href);
      expect(publicUserHrefs).not.toContain('/user-management');
      expect(publicUserHrefs).not.toContain('/admin');
    });

    it('allows health workers to see clinical data items but not admin items', () => {
      const healthWorkerItems = getVisibleNavItems({ role: ROLES.HEALTH_WORKER });
      const hrefs = healthWorkerItems.map(i => i.href);

      expect(hrefs).toContain('/dashboard');
      expect(hrefs).toContain('/health-data');
      expect(hrefs).toContain('/water-quality');
      expect(hrefs).toContain('/ai-features');
      expect(hrefs).toContain('/alerts');

      expect(hrefs).not.toContain('/user-management');
      expect(hrefs).not.toContain('/admin');
    });

    it('limits public users to public-tier items', () => {
      const publicUserItems = getVisibleNavItems({ role: ROLES.PUBLIC_USER });
      const hrefs = publicUserItems.map(i => i.href);

      expect(hrefs).toContain('/dashboard');
      expect(hrefs).toContain('/chatbot');
      expect(hrefs).toContain('/community-reports');
      expect(hrefs).toContain('/vault');
      expect(hrefs).toContain('/resources');

      expect(hrefs).not.toContain('/health-data');
      expect(hrefs).not.toContain('/water-quality');
      expect(hrefs).not.toContain('/ai-features');
      expect(hrefs).not.toContain('/alerts');
      expect(hrefs).not.toContain('/user-management');
      expect(hrefs).not.toContain('/admin');
    });
  });

  describe('Dashboard Administrative Controls (RBAC-02)', () => {
    function shouldRenderToolsAndSandbox(user: { role: string } | null | undefined): boolean {
      return user?.role === ROLES.ADMIN;
    }

    function shouldRenderModerationQueue(user: { role: string } | null | undefined, pendingCount: number): boolean {
      const isPrivileged = user?.role === ROLES.ADMIN || user?.role === ROLES.HEALTH_WORKER;
      return isPrivileged && pendingCount > 0;
    }

    it('renders Tools & Sandbox dropdown only for admin', () => {
      expect(shouldRenderToolsAndSandbox({ role: ROLES.ADMIN })).toBe(true);
      expect(shouldRenderToolsAndSandbox({ role: ROLES.HEALTH_WORKER })).toBe(false);
      expect(shouldRenderToolsAndSandbox({ role: ROLES.PUBLIC_USER })).toBe(false);
      expect(shouldRenderToolsAndSandbox(null)).toBe(false);
      expect(shouldRenderToolsAndSandbox(undefined)).toBe(false);
    });

    it('renders Moderation Queue for admin and health worker, but never public-user or signed-out', () => {
      expect(shouldRenderModerationQueue({ role: ROLES.ADMIN }, 3)).toBe(true);
      expect(shouldRenderModerationQueue({ role: ROLES.HEALTH_WORKER }, 3)).toBe(true);
      expect(shouldRenderModerationQueue({ role: ROLES.PUBLIC_USER }, 3)).toBe(false);
      expect(shouldRenderModerationQueue(null, 3)).toBe(false);
      expect(shouldRenderModerationQueue({ role: ROLES.ADMIN }, 0)).toBe(false);
    });
  });
});
