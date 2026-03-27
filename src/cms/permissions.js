const ROLE_CAPABILITIES = {
  admin: new Set(['pages:read', 'pages:write', 'pages:publish', 'media:write', 'settings:write']),
  editor: new Set(['pages:read', 'pages:write', 'pages:publish', 'media:write']),
  author: new Set(['pages:read', 'pages:write', 'media:write']),
  viewer: new Set(['pages:read']),
};

export class PermissionService {
  can(user, capability) {
    if (!user?.role) return false;
    const caps = ROLE_CAPABILITIES[user.role];
    if (!caps) return false;
    return caps.has(capability);
  }

  assert(user, capability) {
    if (!this.can(user, capability)) {
      throw new Error(`Forbidden: missing capability ${capability}`);
    }
  }
}

export const permissionService = new PermissionService();
