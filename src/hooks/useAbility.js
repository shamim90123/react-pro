// src/hooks/useAbility.js
import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";

/**
 * Expects your AuthContext to expose either:
 *  - user.roles:     string[] or [{name}]
 *  - user.permissions: string[] or [{name}]
 * or top-level `roles`, `permissions`.
 */
export function useAbility() {
  const { user } = useAuth() || {};

  const { roles, permissions } = useMemo(() => {
    const rRaw = user?.roles_list ?? user?.roles ?? [];
    const pRaw = user?.permissions_list ?? user?.permissions ?? [];

    const roles = new Set(
      rRaw.map((x) => (typeof x === "string" ? x : x?.name)).filter(Boolean)
    );
    const permissions = new Set(
      pRaw.map((x) => (typeof x === "string" ? x : x?.name)).filter(Boolean)
    );

    return { roles, permissions };
  }, [user]);

  const isAdmin =
    roles.has("admin") || permissions.has("*"); // support wildcard if you use it

  const hasRole = (name) => isAdmin || roles.has(name);

  /**
   * can("leads.view") or can(["leads.view","stats.view"], { any: true })
   * options: { any?: boolean }  // default: all must pass
   */
  const can = (need, opts = {}) => {
    if (isAdmin) return true;
    if (!need) return true;

    const list = Array.isArray(need) ? need : [need];
    const any = !!opts.any;

    if (any) return list.some((p) => permissions.has(p));
    return list.every((p) => permissions.has(p));
  };

  return { roles, permissions, isAdmin, hasRole, can };
}
