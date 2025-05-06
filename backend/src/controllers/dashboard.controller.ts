import { Request, Response } from "express";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get dashboard statistics for admin
 * @route GET /api/admin/dashboard/stats
 * @access Private (Admin)
 */
export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    // Get current date to find active classes (classes that haven't ended yet)
    const currentDate = new Date();

    // Get total number of users
    const totalUsers = await prisma.user.count({
      where: {
        role: {
          not: UserRole.ADMIN, // Exclude admin users from count
        },
      },
    });

    // Get count of active (future) classes
    const activeClasses = await prisma.fitnessClass.count({
      where: {
        endsAt: {
          gte: currentDate, // Class hasn't ended yet
        },
      },
    });

    // Calculate revenue (assuming $25 per booking - this would normally come from a payment system)
    // For now we'll just count total bookings and multiply by an average price
    const bookingsCount = await prisma.fitnessClassBooking.count();
    const revenue = bookingsCount * 25; // $25 per booking

    // Calculate growth rate (for demonstration - would normally compare with previous period)
    // Hardcoding for now as we don't have historical data
    const growthRate = 18;

    // Get recent users (last 10)
    const recentUsers = await prisma.user.findMany({
      where: {
        role: {
          not: UserRole.ADMIN,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Get popular classes (based on booking count)
    const popularClasses = await prisma.fitnessClass.findMany({
      take: 3,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        bookings: {
          _count: "desc",
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeClasses,
        revenue,
        growthRate,
        recentUsers,
        popularClasses,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};
