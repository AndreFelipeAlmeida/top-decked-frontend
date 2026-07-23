import { useContext } from 'react';
import { TenantContext } from '@/contexts/TenantContext';

export const useTenant = () => {
  const context = useContext(TenantContext);

  if (context === undefined) {
    throw new Error('useTenant deve ser usado dentro de um TenantProvider');
  }

  return context;
};

export const useIsTenant = () => useTenant().isTenant;
