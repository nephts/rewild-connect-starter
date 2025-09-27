import { create } from 'zustand'
import { User, Location, Shift, Message, Photo, Role } from './types'
import { initialLocations, initialShifts, demoUsers, initialMessages, initialPhotos, hoursBetween, ACCESS_CODES } from './data'
import { post } from './api'

interface State {
  setMe: any
  setRole: any
  role: Role
  me: User
  users: User[]
  userNotes: Record<string, string>
  locations: Location[]
  shifts: Shift[]
  messages: Message[]
  photos: Photo[]
  nav: string

  // derived
  myId: string
  login: (code: string, name: string) => { ok: boolean, msg?: string }
  logout: () => void
  setNav: (nav: string) => void

  signup: (shiftId: string) => void
  send: (toId: string, subject: string, content: string) => void
  upload: (title: string, description: string, locationId: string, url: string) => void
  addLocation: (name: string, address: string, description: string) => void
  addShift: (locationId: string, date: string, start: string, end: string, max: number, title: string, description?: string, note?: string) => void
  adjustHours: (userId: string, delta: number) => void
  setUserNote: (userId: string, note: string) => void
  removeSignup: (shiftId: string, userId: string) => void
}

export const useStore = create<State>((set, get) => ({
  // add to your store's actions:
  setRole: (role: string) => set((s: any) => ({ ...s, role })),
  setMe:   (patch: Partial<any>) => set((s: any) => ({ ...s, me: { ...s.me, ...patch } })),
  role: 'Pending',
  me: { id: 'me', name: 'You', role: 'Pending', hours: 0 },
  users: [...demoUsers],
  userNotes: {},
  locations: initialLocations,
  shifts: initialShifts,
  messages: initialMessages,
  photos: initialPhotos,
  nav: 'dashboard',

  get myId() { return get().me.id },

  login: (code, name) => {
    const target = (Object.entries(ACCESS_CODES).find(([k,v]) => v === code)?.[0] ?? '')
    if (!target || target === 'Pending') return { ok: false, msg: 'Invalid access code' }
    set(s => ({
      role: target as Role,
      me: { ...s.me, name: name || s.me.name, role: target as Role },
      users: s.users.find(u => u.id === s.me.id) ? s.users : [...s.users, { id: s.me.id, name: name || 'You', role: target as Role, hours: 0 }]
    }))
    return { ok: true }
  },

  logout: async () => {
  try { await post('/api/logout', {}) } catch {}
  set(s => ({ role: 'Pending', me: { ...s.me, role: 'Pending' }, nav: 'dashboard' }))
},

  setNav: (nav) => set({ nav }),

  signup: (shiftId) => set(s => ({
    shifts: s.shifts.map(sh => {
      if (sh.id !== shiftId) return sh
      if (sh.signedUpUserIds.includes(s.me.id)) return sh
      if (sh.signedUpUserIds.length >= sh.max) return sh
      return { ...sh, signedUpUserIds: [...sh.signedUpUserIds, s.me.id] }
    })
  })),

  send: (toId, subject, content) => set(s => ({
    messages: [...s.messages, { id: `m-${Math.random().toString(36).slice(2,8)}`, fromId: s.me.id, toId, subject, content, read: false, timestamp: Date.now() }]
  })),

  upload: (title, description, locationId, url) => set(s => ({
    photos: [...s.photos, { id: `p-${Math.random().toString(36).slice(2,8)}`, userId: s.me.id, locationId, title, description, url, tags: [], createdAt: Date.now() }]
  })),

  addLocation: (name, address, description) => set(s => ({
    locations: [...s.locations, { id: `loc-${Math.random().toString(36).slice(2,6)}`, name, address, description, capacity: 20, coordinator: 'TBD', equipment: [], activities: [], images: [] }]
  })),

  addShift: (locationId, date, start, end, max, title, description, note) => set(s => ({
    shifts: [...s.shifts, {
      id: `sh-${Math.random().toString(36).slice(2,6)}`,
      locationId,
      date,
      start,
      end,
      max,
      signedUpUserIds: [],
      title: title || 'Volunteer shift',
      description: description || 'Volunteer shift',
      note,
    }]
  })),

  adjustHours: (userId, delta) => set(s => ({
    users: s.users.map(u => u.id === userId ? { ...u, hours: (u.hours || 0) + delta } : u)
  })),

  setUserNote: (userId, note) => set(s => ({
    userNotes: { ...s.userNotes, [userId]: note }
  })),

  removeSignup: (shiftId, userId) => set(s => ({
    shifts: s.shifts.map(sh => sh.id === shiftId
      ? { ...sh, signedUpUserIds: sh.signedUpUserIds.filter(id => id !== userId) }
      : sh)
  })),
}))
