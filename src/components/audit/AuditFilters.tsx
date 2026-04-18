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
        className="input-md !pl-14 !rounded-[32px] shadow-sm !h-16"
      />
    </div>
  );
};
