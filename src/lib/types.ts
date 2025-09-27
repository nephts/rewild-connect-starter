export type Role = 'Pending' | 'Viewer' | 'Volunteer' | 'Intern' | 'Admin'

export interface User {
  id: string
  name: string
  role: Role
  phone?: string
  bio?: string
  skills?: string[]
  availability?: string
  emergency?: string
  hours?: number
}

export interface Location {
  id: string
  name: string
  address: string
  description: string
  capacity: number
  coordinator: string
  equipment: string[]
  activities: string[]
  images: string[]
}

export interface Shift {
  id: string
  locationId: string
  date: string
  start: string
  end: string
  max: number
  signedUpUserIds: string[]
  title: string
  description: string
  note?: string
}

export interface Message {
  id: string
  fromId: string
  toId: string
  subject: string
  content: string
  read: boolean
  timestamp: number
}

export interface Photo {
  id: string
  userId: string
  locationId: string
  title: string
  description: string
  url: string
  tags: string[]
  createdAt: number
}
