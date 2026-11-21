/**
 * Permission Matrix Test Suite
 * Verifies role-based access control (OWNER, EDITOR, VIEWER)
 */

interface UserActionContext {
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
}

class PermissionGuard {
  static canDeleteTrip(ctx: UserActionContext): boolean {
    return ctx.role === 'OWNER';
  }

  static canManageCollaborators(ctx: UserActionContext): boolean {
    return ctx.role === 'OWNER';
  }

  static canEditItinerary(ctx: UserActionContext): boolean {
    return ctx.role === 'OWNER' || ctx.role === 'EDITOR';
  }

  static canLogExpense(ctx: UserActionContext): boolean {
    return ctx.role === 'OWNER' || ctx.role === 'EDITOR';
  }

  static canUpdateChecklist(ctx: UserActionContext): boolean {
    return ctx.role === 'OWNER' || ctx.role === 'EDITOR';
  }

  static canViewTrip(ctx: UserActionContext): boolean {
    return ctx.role === 'OWNER' || ctx.role === 'EDITOR' || ctx.role === 'VIEWER';
  }
}

describe('PermissionMatrix', () => {
  const owner: UserActionContext = { role: 'OWNER' };
  const editor: UserActionContext = { role: 'EDITOR' };
  const viewer: UserActionContext = { role: 'VIEWER' };

  describe('OWNER role', () => {
    it('has all permissions: delete, manage members, edit itinerary, log expenses', () => {
      expect(PermissionGuard.canDeleteTrip(owner)).toBe(true);
      expect(PermissionGuard.canManageCollaborators(owner)).toBe(true);
      expect(PermissionGuard.canEditItinerary(owner)).toBe(true);
      expect(PermissionGuard.canLogExpense(owner)).toBe(true);
      expect(PermissionGuard.canUpdateChecklist(owner)).toBe(true);
      expect(PermissionGuard.canViewTrip(owner)).toBe(true);
    });
  });

  describe('EDITOR role', () => {
    it('can edit itinerary and log expenses, but cannot delete trip or manage members', () => {
      expect(PermissionGuard.canDeleteTrip(editor)).toBe(false);
      expect(PermissionGuard.canManageCollaborators(editor)).toBe(false);
      expect(PermissionGuard.canEditItinerary(editor)).toBe(true);
      expect(PermissionGuard.canLogExpense(editor)).toBe(true);
      expect(PermissionGuard.canUpdateChecklist(editor)).toBe(true);
      expect(PermissionGuard.canViewTrip(editor)).toBe(true);
    });
  });

  describe('VIEWER role', () => {
    it('has strictly read-only access', () => {
      expect(PermissionGuard.canDeleteTrip(viewer)).toBe(false);
      expect(PermissionGuard.canManageCollaborators(viewer)).toBe(false);
      expect(PermissionGuard.canEditItinerary(viewer)).toBe(false);
      expect(PermissionGuard.canLogExpense(viewer)).toBe(false);
      expect(PermissionGuard.canUpdateChecklist(viewer)).toBe(false);
      expect(PermissionGuard.canViewTrip(viewer)).toBe(true);
    });
  });
});
