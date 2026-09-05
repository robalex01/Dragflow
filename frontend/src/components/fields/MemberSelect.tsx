import { useState } from 'react';
import { useGuildMembers } from '../../api/queries';
import { Avatar } from '../Avatar';

interface MemberSelectProps {
  guildId: string;
  value: string;
  onChange: (memberId: string) => void;
}

export function MemberSelect({ guildId, value, onChange }: MemberSelectProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const { data: members, isLoading } = useGuildMembers(guildId, search);

  const selected = members?.find((m) => m.id === value);

  return (
    <div className="relative">
      <input
        type="text"
        value={open ? search : selected ? selected.displayName : search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
          if (value) onChange('');
        }}
        onFocus={() => setOpen(true)}
        placeholder="Rechercher un membre..."
        className="w-full rounded-card border border-surface-300 bg-white px-3 py-2 text-sm outline-none focus:border-ink-900"
      />

      {open && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-card border border-surface-300 bg-white shadow-md">
          {isLoading && <p className="px-3 py-2 text-sm text-neutral-400">Recherche...</p>}
          {!isLoading && members?.length === 0 && (
            <p className="px-3 py-2 text-sm text-neutral-400">Aucun membre trouvé.</p>
          )}
          {members?.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onChange(m.id);
                setSearch(m.displayName);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-200"
            >
              <Avatar src={m.avatarUrl} alt={m.displayName} size={24} />
              <span>{m.displayName}</span>
              <span className="text-xs text-neutral-400">@{m.username}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
