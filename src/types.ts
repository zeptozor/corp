import { PlanStatus, PostType, UserRole } from '@prisma/client'

export interface User {
  id: string
  photo: string
  telegram: string
  name: string
  role: UserRole
  isOwner: boolean
  email1: string
  email2: string
  groupNumber?: number
  birthDate: Date
  employmentDate: Date
  positions: Position[]
  createdAt: Date
}

export interface Position {
  id: string
  title: string
  description: string
  regulations: Regulation[]
}

export interface Regulation {
  id: string
  title: string
  content: string
  keywords: string[]
  group: {
    id: string
    name: string
  }
}

export interface RegulationGroup {
  id: string
  name: string
  description?: string
  children: RegulationGroup[]
}

export interface Event {
  id: string
  title: string
  description?: string
  date: string
  type: string
  user?: {
    id: string
    name: string
  }
}

export interface Post {
  id: string
  title: string
  content: string
  type: PostType
  status?: PlanStatus
  dueDate?: string
  author: {
    id: string
    name: string
  }
  likes: {
    userId: string
  }[]
  comments: {
    id: string
    content: string
    user: {
      id: string
      name: string
    }
    createdAt: string
  }[]
  createdAt: string
}

export const PostTypes: Record<PostType | 'all', string> = {
  all: 'Все',
  plan: 'Планы',
  event: 'События',
  achievement: 'Достижения',
  announcement: 'Объявления',
}

export const PlanStatuses: Record<PlanStatus, string> = {
  completed: 'Выполнен',
  in_progress: 'Выполняется',
  pending: 'Не выполнен',
}
