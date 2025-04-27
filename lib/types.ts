export interface User {
  id: number
  uid: string
  email: string
  name: string
  photo_url?: string
  created_at: string
}

export interface Wallet {
  id: number
  user_id: number
  balance: string
  created_at: string
  updated_at: string
}

export interface Deposit {
  id: number
  user_id: number
  amount_usd: string
  amount_inr?: string
  payment_method: string
  status: string
  screenshot?: string
  transaction_id?: string
  admin_notes?: string
  created_at: string
  updated_at: string
  name?: string
  email?: string
}

export interface Transaction {
  id: number
  user_id: number
  type: string
  amount: string
  description: string
  reference_id: string
  balance_after: string
  created_at: string
}

export interface Order {
  id: number
  order_id: string
  user_id?: number
  platform: string
  service: string
  link?: string
  quantity: number
  total: number
  status: string
  name: string
  email: string
  message?: string
  screenshot?: string
  wallet_payment?: boolean
  created_at: string
}

export interface Testimonial {
  id: string | number
  user_id?: number
  name: string
  title: string
  rating: number
  content: string
  approved: boolean
  avatar?: string | null
  created_at: string
}

export interface Service {
  id: string | number
  platform: string
  name: string
  price: number
  active?: boolean
  created_at?: string
}

export interface Admin {
  id: number
  username: string
  password_hash: string
  created_at: string
}

export interface Setting {
  id: number
  key: string
  value: string
  updated_at: string
}
