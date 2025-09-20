import React from 'react'
import { useStore } from '@/lib/store'
import { TriangleAlert, Images as ImagesIcon } from 'lucide-react'

export function Photos() {
  const role = useStore(s => s.role)
  const photos = useStore(s => s.photos)
  const locations = useStore(s => s.locations)
  const upload = useStore(s => s.upload)

  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [locationId, setLocationId] = React.useState(locations[0]?.id ?? '')
  const [url, setUrl] = React.useState('')
  const canUpload = role !== 'Viewer' && role !== 'Pending'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {photos.map(p => (
          <div key={p.id} className="rounded-2xl border border-white/10 overflow-hidden">
            <img src={p.url} alt={p.title} className="h-44 w-full object-cover" />
            <div className="p-3">
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-white/60">{locations.find(l => l.id === p.locationId)?.name}</div>
              <p className="text-sm mt-1">{p.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.tags?.map(t => <span key={t} className="rounded-full bg-white/5 px-2 py-1 text-xs">#{t}</span>)}
              </div>
            </div>
          </div>
        ))}
        {photos.length === 0 && <div className="text-sm text-white/60">No photos yet.</div>}
      </div>
      <div className="rounded-2xl border border-white/10 p-4">
        <div className="font-medium mb-2">Upload</div>
        <div className="space-y-2">
          <input className="w-full rounded-xl bg-zinc-900/60 border border-white/10 p-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <textarea className="w-full rounded-xl bg-zinc-900/60 border border-white/10 p-2" placeholder="Description" rows={3} value={description} onChange={e=>setDescription(e.target.value)} />
          <select className="w-full rounded-xl bg-zinc-900/60 border border-white/10 p-2" value={locationId} onChange={e=>setLocationId(e.target.value)}>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <input className="w-full rounded-xl bg-zinc-900/60 border border-white/10 p-2" placeholder="Image URL" value={url} onChange={e=>setUrl(e.target.value)} />
          <button
            disabled={!canUpload || !title || !url}
            onClick={()=>{ upload(title, description, locationId, url); setTitle(''); setDescription(''); setUrl(''); }}
            className={canUpload && title && url ? 'inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-emerald-600 hover:bg-emerald-500' : 'inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white/10 text-white/60 cursor-not-allowed'}>
            <ImagesIcon className="h-4 w-4" /> Upload
          </button>
          {!canUpload && <div className="text-xs text-white/60 inline-flex items-center gap-1"><TriangleAlert className="h-4 w-4" /> Viewers/Pending cannot upload photos</div>}
        </div>
      </div>
    </div>
  )
}