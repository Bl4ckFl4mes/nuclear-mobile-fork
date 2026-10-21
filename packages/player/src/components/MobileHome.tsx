import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ListMusic, FileText, Blocks, Import } from 'lucide-react';
import { type FC } from 'react';

import { useTranslation } from '@nuclearplayer/i18n';

import { usePlaylistStore } from '../stores/playlistStore';
import { useSettingsModalStore } from '../stores/settingsModalStore';

const tiles = [
  { key: 'playlists', icon: ListMusic, to: '/playlists', bg: 'linear-gradient(135deg, #ff3333, #991111)' },
  { key: 'txt', icon: FileText, to: null, bg: 'linear-gradient(135deg, #ff7a33, #b24a0f)' },
  { key: 'import', icon: Import, to: '/playlists', bg: 'linear-gradient(135deg, #aa33ff, #5a1a99)' },
  { key: 'plugins', icon: Blocks, to: '/plugins', bg: 'linear-gradient(135deg, #3388ff, #1144aa)' },
];

export const MobileHome: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('playlists');
  const openSettings = useSettingsModalStore((state) => state.open);
  const index = usePlaylistStore((state) => state.index);
  const playlists = useMemo(
    () => Object.entries(index ?? {}).map(([id, p]) => ({ id, ...(p as { name?: string }) })),
    [index],
  );
  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? 'Gute Nacht' : hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';

  const openTile = (to: string) => navigate({ to });

  return (
    <div style={{ padding: 16, paddingBottom: 120, minHeight: '100%' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f0f0f0', margin: '0 0 16px' }}>
        {greeting}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {tiles.map(({ key, icon: Icon, to, bg }) => (
          <button
            key={key}
            onClick={() => (to ? openTile(to) : openSettings())}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 18,
              padding: 14,
              minHeight: 92,
              borderRadius: 10,
              border: 'none',
              backgroundImage: bg,
              cursor: 'pointer',
            }}
          >
            <Icon size={26} color="#ffffff" />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, textAlign: 'left' }}>
              {key === 'playlists' ? (t('title') as string)
                : key === 'txt' ? 'TXT → Playlist'
                : key === 'import' ? (t('importUrl') as string)
                : 'Plugins'}
            </span>
          </button>
        ))}
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#f0f0f0', margin: '22px 0 10px' }}>
        {t('title')}
      </h2>
      {playlists.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {playlists.slice(0, 8).map(({ id, name }) => (
            <button
              key={id}
              onClick={() => navigate({ to: '/playlists/$playlistId', params: { playlistId: id } })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                background: '#151515',
                border: '1px solid #2a2a2a',
                cursor: 'pointer',
              }}
            >
              <ListMusic size={22} color="#ff3333" />
              <span style={{ color: '#f0f0f0', fontSize: 15, fontWeight: 600 }}>
                {name || id}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p style={{ color: '#909090', fontSize: 14, margin: 0 }}>
          Noch keine Playlists — oben erstellen oder importieren.
        </p>
      )}
    </div>
  );
};
