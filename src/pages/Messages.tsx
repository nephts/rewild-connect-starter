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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-white/10 p-4">
        <div className="font-medium mb-2">Inbox</div>
        <ul className="space-y-2 max-h-64 overflow-auto pr-2">
          {inbox.length === 0 && <li className="text-sm text-white/60">No messages</li>}
          {inbox.map(m => (
            <li key={m.id} className="rounded-xl border border-white/10 p-3">
              <div className="text-sm font-medium">{m.subject}</div>
              <div className="text-xs text-white/60">From: {userName(users, m.fromId)}</div>
              <p className="text-sm mt-1">{m.content}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-white/10 p-4">
        <div className="font-medium mb-2">Sent</div>
        <ul className="space-y-2 max-h-64 overflow-auto pr-2">
          {sent.length === 0 && <li className="text-sm text-white/60">No messages</li>}
          {sent.map(m => (
            <li key={m.id} className="rounded-xl border border-white/10 p-3">
              <div className="text-sm font-medium">{m.subject}</div>
              <div className="text-xs text-white/60">To: {userName(users, m.toId)}</div>
              <p className="text-sm mt-1">{m.content}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-white/10 p-4">
        <div className="font-medium mb-2">Compose</div>
        <div className="space-y-2">
          <select className="w-full rounded-xl bg-zinc-900/60 border border-white/10 p-2" value={toId} onChange={e=>setToId(e.target.value)}>
            {users.filter(u => u.id !== me.id).map(u => <option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
          </select>
          <input className="w-full rounded-xl bg-zinc-900/60 border border-white/10 p-2" placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)} />
          <textarea className="w-full rounded-xl bg-zinc-900/60 border border-white/10 p-2" placeholder="Write a message..." rows={4} value={content} onChange={e=>setContent(e.target.value)} />
          <button
            disabled={!canSend || !subject || !content}
            onClick={()=>{ send(toId, subject, content); setSubject(''); setContent(''); }}
            className={canSend && subject && content ? 'inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-emerald-600 hover:bg-emerald-500' : 'inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white/10 text-white/60 cursor-not-allowed'}>
            <MessageSquare className="h-4 w-4" /> Send
          </button>
          {!canSend && <div className="text-xs text-white/60 inline-flex items-center gap-1"><TriangleAlert className="h-4 w-4" /> Viewers/Pending cannot send messages</div>}
        </div>
      </div>
    </div>
  )
}

function userName(users: any[], id: string) {
  return users.find(u => u.id === id)?.name ?? 'Unknown'
}