"use server"

import { neon } from "@neondatabase/serverless"
import * as db from "@/lib/db"
import { cookies } from "next/headers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Re-export all functions from db
export const {
  // User functions
  createUser,
  getUserByEmail,
  getUserById,
  getUserByUid,
  getAllUsers,
  updateUser,

  // Order functions
  createOrder,
  getOrderById,
  getOrdersByUserId,
  getOrdersByEmail,
  getAllOrders,
  updateOrderStatus,

  // Service functions
  createService,
  getServiceById,
  getServicesByPlatform,
  getAllServices,
  updateService,
  deleteService,

  // Testimonial functions
  createTestimonial,
  getTestimonialById,
  getApprovedTestimonials,
  getAllTestimonials,
  updateTestimonialApproval,

  // Settings functions
  getSetting,
  getAllSettings,
  updateSetting,

  // Admin functions
  createAdmin,
  getAdminByUsername,
  verifyAdmin,

  // Wallet functions
  createWallet,
  getUserWallet,
  updateWalletBalance,
  addToWalletBalance,
  deductFromWalletBalance,

  // Deposit functions
  createDeposit,
  getDepositById,
  getUserDeposits,
  getAllDeposits,
  updateDepositStatus,
  approveDeposit,

  // Transaction functions
  createTransaction,
  recordTransaction,
  getUserTransactions,
} = db

// Get current user session
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

// Order actions
export async function getOrder(orderId: string) {
  try {
    const order = await getOrderById(orderId)
    if (!order) {
      return { success: false, error: "Order not found" }
    }
    return { success: true, order }
  } catch (error) {
    console.error("Error fetching order:", error)
    return { success: false, error: "Failed to fetch order" }
  }
}

export async function getUserOrders(userId: number) {
  try {
    const orders = await getOrdersByUserId(userId)
    return { success: true, orders }
  } catch (error) {
    console.error("Error fetching user orders:", error)
    return { success: false, error: "Failed to fetch orders" }
  }
}

export async function getEmailOrders(email: string) {
  try {
    const orders = await db.getOrdersByEmail(email)
    return { success: true, orders }
  } catch (error) {
    console.error("Error getting orders by email:", error)
    return { success: false, error: "Failed to get orders" }
  }
}

// export async function createOrder(orderData: {
//   user_id?: number
//   platform: string
//   service: string
//   link?: string
//   quantity: number
//   total: number
//   name: string
//   email: string
//   message?: string
//   screenshot?: string
//   wallet_payment?: boolean
// }) {
//   try {
//     const order = await createOrderDB(orderData)
//     return { success: true, order }
//   } catch (error) {
//     console.error("Error creating order:", error)
//     return { success: false, error: "Failed to create order" }
//   }
// }

// export async function updateOrderStatus(orderId: string, status: string) {
//   try {
//     const order = await updateOrderStatusDB(orderId, status)
//     return { success: true, order }
//   } catch (error) {
//     console.error("Error updating order:", error)
//     return { success: false, error: "Failed to update order" }
//   }
// }

// Service actions
export async function getAllPlatforms() {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const platforms = await sql`SELECT DISTINCT platform FROM services WHERE active = true ORDER BY platform`
    return { success: true, platforms: platforms.map((p) => p.platform) }
  } catch (error) {
    console.error("Error fetching platforms:", error)
    return { success: false, error: "Failed to fetch platforms" }
  }
}

export async function getAllActiveServices() {
  try {
    const services = await getAllServices()
    return { success: true, services }
  } catch (error) {
    console.error("Error fetching services:", error)
    return { success: false, error: "Failed to fetch services" }
  }
}

export async function getServicesByPlatformName(platform: string) {
  try {
    const services = await getServicesByPlatform(platform)
    return { success: true, services }
  } catch (error) {
    console.error("Error fetching services:", error)
    return { success: false, error: "Failed to fetch services" }
  }
}

// Testimonial actions
export async function getApprovedTestimonialsData() {
  try {
    const testimonials = await getApprovedTestimonials()
    return testimonials
  } catch (error) {
    console.error("Error getting approved testimonials:", error)
    throw new Error("Failed to fetch testimonials")
  }
}

export async function submitTestimonial(testimonialData: {
  user_id?: number
  name: string
  title: string
  rating: number
  content: string
  avatar?: string
}) {
  try {
    const testimonial = await createTestimonial(testimonialData)
    return { success: true, testimonial }
  } catch (error) {
    console.error("Error submitting testimonial:", error)
    return { success: false, error: "Failed to submit testimonial" }
  }
}

// Wallet actions
export async function getUserWalletData(userId: number) {
  try {
    const wallet = await getUserWallet(userId)
    if (!wallet) {
      return { success: false, error: "Wallet not found" }
    }
    return { success: true, wallet }
  } catch (error) {
    console.error("Error getting user wallet:", error)
    return { success: false, error: "Failed to get wallet" }
  }
}

