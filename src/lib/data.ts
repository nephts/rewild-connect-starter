import { Location, Shift, User, Message, Photo, Role } from './types'

export const ACCESS_CODES: Record<Role, string> = {
  Pending: '',
  Viewer: 'VIEW-123',
  Volunteer: 'VOL-123',
  Intern: 'INT-123',
  Admin: 'ADMIN-123',
}

export const ROLE_GOAL: Record<Role, number> = {
  Viewer: 0,
  Volunteer: 30,
  Intern: 60,
  Admin: 0,
  Pending: 0,
}

export const IMPACT = {
  co2PerHourKg: 1.8,
  treesPerHour: 0.02,
  carsOffPer10h: 1 / 10,
  litersWaterPerHour: 50,
}

export const initialLocations: Location[] = [
  {
    id: 'loc-1',
    name: 'Crab Meadow Dune Restoration',
    address: '99 Waterside Ave, Northport, NY',
    description: 'Remove invasives, plant beach grass, and repair fencing.',
    capacity: 24,
    coordinator: 'Maya Lopez',
    equipment: ['Gloves', 'Buckets', 'Rakes'],
    activities: ['Invasive removal', 'Planting', 'Trash pick-up'],
    images: ['https://images.unsplash.com/photo-1529101091764-c3526daf38fe?q=80&w=1400&auto=format&fit=crop'],
  },
  {
    id: 'loc-2',
    name: 'Heckscher Park Cleanup',
    address: 'Prime Ave, Huntington, NY',
    description: 'Litter patrol, shoreline sweep, and storm-drain stenciling.',
    capacity: 40,
    coordinator: 'Jordan Kim',
    equipment: ['Grabbers', 'Bags', 'Safety vests'],
    activities: ['Litter patrol', 'Sorting', 'Reporting'],
    images: ['https://images.unsplash.com/photo-1523978591478-c753949ff840?q=80&w=1400&auto=format&fit=crop'],
  },
]

export const initialShifts: Shift[] = [
  {
    id: 'sh-1',
    locationId: 'loc-1',
    date: '2025-09-20',
    start: '09:00',
    end: '12:00',
    max: 12,
    signedUpUserIds: [],
    title: 'Dune Restoration Morning Crew',
    description: 'Planting beach grass and light fencing repairs.',
    note: 'Bring work gloves and sun protection.',
  },
  {
    id: 'sh-2',
    locationId: 'loc-2',
    date: '2025-09-22',
    start: '14:00',
    end: '17:00',
    max: 20,
    signedUpUserIds: [],
    title: 'Park-Wide Cleanup',
    description: 'Litter patrol and debris sorting across the park.',
  },
]

export const demoUsers: User[] = [
  { id: 'u-admin', name: 'Alex Admin', role: 'Admin', phone: '555-1010', bio: 'Program lead', skills: ['Logistics', 'Data'], availability: 'Weekends', emergency: 'N/A', hours: 0 },
  { id: 'u-int', name: 'Ivy Intern', role: 'Intern', phone: '555-2020', bio: 'Bio student', skills: ['Planting', 'Sampling'], availability: 'Sat mornings', emergency: 'Mom 555-3030', hours: 12 },
  { id: 'u-vol', name: 'Vic Volunteer', role: 'Volunteer', phone: '555-4040', bio: 'Local naturalist', skills: ['Trash sort', 'Survey'], availability: 'Weekdays 3-6pm', emergency: 'Sis 555-5050', hours: 8 },
]

export const initialMessages: Message[] = [
  { id: 'm-1', fromId: 'u-admin', toId: 'u-int', subject: 'Welcome!', content: "Glad you're on the team—see you Saturday at the dunes.", read: false, timestamp: Date.now() - 1000 * 60 * 60 * 5 },
]

export const initialPhotos: Photo[] = [
  { id: 'p-1', userId: 'u-vol', locationId: 'loc-2', title: 'Heckscher haul', description: '15 bags of trash in 2 hours!', url: 'https://images.unsplash.com/photo-1561553590-267fc7166983?q=80&w=1400&auto=format&fit=crop', tags: ['cleanup', 'community'], createdAt: Date.now() - 1000 * 60 * 60 * 24 },
]

export function hoursBetween(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return Math.max(0, (eh + em/60) - (sh + sm/60))
}
