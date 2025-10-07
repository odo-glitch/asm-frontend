'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Plus, Building, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { OrganizationsAPI } from '@/lib/api/organizations';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  role: string;
}

interface BrandSwitcherProps {
  currentOrgId?: string;
  onOrgChange?: (orgId: string) => void;
}

export function BrandSwitcher({ currentOrgId, onOrgChange }: BrandSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const maxRetries = 3;
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const orgsAPI = new OrganizationsAPI(supabase);

  const loadOrganizations = useCallback(async () => {
    try {
      setError(false);
      setLoading(true);
      const { organizations: orgs } = await orgsAPI.getUserOrganizations();
      
      if (!Array.isArray(orgs)) {
        throw new Error('Invalid response format');
      }
      
      setOrganizations(orgs);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Error loading organizations:', error);
      setError(true);
      
      // Only show toast if we've hit max retries
      if (retryCount >= maxRetries - 1) {
        toast({
          title: 'Error',
          description: 'Failed to load organizations',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [orgsAPI, toast, retryCount]);

  useEffect(() => {
    if (error && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        loadOrganizations();
      }, Math.min(1000 * Math.pow(2, retryCount), 5000)); // Exponential backoff with 5s max
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, loadOrganizations]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Set current org when organizations are loaded
    if (organizations.length > 0) {
      const selected = currentOrgId 
        ? organizations.find(org => org.id === currentOrgId)
        : organizations[0];
      
      if (selected) {
        setCurrentOrg(selected);
        
        // Only auto-select on initial load
        if (!hasInitialized && !currentOrgId && onOrgChange) {
          setHasInitialized(true);
          onOrgChange(selected.id);
        }
      }
    }
  }, [organizations, currentOrgId, hasInitialized, onOrgChange]);



  const handleOrgSelect = (org: Organization) => {
    setCurrentOrg(org);
    setIsOpen(false);
    if (onOrgChange) {
      onOrgChange(org.id);
    }
    // Optionally store in localStorage for persistence
    localStorage.setItem('selectedOrgId', org.id);
  };

  const handleCreateNewBrand = () => {
    setIsOpen(false);
    router.push('/organizations/new');
  };

  if (loading) {
    return (
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!loading && !error && organizations.length === 0) {
    return (
      <div className="px-4 py-3 border-b border-gray-200">
        <button
          onClick={handleCreateNewBrand}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Your First Brand
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="px-4 py-3 border-b border-gray-200">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {currentOrg?.logo_url ? (
              <img 
                src={currentOrg.logo_url} 
                alt={currentOrg.name}
                className="h-6 w-6 rounded object-cover"
              />
            ) : (
              <Building className="h-6 w-6 text-gray-500" />
            )}
            <span className="font-medium text-sm truncate">
              {currentOrg?.name || 'Select Brand'}
            </span>
          </div>
          <ChevronDown 
            className={`h-4 w-4 text-gray-500 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-lg shadow-lg z-50">
          <div className="max-h-64 overflow-y-auto">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => handleOrgSelect(org)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {org.logo_url ? (
                    <img 
                      src={org.logo_url} 
                      alt={org.name}
                      className="h-6 w-6 rounded object-cover"
                    />
                  ) : (
                    <Building className="h-6 w-6 text-gray-400" />
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium truncate">{org.name}</p>
                    <p className="text-xs text-gray-500">{org.role}</p>
                  </div>
                </div>
                {currentOrg?.id === org.id && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
          
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={handleCreateNewBrand}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create New Brand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}