export async function createUserDeposit(depositData: {
  userId: number
  amountUSD: number
  paymentMethod: string
  screenshot?: string
  transactionId?: string
}) {
  try {
    const { userId, amountUSD, paymentMethod, screenshot, transactionId } = depositData

    // Validate minimum deposit
    if (amountUSD < 1) {
      return { success: false, error: "Minimum deposit amount is $1" }
    }

    // Convert USD to INR if using QR/UPI
    let amountINR = null
    if (paymentMethod === "QR/UPI") {
      const exchangeRate = await getUSDToINRRate()
      amountINR = Math.ceil(amountUSD * exchangeRate) // Round up to nearest integer
    }

    const deposit = await createDeposit({
      user_id: userId,
      amount_usd: amountUSD,
      amount_inr: amountINR,
      payment_method: paymentMethod,
      screenshot,
      transaction_id: transactionId,
    })

    return { success: true, deposit }
  } catch (error) {
    console.error("Error creating deposit:", error)
    return { success: false, error: "Failed to create deposit" }
  }
}

export async function getUserDepositHistory(userId: number) {
  try {
    const deposits = await getUserDeposits(userId)
    return { success: true, deposits }
  } catch (error) {
    console.error("Error getting user deposits:", error)
    return { success: false, error: "Failed to get deposits" }
  }
}

export async function getUserTransactionHistory(userId: number) {
  try {
    const transactions = await getUserTransactions(userId)
    return { success: true, transactions }
  } catch (error) {
    console.error("Error getting user transactions:", error)
    return { success: false, error: "Failed to get transactions" }
  }
}

// Admin actions
export async function adminLogin({
  username,
  password,
}: { username: string; password: string }): Promise<{ success: boolean; error?: string }> {
  try {
    const isValid = await verifyAdmin(username, password)

    if (isValid) {
      // Set a cookie to maintain session
      cookies().set("admin_session", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      })

      return { success: true }
    }

    return { success: false, error: "Invalid credentials" }
  } catch (error) {
    console.error("Error during login:", error)
    return { success: false, error: "Login failed" }
  }
}

// Admin logout
export async function adminLogout(): Promise<{ success: boolean }> {
  cookies().delete("admin_session")
  return { success: true }
}

// Check admin session
export async function checkAdminSession(): Promise<{ success: boolean }> {
  const session = cookies().get("admin_session")
  return { success: !!session }
}

export async function adminGetAllOrders() {
  try {
    const orders = await getAllOrders()
    return { success: true, orders }
  } catch (error) {
    console.error("Error fetching all orders:", error)
    return { success: false, error: "Failed to fetch orders" }
  }
}

export async function adminGetAllTestimonials() {
  try {
    const testimonials = await getAllTestimonials()
    return { success: true, testimonials }
  } catch (error) {
    console.error("Error fetching all testimonials:", error)
    return { success: false, error: "Failed to fetch testimonials" }
  }
}

export async function adminApproveTestimonial(id: number, approved: boolean) {
  try {
    const testimonial = await updateTestimonialApproval(id, approved)
    return { success: true, testimonial }
  } catch (error) {
    console.error("Error updating testimonial approval:", error)
    return { success: false, error: "Failed to update testimonial" }
  }
}

export async function adminGetAllDeposits(status?: string) {
  try {
    const deposits = await getAllDeposits(status)
    return { success: true, deposits }
  } catch (error) {
    console.error("Error fetching all deposits:", error)
    return { success: false, error: "Failed to fetch deposits" }
  }
}

export async function adminUpdateDepositStatus(depositId: number, status: string, adminNotes?: string) {
  try {
    const deposit = await updateDepositStatus(depositId, status, adminNotes)
    return { success: true, deposit }
  } catch (error) {
    console.error("Error updating deposit status:", error)
    return { success: false, error: "Failed to update deposit" }
  }
}

export async function adminApproveDeposit(depositId: number, adminNotes?: string) {
  try {
    const deposit = await approveDeposit(depositId, adminNotes)
    return { success: true, deposit }
  } catch (error) {
    console.error("Error approving deposit:", error)
    return { success: false, error: "Failed to approve deposit" }
  }
}

export async function adminGetAllUsers() {
  try {
    const users = await getAllUsers()
    return { success: true, users }
  } catch (error) {
    console.error("Error fetching all users:", error)
    return { success: false, error: "Failed to fetch users" }
  }
}

export async function adminGetAllSettings() {
  try {
    const settings = await getAllSettings()
    return { success: true, settings }
  } catch (error) {
    console.error("Error fetching all settings:", error)
    return { success: false, error: "Failed to fetch settings" }
  }
}

export async function adminUpdateSetting(key: string, value: string) {
  try {
    const setting = await updateSetting(key, value)
    return { success: true, setting }
  } catch (error) {
    console.error("Error updating setting:", error)
    return { success: false, error: "Failed to update setting" }
  }
}

