/**
 * companyScope middleware
 *
 * Reads the x-company-id header from every request and attaches it
 * to req.companyId. All routes use req.companyId to filter their
 * PocketBase queries — this is the core of multi-tenant isolation.
 *
 * The webhook route is excluded because it comes from Vapi, not the dashboard.
 */
export function companyScope(req, res, next) {
  const companyId = req.headers['x-company-id'] ?? '';
  req.companyId   = companyId;
  next();
}

/**
 * buildFilter — builds a PocketBase filter string that always includes
 * company_id scoping when a companyId is present.
 *
 * @param {string}   companyId  - from req.companyId
 * @param {string[]} extra      - additional filter conditions
 * @returns {string}
 */
export function buildFilter(companyId, extra = []) {
  const parts = [];
  if (companyId) parts.push(`company_id = "${companyId}"`);
  parts.push(...extra.filter(Boolean));
  return parts.join(' && ');
}
