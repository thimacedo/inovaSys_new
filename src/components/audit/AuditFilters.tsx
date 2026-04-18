import React from 'react';
import { Search } from 'lucide-react';

interface AuditFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  placeholder: string;
}

export const AuditFilters: React.FC<AuditFiltersProps> = ({ searchTerm, setSearchTerm, placeholder }) => {
  return (
    <div className="relative mb-10">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-md-on-surface-variant/40" size={20} />
      <input 
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-14 w-full bg-md-surface-variant rounded-t-xl border-b-2 border-md-outline px-4 text-md-on-surface transition-colors duration-200 focus:border-md-primary focus:outline-none placeholder:text-md-on-surface-variant/50 !pl-14 !rounded-[32px] shadow-sm !h-16"
      />
    </div>
  );
};
