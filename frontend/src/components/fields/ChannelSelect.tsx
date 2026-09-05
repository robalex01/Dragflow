import { useGuildChannels } from '../../api/queries';

interface ChannelSelectProps {
  guildId: string;
  value: string;
  onChange: (channelId: string) => void;
  channelType?: 'text' | 'voice';
}

export function ChannelSelect({ guildId, value, onChange, channelType }: ChannelSelectProps) {
  const { data: channels, isLoading } = useGuildChannels(guildId, channelType);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-card border border-surface-300 bg-white px-3 py-2 text-sm outline-none focus:border-ink-900"
    >
      <option value="">{isLoading ? 'Chargement...' : 'Sélectionner un salon'}</option>
      {channels?.map((c) => (
        <option key={c.id} value={c.id}>
          #{c.name}
        </option>
      ))}
    </select>
  );
}
