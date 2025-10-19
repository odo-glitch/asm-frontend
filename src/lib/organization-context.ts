// Organization context management
const SELECTED_ORG_KEY = 'selectedOrgId';

export function getSelectedOrganizationId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SELECTED_ORG_KEY);
}

export function setSelectedOrganizationId(orgId: string | null) {
  if (typeof window === 'undefined') return;
  
  if (orgId) {
    localStorage.setItem(SELECTED_ORG_KEY, orgId);
  } else {
    localStorage.removeItem(SELECTED_ORG_KEY);
  }
  
  // Trigger a custom event to notify components
  window.dispatchEvent(new CustomEvent('organizationChanged', { detail: { orgId } }));
}

export function clearSelectedOrganization() {
  setSelectedOrganizationId(null);
}
