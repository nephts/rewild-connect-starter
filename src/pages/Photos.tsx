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
    <section className="flex flex-col gap-6">
      <div className="card p-6 shadow-lg shadow-emerald-50/70 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Photo Gallery</h2>
          <p className="text-sm text-slate-500">Celebrate volunteer wins and document progress across sites.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
        {photos.map(p => (
          <div key={p.id} className="card overflow-hidden shadow-md shadow-emerald-50/80">
            <img src={p.url} alt={p.title} className="h-44 w-full object-cover" />
            <div className="p-4 text-slate-600 space-y-1">
              <div className="font-semibold text-slate-900">{p.title}</div>
              <div className="text-xs text-slate-400">{locations.find(l => l.id === p.locationId)?.name}</div>
              <p className="text-sm leading-5 mt-1">{p.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.tags?.map(t => <span key={t} className="rounded-full bg-emerald-100/70 text-emerald-700 px-2 py-1 text-xs font-medium">#{t}</span>)}
              </div>
            </div>
          </div>
        ))}
        {photos.length === 0 && <div className="text-sm text-slate-400">No photos yet.</div>}
      </div>
      <div className="card p-5 shadow-md shadow-emerald-50/80">
        <div className="font-semibold text-slate-700 mb-3">Upload</div>
        <div className="space-y-2">
          <input className="input" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <textarea className="input" placeholder="Description" rows={3} value={description} onChange={e=>setDescription(e.target.value)} />
          <select className="input" value={locationId} onChange={e=>setLocationId(e.target.value)}>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <input className="input" placeholder="Image URL" value={url} onChange={e=>setUrl(e.target.value)} />
          <button
            disabled={!canUpload || !title || !url}
            onClick={()=>{ upload(title, description, locationId, url); setTitle(''); setDescription(''); setUrl(''); }}
            className={canUpload && title && url ? 'btn justify-center' : 'inline-flex items-center gap-2 rounded-full px-4 py-2 bg-slate-100 text-slate-400 cursor-not-allowed'}>
            <ImagesIcon className="h-4 w-4" /> Upload
          </button>
          {!canUpload && <div className="text-xs text-slate-400 inline-flex items-center gap-1"><TriangleAlert className="h-4 w-4 text-amber-400" /> Viewers/Pending cannot upload photos</div>}
        </div>
      </div>
      </div>
    </section>
  )
}
