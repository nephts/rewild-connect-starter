import React from 'react'
import { useStore } from '@/lib/store'
import { TriangleAlert, MessageSquare } from 'lucide-react'

export function Messages() {
  const role = useStore(s => s.role)
  const me = useStore(s => s.me)
  const users = useStore(s => s.users)
  const messages = useStore(s => s.messages)
  const send = useStore(s => s.send)

  const [toId, setToId] = React.useState(users[0]?.id ?? '')
  const [subject, setSubject] = React.useState('')
  const [content, setContent] = React.useState('')
  const canSend = role !== 'Viewer' && role !== 'Pending'

  const inbox = messages.filter(m => m.toId === me.id)
  const sent = messages.filter(m => m.fromId === me.id)
  const scrollToCompose = () => {
    document.getElementById('compose-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="flex flex-col gap-6 min-h-[calc(100vh-10rem)]">
      <div className="card p-6 shadow-lg shadow-emerald-50/70 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Messages</h2>
          <p className="text-sm text-slate-500">Communicate with mentors and teammates. Compose a note or review recent conversations.</p>
        </div>
        <button type="button" className="btn hidden sm:inline-flex" onClick={scrollToCompose}>New Message</button>
      </div>

      <div id="compose-panel" className="card p-6 shadow-md shadow-emerald-50/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Compose Message</h3>
            <p className="text-sm text-slate-500">Select a teammate and share updates or questions.</p>
          </div>
        </div>
        <div className="space-y-3">
          <select className="input" value={toId} onChange={e=>setToId(e.target.value)}>
            {users.filter(u => u.id !== me.id).map(u => <option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
          </select>
          <input className="input" placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)} />
          <textarea className="input" placeholder="Write a message..." rows={4} value={content} onChange={e=>setContent(e.target.value)} />
          <div className="flex flex-wrap gap-3">
            <button
              disabled={!canSend || !subject || !content}
              onClick={()=>{ send(toId, subject, content); setSubject(''); setContent(''); }}
              className={canSend && subject && content ? 'btn' : 'inline-flex items-center gap-2 rounded-full px-4 py-2 bg-slate-100 text-slate-400 cursor-not-allowed'}>
              <MessageSquare className="h-4 w-4" /> Send Message
            </button>
            <button onClick={()=>{ setSubject(''); setContent(''); }} className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-700">Cancel</button>
          </div>
          {!canSend && <div className="text-xs text-slate-400 inline-flex items-center gap-1"><TriangleAlert className="h-4 w-4 text-amber-400" /> Viewers/Pending cannot send messages</div>}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 flex-1">
        <div className="card p-5 shadow-md shadow-emerald-50/80 min-h-[18rem]">
          <div className="font-semibold text-slate-700 mb-3">Received Messages</div>
          <ul className="space-y-2 max-h-64 overflow-auto pr-2">
            {inbox.length === 0 && <li className="text-sm text-slate-400">No messages received.</li>}
            {inbox.map(m => (
              <li key={m.id} className="rounded-2xl border border-slate-100 p-3 bg-white/80">
                <div className="text-sm font-semibold text-slate-800">{m.subject}</div>
                <div className="text-xs text-slate-400">From: {userName(users, m.fromId)}</div>
                <p className="text-sm mt-1 text-slate-600 leading-5">{m.content}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-5 shadow-md shadow-emerald-50/80 min-h-[18rem]">
          <div className="font-semibold text-slate-700 mb-3">Sent Messages</div>
          <ul className="space-y-2 max-h-64 overflow-auto pr-2">
            {sent.length === 0 && <li className="text-sm text-slate-400">No messages sent yet.</li>}
            {sent.map(m => (
              <li key={m.id} className="rounded-2xl border border-slate-100 p-3 bg-white/80">
                <div className="text-sm font-semibold text-slate-800">{m.subject}</div>
                <div className="text-xs text-slate-400">To: {userName(users, m.toId)}</div>
                <p className="text-sm mt-1 text-slate-600 leading-5">{m.content}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function userName(users: any[], id: string) {
  return users.find(u => u.id === id)?.name ?? 'Unknown'
}