export async function adminCreateService(serviceData: { platform: string; name: string; price: number }) {
  try {
    const service = await createService(serviceData)
    return { success: true, service }
  } catch (error) {
    console.error("Error creating service:", error)
    return { success: false, error: "Failed to create service" }
  }
}

export async function adminUpdateService(
  id: number,
  serviceData: { platform?: string; name?: string; price?: number; active?: boolean },
) {
  try {
    const service = await updateService(id, serviceData)
    return { success: true, service }
  } catch (error) {
    console.error("Error updating service:", error)
    return { success: false, error: "Failed to update service" }
  }
}

export async function adminDeleteService(id: number) {
  try {
    const service = await deleteService(id)
    return { success: true, service }
  } catch (error) {
    console.error("Error deleting service:", error)
    return { success: false, error: "Failed to delete service" }
  }
}

export async function approveTestimonial(testimonialId: string | number) {
  try {
    const id = typeof testimonialId === "string" ? Number.parseInt(testimonialId, 10) : testimonialId
    const result = await updateTestimonialApproval(id, true)
    if (!result) {
      return { success: false, error: "Testimonial not found" }
    }
    return { success: true }
  } catch (error) {
    console.error("Error approving testimonial:", error)
    return { success: false, error: "Failed to approve testimonial" }
  }
}

export async function rejectTestimonial(testimonialId: string | number) {
  try {
    const id = typeof testimonialId === "string" ? Number.parseInt(testimonialId, 10) : testimonialId
    const result = await updateTestimonialApproval(id, false)
    if (!result) {
      return { success: false, error: "Testimonial not found" }
    }
    return { success: true }
  } catch (error) {
    console.error("Error rejecting testimonial:", error)
    return { success: false, error: "Failed to reject testimonial" }
  }
}

export async function rejectDeposit(depositId: number, adminNotes?: string) {
  try {
    const result = await updateDepositStatus(depositId, "Rejected", adminNotes)
    if (!result) {
      return { success: false, error: "Deposit not found" }
    }
    return { success: true, deposit: result }
  } catch (error) {
    console.error("Error rejecting deposit:", error)
    return { success: false, error: "Failed to reject deposit" }
  }
}

// Admin session management
// export async function checkAdminSession() {
//   return { success: true }
// }

// export async function adminLogout() {
//   return { success: true }
// }

export async function addService(serviceData: { platform: string; name: string; price: number }) {
  return await createService(serviceData)
}

export async function approveTestimonialFunc(id: number) {
  try {
    const testimonial = await updateTestimonialApproval(id, true)
    return { success: true, testimonial }
  } catch (error) {
    console.error("Error approving testimonial:", error)
    return { success: false, error: "Failed to approve testimonial" }
  }
}

export async function rejectTestimonialFunc(id: number) {
  try {
    const testimonial = await updateTestimonialApproval(id, false)
    return { success: true, testimonial }
  } catch (error) {
    console.error("Error rejecting testimonial:", error)
    return { success: false, error: "Failed to reject testimonial" }
  }
}

export async function approveDepositFunc(depositId: number, adminNotes?: string) {
  try {
    const deposit = await approveDeposit(depositId, adminNotes)
    return { success: true, deposit }
  } catch (error) {
    console.error("Error approving deposit:", error)
    return { success: false, error: "Failed to approve deposit" }
  }
}

export async function rejectDepositFunc(depositId: number, adminNotes?: string) {
  try {
    const deposit = await updateDepositStatus(depositId, "Rejected", adminNotes)
    return { success: true, deposit }
  } catch (error) {
    console.error("Error rejecting deposit:", error)
    return { success: false, error: "Failed to reject deposit" }
  }
}

export async function getUSDToINRRate(): Promise<number> {
  // In a real app, you would fetch this from an API
  // For now, we'll use a fixed rate
  return 83.5 // 1 USD = 83.5 INR (example rate)
}

// Add these functions to ensure compatibility with existing code
// export async function addService(serviceData: { platform: string; name: string; price: number }) {
//   return await createService(serviceData)
// }

// export async function approveTestimonial(testimonialId: string) {
//   try {
//     const testimonial = await updateTestimonialApproval(Number(testimonialId), true)
//     return { success: true, testimonial: null }
//   } catch (error) {
//     console.error("Error approving testimonial:", error)
//     return { success: false, error: "Failed to approve testimonial" }
//   }
// }

// export async function rejectTestimonial(testimonialId: string) {
//   try {
//     const testimonial = await updateTestimonialApproval(Number(testimonialId), false)
//     return { success: true, testimonial: null }
//   } catch (error) {
//     console.error("Error rejecting testimonial:", error)
//     return { success: false, error: "Failed to reject testimonial" }
//   }
// }

// export async function rejectDeposit(depositId: number, adminNotes?: string) {
//   try {
//     const deposit = await updateDepositStatus(depositId, "Rejected", adminNotes)
//     return { success: true, deposit: null }
//   } catch (error) {
//     console.error("Error rejecting deposit:", error)
//     return { success: false, error: "Failed to reject deposit" }
//   }
// }
