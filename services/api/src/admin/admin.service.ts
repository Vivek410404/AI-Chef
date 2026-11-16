import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger
} from '@nestjs/common';
import { StoreService } from '../data/store.service';
import { AuditService } from '../auth/security/audit.service';
import { PasswordService } from '../auth/security/password.service';
import { TokenService } from '../auth/security/token.service';
import { EmailService } from '../email/email.service';
import { Recipe, IndianCuisine, DietaryTag, MealCategory } from '@rasoi/shared-types';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly store: StoreService,
    private readonly auditService: AuditService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService
  ) {}

  /**
   * 1. Platform Overview Metrics (Real PostgreSQL queries)
   */
  async getOverview() {
    if (!this.store.isPrismaConnected) {
      return this.getInMemoryOverviewFallback();
    }

    const prisma = this.store.prisma;

    // Users stats
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { status: 'ACTIVE' } });
    const suspendedUsers = await prisma.user.count({ where: { status: 'SUSPENDED' } });
    const pendingVerification = await prisma.user.count({ where: { status: 'PENDING_VERIFICATION' } });

    const roleGroups = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    });
    const byRole: Record<string, number> = {};
    for (const rg of roleGroups) {
      byRole[rg.role] = rg._count.id;
    }

    // Households stats
    const totalHouseholds = await prisma.household.count();
    const dietaryGroups = await prisma.household.groupBy({
      by: ['dietaryPreference'],
      _count: { id: true }
    });
    const byDietaryPreference: Record<string, number> = {};
    for (const dg of dietaryGroups) {
      byDietaryPreference[dg.dietaryPreference] = dg._count.id;
    }

    // Retailers stats
    const totalRetailers = await prisma.retailer.count();
    const activeRetailers = await prisma.retailer.count({ where: { status: 'ACTIVE' } });
    const suspendedRetailers = await prisma.retailer.count({ where: { status: 'SUSPENDED' } });
    const pendingApplications = await prisma.retailerApplication.count({ where: { applicationStatus: 'PENDING' } });
    const approvedApplications = await prisma.retailerApplication.count({ where: { applicationStatus: 'APPROVED' } });

    // Orders stats
    const totalOrders = await prisma.order.count();
    const orderAgg = await prisma.order.aggregate({
      _sum: { totalAmountInr: true },
      _avg: { totalAmountInr: true }
    });
    const totalAmountInr = Math.round(orderAgg._sum.totalAmountInr || 0);
    const avgOrderValueInr = Math.round(orderAgg._avg.totalAmountInr || 0);
    const demoOrdersCount = await prisma.order.count({ where: { isDemoOrder: true } });

    const statusGroups = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    const byOrderStatus: Record<string, number> = {};
    for (const sg of statusGroups) {
      byOrderStatus[sg.status] = sg._count.id;
    }

    // Recipes stats
    const totalRecipes = await prisma.recipe.count();
    const archivedRecipes = await prisma.recipe.count({ where: { isArchived: true } });
    const activeRecipes = totalRecipes - archivedRecipes;
    const jainFriendlyCount = await prisma.recipe.count({ where: { isJainFriendly: true } });

    // Recent activity
    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        userId: true,
        entityType: true,
        entityId: true,
        createdAt: true,
        metadata: true
      }
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        retailerName: true,
        status: true,
        totalAmountInr: true,
        isDemoOrder: true,
        createdAt: true
      }
    });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    return {
      success: true,
      timestamp: new Date().toISOString(),
      userStats: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        pendingVerification,
        byRole
      },
      householdStats: {
        total: totalHouseholds,
        byDietaryPreference
      },
      retailerStats: {
        total: totalRetailers,
        active: activeRetailers,
        suspended: suspendedRetailers,
        pendingApplications,
        approvedApplications
      },
      orderStats: {
        total: totalOrders,
        totalAmountInr,
        avgOrderValueInr,
        demoOrdersCount,
        byStatus: byOrderStatus
      },
      recipeStats: {
        total: totalRecipes,
        active: activeRecipes,
        archived: archivedRecipes,
        jainFriendly: jainFriendlyCount
      },
      recentActivity: {
        auditLogs: recentAuditLogs,
        orders: recentOrders,
        users: recentUsers
      }
    };
  }

  private getInMemoryOverviewFallback() {
    const orders = this.store.orders || [];
    const recipes = this.store.recipes || [];
    const households = Array.from(this.store.households.values());
    const retailers = this.store.retailers || [];

    const totalInr = orders.reduce((acc, o) => acc + (o.totalAmountInr || 0), 0);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      userStats: {
        total: 4,
        active: 4,
        suspended: 0,
        pendingVerification: 0,
        byRole: { CUSTOMER: 3, ADMIN: 1 }
      },
      householdStats: {
        total: households.length,
        byDietaryPreference: { VEGETARIAN: households.length }
      },
      retailerStats: {
        total: retailers.length,
        active: retailers.length,
        suspended: 0,
        pendingApplications: 0,
        approvedApplications: 0
      },
      orderStats: {
        total: orders.length,
        totalAmountInr: Math.round(totalInr),
        avgOrderValueInr: orders.length > 0 ? Math.round(totalInr / orders.length) : 0,
        demoOrdersCount: orders.length,
        byStatus: { 'DEMO ORDER CONFIRMED': orders.length }
      },
      recipeStats: {
        total: recipes.length,
        active: recipes.length,
        archived: 0,
        jainFriendly: recipes.filter(r => r.isJainFriendly).length
      },
      recentActivity: {
        auditLogs: [],
        orders: orders.slice(0, 5),
        users: []
      }
    };
  }

  /**
   * 2. Platform Trends (14-day aggregated time series)
   */
  async getTrends(days = 14) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Build day buckets
    const dates: string[] = [];
    const dateCounts: Record<string, { registrations: number; households: number; orders: number; revenueInr: number }> = {};

    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      dates.push(dateStr);
      dateCounts[dateStr] = { registrations: 0, households: 0, orders: 0, revenueInr: 0 };
    }

    if (this.store.isPrismaConnected) {
      const prisma = this.store.prisma;

      const users = await prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true }
      });
      for (const u of users) {
        const d = u.createdAt.toISOString().slice(0, 10);
        if (dateCounts[d]) dateCounts[d].registrations++;
      }

      const households = await prisma.household.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true }
      });
      for (const h of households) {
        const d = h.createdAt.toISOString().slice(0, 10);
        if (dateCounts[d]) dateCounts[d].households++;
      }

      const orders = await prisma.order.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true, totalAmountInr: true }
      });
      for (const o of orders) {
        const d = o.createdAt.toISOString().slice(0, 10);
        if (dateCounts[d]) {
          dateCounts[d].orders++;
          dateCounts[d].revenueInr += o.totalAmountInr;
        }
      }
    }

    const trendData = dates.map(date => ({
      date,
      registrations: dateCounts[date]?.registrations || 0,
      households: dateCounts[date]?.households || 0,
      orders: dateCounts[date]?.orders || 0,
      revenueInr: Math.round(dateCounts[date]?.revenueInr || 0)
    }));

    return {
      success: true,
      days,
      trends: trendData
    };
  }

  /**
   * 3. User Directory & Management
   */
  async getUsers(params: {
    page?: number;
    limit?: number;
    q?: string;
    role?: string;
    status?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    if (!this.store.isPrismaConnected) {
      return {
        users: [],
        pagination: { total: 0, page, limit, totalPages: 0 }
      };
    }

    const where: any = {};

    if (params.role) {
      where.role = params.role.toUpperCase();
    }
    if (params.status) {
      where.status = params.status.toUpperCase();
    }
    if (params.q) {
      const q = params.q.trim();
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
        { phoneNumber: { contains: q } }
      ];
    }

    const [total, users] = await Promise.all([
      this.store.prisma.user.count({ where }),
      this.store.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          phoneNumber: true,
          role: true,
          status: true,
          suspensionReason: true,
          suspendedAt: true,
          suspendedBy: true,
          emailVerifiedAt: true,
          lastLoginAt: true,
          createdAt: true,
          _count: {
            select: {
              households: true,
              orders: true,
              sessions: true
            }
          }
        }
      })
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getUserById(id: string) {
    if (!this.store.isPrismaConnected) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    const user = await this.store.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        status: true,
        suspensionReason: true,
        suspendedAt: true,
        suspendedBy: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        households: {
          select: {
            id: true,
            name: true,
            city: true,
            dietaryPreference: true,
            size: true
          }
        },
        householdMembers: {
          include: {
            household: {
              select: { id: true, name: true }
            }
          }
        },
        retailerApps: {
          select: {
            id: true,
            businessName: true,
            applicationStatus: true,
            submittedAt: true
          }
        },
        _count: {
          select: {
            orders: true,
            sessions: true,
            refreshSessions: true
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    return user;
  }

  async updateUserStatus(
    id: string,
    dto: { status: 'ACTIVE' | 'SUSPENDED'; reason?: string },
    adminUser: any
  ) {
    if (!this.store.isPrismaConnected) {
      throw new BadRequestException('Database connection required for user administration');
    }

    const targetUser = await this.store.prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    // Protection: Cannot suspend oneself
    if (
      adminUser.id === id ||
      adminUser.sub === id ||
      (adminUser.email && targetUser.email && adminUser.email.toLowerCase() === targetUser.email.toLowerCase())
    ) {
      throw new BadRequestException('Administrators cannot suspend their own account.');
    }

    // Protection: Only SUPER_ADMIN can suspend another admin or SUPER_ADMIN
    if (
      ['ADMIN', 'SUPER_ADMIN'].includes(targetUser.role) &&
      adminUser.role !== 'SUPER_ADMIN'
    ) {
      throw new ForbiddenException('Only Super Administrators can modify administrator account status.');
    }

    const updated = await this.store.prisma.user.update({
      where: { id },
      data: {
        status: dto.status,
        suspensionReason: dto.status === 'SUSPENDED' ? dto.reason || 'Administrative suspension' : null,
        suspendedAt: dto.status === 'SUSPENDED' ? new Date() : null,
        suspendedBy: dto.status === 'SUSPENDED' ? (adminUser.email || adminUser.id) : null
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        suspensionReason: true,
        suspendedAt: true,
        suspendedBy: true
      }
    });

    // When suspending: immediately invalidate all sessions and refresh tokens
    if (dto.status === 'SUSPENDED') {
      await Promise.all([
        this.store.prisma.session.deleteMany({ where: { userId: id } }),
        this.store.prisma.refreshSession.deleteMany({ where: { userId: id } })
      ]);
    }

    await this.auditService.log({
      action: dto.status === 'SUSPENDED' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      userId: adminUser.id || adminUser.sub,
      entityType: 'User',
      entityId: id,
      metadata: {
        targetEmail: targetUser.email,
        previousStatus: targetUser.status,
        newStatus: dto.status,
        reason: dto.reason
      }
    });

    return updated;
  }

  async revokeUserSessions(id: string, reason?: string, adminUser?: any) {
    if (!this.store.isPrismaConnected) {
      return { success: true, count: 0 };
    }

    const [sessions, refreshSessions] = await Promise.all([
      this.store.prisma.session.deleteMany({ where: { userId: id } }),
      this.store.prisma.refreshSession.deleteMany({ where: { userId: id } })
    ]);

    await this.auditService.log({
      action: 'SESSIONS_REVOKED',
      userId: adminUser?.id || adminUser?.sub || 'system',
      entityType: 'User',
      entityId: id,
      metadata: {
        reason: reason || 'Administrative session revocation',
        sessionsRevoked: sessions.count + refreshSessions.count
      }
    });

    return {
      success: true,
      message: `Revoked ${sessions.count} session(s) and ${refreshSessions.count} refresh token(s).`
    };
  }

  async resendUserVerification(id: string, adminUser?: any) {
    if (!this.store.isPrismaConnected) {
      throw new BadRequestException('Database connection required');
    }

    const user = await this.store.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestException('User email is already verified.');
    }

    // Revoke old tokens
    await this.store.prisma.emailVerificationToken.deleteMany({ where: { userId: id } });

    // Generate new token
    const rawToken = this.tokenService.generateRandomToken(32);
    const tokenHash = this.tokenService.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    await this.store.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    await this.emailService.sendVerificationEmail(user.email, rawToken);

    return {
      success: true,
      message: `Verification email resent to ${user.email}.`
    };
  }

  /**
   * 4. Household Directory & Management
   */
  async getHouseholds(params: {
    page?: number;
    limit?: number;
    q?: string;
    dietaryPreference?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    if (!this.store.isPrismaConnected) {
      const memoryHouseholds = Array.from(this.store.households.values());
      return {
        households: memoryHouseholds,
        pagination: { total: memoryHouseholds.length, page: 1, limit: 20, totalPages: 1 }
      };
    }

    const where: any = {};
    if (params.dietaryPreference) {
      where.dietaryPreference = params.dietaryPreference;
    }
    if (params.q) {
      const q = params.q.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { user: { email: { contains: q, mode: 'insensitive' } } }
      ];
    }

    const [total, households] = await Promise.all([
      this.store.prisma.household.count({ where }),
      this.store.prisma.household.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, fullName: true }
          },
          _count: {
            select: {
              members: true,
              pantryItems: true,
              mealPlans: true
            }
          }
        }
      })
    ]);

    return {
      households,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getHouseholdById(id: string, adminUser?: any, supportReason?: string) {
    if (adminUser?.role === 'SUPPORT') {
      if (!supportReason || supportReason.trim().length < 5) {
        throw new BadRequestException(
          'Support personnel must provide a valid customer support reason (header "x-support-reason" or query "reason", min 5 characters) to inspect household data.'
        );
      }
    }

    if (!this.store.isPrismaConnected) {
      const hh = this.store.households.get(id);
      if (!hh) throw new NotFoundException(`Household "${id}" not found.`);
      return hh;
    }

    const household: any = await this.store.prisma.household.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, phoneNumber: true }
        },
        members: {
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            pantryItems: true,
            mealPlans: true,
            baskets: true,
            invitations: true
          }
        }
      }
    });

    if (!household) {
      throw new NotFoundException(`Household with ID "${id}" not found.`);
    }

    if (adminUser) {
      await this.auditService.log({
        action: adminUser.role === 'SUPPORT' ? 'SUPPORT_HOUSEHOLD_INSPECTED' : 'HOUSEHOLD_INSPECTED',
        userId: adminUser.id || adminUser.sub,
        entityType: 'Household',
        entityId: id,
        metadata: {
          householdName: household.name,
          actorRole: adminUser.role,
          supportReason: supportReason || 'Administrative inspection',
          accessedAt: new Date().toISOString()
        }
      });
    }

    // Mask sensitive contact details for support personnel to preserve household privacy
    if (adminUser?.role === 'SUPPORT' && household.user) {
      household.user = {
        ...household.user,
        phoneNumber: household.user.phoneNumber
          ? '***-***-' + household.user.phoneNumber.slice(-4)
          : null
      };
    }

    return household;
  }

  /**
   * 5. Retailer & Application Management
   */
  async getRetailerApplications(params: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    if (!this.store.isPrismaConnected) {
      return { applications: [], pagination: { total: 0, page, limit, totalPages: 0 } };
    }

    const where: any = {};
    if (params.status) {
      where.applicationStatus = params.status.toUpperCase();
    }

    const [total, applications] = await Promise.all([
      this.store.prisma.retailerApplication.count({ where }),
      this.store.prisma.retailerApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, fullName: true, phoneNumber: true, role: true }
          }
        }
      })
    ]);

    return {
      applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async reviewRetailerApplication(
    id: string,
    dto: { status: 'APPROVED' | 'REJECTED'; rejectionReason?: string },
    adminUser: any
  ) {
    if (!this.store.isPrismaConnected) {
      throw new BadRequestException('Database connection required to review applications');
    }

    const app = await this.store.prisma.retailerApplication.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!app) {
      throw new NotFoundException(`Application with ID "${id}" not found.`);
    }

    // Protection: Staff cannot approve their own retailer application
    const isSelfReview =
      (adminUser.id && app.userId === adminUser.id) ||
      (adminUser.sub && app.userId === adminUser.sub) ||
      (adminUser.email && app.user?.email && adminUser.email.toLowerCase() === app.user.email.toLowerCase());

    if (isSelfReview) {
      throw new ForbiddenException('Staff members are strictly prohibited from reviewing or approving their own retailer application.');
    }

    if (dto.status === 'REJECTED' && !dto.rejectionReason) {
      throw new BadRequestException('Rejection reason is required when rejecting a retailer application.');
    }

    const updated = await this.store.prisma.retailerApplication.update({
      where: { id },
      data: {
        applicationStatus: dto.status,
        rejectionReason: dto.status === 'REJECTED' ? dto.rejectionReason : null,
        reviewedAt: new Date(),
        reviewedBy: adminUser.email || adminUser.id
      }
    });

    if (dto.status === 'APPROVED') {
      // Elevate applicant user role to RETAILER
      await this.store.prisma.user.update({
        where: { id: app.userId },
        data: { role: 'RETAILER' }
      });

      // Ensure a Retailer entity exists for this merchant
      const slug = app.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existingRetailer = await this.store.prisma.retailer.findFirst({
        where: { OR: [{ slug }, { name: app.businessName }] }
      });

      if (!existingRetailer) {
        await this.store.prisma.retailer.create({
          data: {
            id: `ret-${slug}`,
            name: app.businessName,
            slug,
            logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80',
            deliveryTimeEstimate: '30-45 mins',
            deliveryFeeInr: 29,
            freeDeliveryThresholdInr: 500,
            minOrderValueInr: 99,
            status: 'ACTIVE'
          }
        });
      }

      await this.auditService.log({
        action: 'RETAILER_APPROVED',
        userId: adminUser.id || adminUser.sub,
        entityType: 'RetailerApplication',
        entityId: id,
        metadata: {
          applicantId: app.userId,
          businessName: app.businessName,
          applicantEmail: app.user.email
        }
      });
    } else {
      await this.auditService.log({
        action: 'RETAILER_REJECTED',
        userId: adminUser.id || adminUser.sub,
        entityType: 'RetailerApplication',
        entityId: id,
        metadata: {
          applicantId: app.userId,
          businessName: app.businessName,
          reason: dto.rejectionReason
        }
      });
    }

    return updated;
  }

  async getRetailers() {
    if (!this.store.isPrismaConnected) {
      return this.store.retailers;
    }

    const retailers = await this.store.prisma.retailer.findMany({
      orderBy: { name: 'asc' },
      include: {
        stores: true,
        _count: {
          select: {
            stores: true,
            baskets: true
          }
        }
      }
    });

    return retailers;
  }

  async updateRetailerStatus(
    id: string,
    dto: { status: 'ACTIVE' | 'SUSPENDED'; reason?: string },
    adminUser: any
  ) {
    if (!this.store.isPrismaConnected) {
      throw new BadRequestException('Database required');
    }

    const updated = await this.store.prisma.retailer.update({
      where: { id },
      data: {
        status: dto.status,
        suspendedReason: dto.status === 'SUSPENDED' ? dto.reason : null,
        suspendedAt: dto.status === 'SUSPENDED' ? new Date() : null
      }
    });

    // Also update in-memory store
    const memRetailer = this.store.retailers.find(r => r.id === id || r.slug === id);
    if (memRetailer) {
      (memRetailer as any).status = dto.status;
    }

    await this.auditService.log({
      action: dto.status === 'SUSPENDED' ? 'RETAILER_SUSPENDED' : 'RETAILER_APPROVED',
      userId: adminUser.id || adminUser.sub,
      entityType: 'Retailer',
      entityId: id,
      metadata: { reason: dto.reason, status: dto.status }
    });

    return updated;
  }

  /**
   * 6. Order Operations (Strictly labeling DEMO orders)
   */
  async getOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    q?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    if (!this.store.isPrismaConnected) {
      const orders = this.store.orders || [];
      return {
        orders: orders.map(o => ({ ...o, isDemoOrder: true })),
        pagination: { total: orders.length, page: 1, limit: 20, totalPages: 1 }
      };
    }

    const where: any = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }
    if (params.q) {
      const q = params.q.trim();
      where.OR = [
        { id: { contains: q } },
        { retailerName: { contains: q, mode: 'insensitive' } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { user: { fullName: { contains: q, mode: 'insensitive' } } }
      ];
    }

    const [total, orders] = await Promise.all([
      this.store.prisma.order.count({ where }),
      this.store.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, fullName: true, phoneNumber: true }
          },
          items: {
            include: {
              productVariant: true
            }
          },
          payment: true
        }
      })
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getOrderById(id: string) {
    if (!this.store.isPrismaConnected) {
      const order = this.store.orders.find(o => o.id === id || o.orderNumber === id);
      if (!order) throw new NotFoundException(`Order ${id} not found.`);
      return { ...order, isDemoOrder: true };
    }

    const order = await this.store.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, phoneNumber: true }
        },
        items: {
          include: {
            productVariant: true
          }
        },
        payment: true
      }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found.`);
    }

    return order;
  }

  async updateOrderStatus(
    id: string,
    dto: {
      status: string;
      statusReason?: string;
      substitutionNotes?: string;
      fulfillmentNotes?: string;
    },
    adminUser: any
  ) {
    const validStatuses = [
      'PLACED',
      'CONFIRMED',
      'PREPARING',
      'OUT_FOR_DELIVERY',
      'DISPATCHED',
      'DELIVERED',
      'CANCELLED',
      'DEMO ORDER CONFIRMED'
    ];

    if (!validStatuses.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid order status "${dto.status}". Allowed statuses: ${validStatuses.join(', ')}`
      );
    }

    let updatedOrder: any = null;

    if (this.store.isPrismaConnected) {
      updatedOrder = await this.store.prisma.order.update({
        where: { id },
        data: {
          status: dto.status,
          statusReason: dto.statusReason,
          substitutionNotes: dto.substitutionNotes,
          fulfillmentNotes: dto.fulfillmentNotes,
          updatedBy: adminUser.email || adminUser.id
        },
        include: {
          user: {
            select: { id: true, email: true, fullName: true }
          },
          items: true
        }
      });
    }

    // Also update in-memory order if present
    const memOrder = this.store.orders.find(o => o.id === id || o.orderNumber === id);
    if (memOrder) {
      memOrder.status = dto.status;
      if (dto.substitutionNotes) memOrder.substitutionNotes = dto.substitutionNotes;
      if (dto.fulfillmentNotes) memOrder.fulfillmentNotes = dto.fulfillmentNotes;
      if (!updatedOrder) updatedOrder = memOrder;
    }

    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID "${id}" not found.`);
    }

    await this.auditService.log({
      action: 'ORDER_STATUS_CHANGED',
      userId: adminUser.id || adminUser.sub,
      entityType: 'Order',
      entityId: id,
      metadata: {
        newStatus: dto.status,
        reason: dto.statusReason,
        fulfillmentNotes: dto.fulfillmentNotes
      }
    });

    return updatedOrder;
  }

  /**
   * 7. Recipe Catalog Management (Dietary consistency validation)
   */
  async getRecipes(params: {
    page?: number;
    limit?: number;
    q?: string;
    cuisine?: string;
    dietaryTag?: string;
    isArchived?: string | boolean;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    if (!this.store.isPrismaConnected) {
      let recipes = [...this.store.recipes];
      if (params.q) {
        const q = params.q.toLowerCase();
        recipes = recipes.filter(r => r.title.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q));
      }
      return {
        recipes,
        pagination: { total: recipes.length, page: 1, limit: 20, totalPages: 1 }
      };
    }

    const where: any = {};
    if (params.isArchived !== undefined) {
      where.isArchived = params.isArchived === 'true' || params.isArchived === true;
    }
    if (params.cuisine) {
      where.cuisine = params.cuisine;
    }
    if (params.dietaryTag) {
      where.dietaryTags = { has: params.dietaryTag };
    }
    if (params.q) {
      const q = params.q.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { cuisine: { contains: q, mode: 'insensitive' } }
      ];
    }

    const [total, recipes] = await Promise.all([
      this.store.prisma.recipe.count({ where }),
      this.store.prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        orderBy: { title: 'asc' },
        include: {
          ingredients: {
            include: { ingredient: true }
          },
          steps: {
            orderBy: { stepNumber: 'asc' }
          }
        }
      })
    ]);

    return {
      recipes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getRecipeById(id: string) {
    if (!this.store.isPrismaConnected) {
      const r = this.store.recipes.find(x => x.id === id || x.slug === id);
      if (!r) throw new NotFoundException(`Recipe ${id} not found.`);
      return r;
    }

    const recipe = await this.store.prisma.recipe.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        ingredients: {
          include: { ingredient: true }
        },
        steps: {
          orderBy: { stepNumber: 'asc' }
        }
      }
    });

    if (!recipe) {
      throw new NotFoundException(`Recipe with ID "${id}" not found.`);
    }

    return recipe;
  }

  async createRecipe(dto: any, adminUser: any) {
    if (!dto.title || dto.title.trim().length < 3) {
      throw new BadRequestException('Recipe title must be at least 3 characters long.');
    }
    if (!dto.cuisine) {
      throw new BadRequestException('Recipe cuisine is required.');
    }

    // 1. Validate Dietary Consistency:
    // A. Jain friendly recipes must NEVER contain root vegetables, onion, or garlic
    if (dto.isJainFriendly) {
      const prohibitedKeywords = ['onion', 'garlic', 'potato', 'carrot', 'radish', 'ginger', 'root'];
      if (Array.isArray(dto.ingredients)) {
        for (const item of dto.ingredients) {
          const ingName = (item.name || item.ingredientName || '').toLowerCase();
          for (const bad of prohibitedKeywords) {
            if (ingName.includes(bad)) {
              throw new BadRequestException(
                `Dietary conflict: Recipe marked as Jain-Friendly cannot contain "${item.name}" (${bad}).`
              );
            }
          }
        }
      }
    }

    // B. Vegetarian vs Non-Vegetarian tags
    const tags = Array.isArray(dto.dietaryTags) ? dto.dietaryTags : [];
    if (tags.includes('NON_VEGETARIAN') && (tags.includes('PURE_VEGETARIAN') || tags.includes('JAIN') || dto.isJainFriendly)) {
      throw new BadRequestException(
        'Dietary conflict: Recipe cannot be tagged as NON_VEGETARIAN and PURE_VEGETARIAN/JAIN simultaneously.'
      );
    }

    const slug = dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const recipeId = dto.id || `rec-${Date.now()}`;

    if (this.store.isPrismaConnected) {
      // Create recipe in PostgreSQL
      const created = await this.store.prisma.recipe.create({
        data: {
          id: recipeId,
          title: dto.title.trim(),
          slug,
          description: dto.description || 'Nutritious traditional preparation.',
          cuisine: dto.cuisine,
          dietaryTags: tags.length > 0 ? tags : ['PURE_VEGETARIAN'],
          mealTypes: Array.isArray(dto.mealTypes) ? dto.mealTypes : ['LUNCH', 'DINNER'],
          prepTimeMinutes: Number(dto.prepTimeMinutes) || 15,
          cookTimeMinutes: Number(dto.cookTimeMinutes) || 25,
          defaultServings: Number(dto.defaultServings) || 4,
          difficulty: dto.difficulty || 'Medium',
          caloriesPerServing: Number(dto.caloriesPerServing) || 350,
          proteinGrams: Number(dto.proteinGrams) || 12,
          carbsGrams: Number(dto.carbsGrams) || 45,
          fatGrams: Number(dto.fatGrams) || 10,
          fiberGrams: Number(dto.fiberGrams) || 6,
          imageUrl: dto.imageUrl || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          estimatedCostInr: Number(dto.estimatedCostInr) || 120,
          isJainFriendly: Boolean(dto.isJainFriendly),
          jainAlternativeNotes: dto.jainAlternativeNotes || null,
          rating: 5.0,
          ratingCount: 1,
          isArchived: false
        }
      });

      await this.auditService.log({
        action: 'RECIPE_CREATED',
        userId: adminUser.id || adminUser.sub,
        entityType: 'Recipe',
        entityId: created.id,
        metadata: { title: created.title, cuisine: created.cuisine }
      });

      return created;
    } else {
      // In-memory fallback
      const memRecipe: any = {
        id: recipeId,
        title: dto.title,
        slug,
        description: dto.description,
        cuisine: dto.cuisine,
        dietaryTags: tags,
        mealTypes: dto.mealTypes || ['LUNCH', 'DINNER'],
        prepTimeMinutes: dto.prepTimeMinutes || 15,
        cookTimeMinutes: dto.cookTimeMinutes || 25,
        defaultServings: dto.defaultServings || 4,
        difficulty: dto.difficulty || 'Medium',
        caloriesPerServing: dto.caloriesPerServing || 350,
        proteinGrams: dto.proteinGrams || 12,
        carbsGrams: dto.carbsGrams || 45,
        fatGrams: dto.fatGrams || 10,
        fiberGrams: dto.fiberGrams || 6,
        imageUrl: dto.imageUrl || '',
        estimatedCostInr: dto.estimatedCostInr || 120,
        isJainFriendly: Boolean(dto.isJainFriendly),
        rating: 5.0,
        ratingCount: 1,
        isArchived: false,
        ingredients: [],
        steps: []
      };
      this.store.recipes.push(memRecipe);
      return memRecipe;
    }
  }

  async updateRecipe(id: string, dto: any, adminUser: any) {
    if (this.store.isPrismaConnected) {
      const existing = await this.store.prisma.recipe.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException(`Recipe "${id}" not found.`);

      // Validate dietary tags if updating
      if (dto.dietaryTags) {
        if (dto.dietaryTags.includes('NON_VEGETARIAN') && (dto.dietaryTags.includes('PURE_VEGETARIAN') || dto.isJainFriendly)) {
          throw new BadRequestException('Dietary conflict: Recipe cannot be NON_VEGETARIAN and PURE_VEGETARIAN simultaneously.');
        }
      }

      const updated = await this.store.prisma.recipe.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
          cuisine: dto.cuisine,
          dietaryTags: dto.dietaryTags,
          prepTimeMinutes: dto.prepTimeMinutes ? Number(dto.prepTimeMinutes) : undefined,
          cookTimeMinutes: dto.cookTimeMinutes ? Number(dto.cookTimeMinutes) : undefined,
          defaultServings: dto.defaultServings ? Number(dto.defaultServings) : undefined,
          caloriesPerServing: dto.caloriesPerServing ? Number(dto.caloriesPerServing) : undefined,
          proteinGrams: dto.proteinGrams ? Number(dto.proteinGrams) : undefined,
          carbsGrams: dto.carbsGrams ? Number(dto.carbsGrams) : undefined,
          fatGrams: dto.fatGrams ? Number(dto.fatGrams) : undefined,
          fiberGrams: dto.fiberGrams ? Number(dto.fiberGrams) : undefined,
          isJainFriendly: dto.isJainFriendly !== undefined ? Boolean(dto.isJainFriendly) : undefined,
          jainAlternativeNotes: dto.jainAlternativeNotes
        }
      });

      await this.auditService.log({
        action: 'RECIPE_MODIFIED',
        userId: adminUser.id || adminUser.sub,
        entityType: 'Recipe',
        entityId: id,
        metadata: { title: updated.title }
      });

      return updated;
    } else {
      const idx = this.store.recipes.findIndex(r => r.id === id || r.slug === id);
      if (idx === -1) throw new NotFoundException(`Recipe ${id} not found.`);
      this.store.recipes[idx] = { ...this.store.recipes[idx], ...dto };
      return this.store.recipes[idx];
    }
  }

  async archiveRecipe(id: string, isArchived: boolean, adminUser: any) {
    if (this.store.isPrismaConnected) {
      const updated = await this.store.prisma.recipe.update({
        where: { id },
        data: {
          isArchived,
          archivedAt: isArchived ? new Date() : null,
          archivedBy: isArchived ? (adminUser.email || adminUser.id) : null
        }
      });

      // Also update in-memory
      const mem = this.store.recipes.find(r => r.id === id || r.slug === id);
      if (mem) {
        (mem as any).isArchived = isArchived;
      }

      await this.auditService.log({
        action: 'RECIPE_ARCHIVED',
        userId: adminUser.id || adminUser.sub,
        entityType: 'Recipe',
        entityId: id,
        metadata: { isArchived }
      });

      return updated;
    } else {
      const mem = this.store.recipes.find(r => r.id === id || r.slug === id);
      if (!mem) throw new NotFoundException(`Recipe ${id} not found.`);
      (mem as any).isArchived = isArchived;
      return mem;
    }
  }

  /**
   * 8. Audit Logs Stream (Immutable security record)
   */
  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
    q?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 25));
    const skip = (page - 1) * limit;

    if (!this.store.isPrismaConnected) {
      return { auditLogs: [], pagination: { total: 0, page, limit, totalPages: 0 } };
    }

    const where: any = {};
    if (params.action) {
      where.action = params.action;
    }
    if (params.userId) {
      where.userId = params.userId;
    }
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }
    if (params.q) {
      const q = params.q.trim();
      where.OR = [
        { action: { contains: q, mode: 'insensitive' } },
        { entityType: { contains: q, mode: 'insensitive' } },
        { entityId: { contains: q } },
        { user: { email: { contains: q, mode: 'insensitive' } } }
      ];
    }

    const [total, auditLogs] = await Promise.all([
      this.store.prisma.auditLog.count({ where }),
      this.store.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, fullName: true, role: true }
          }
        }
      })
    ]);

    return {
      auditLogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 9. Staff Account Management (Restricted to SUPER_ADMIN)
   */
  async getStaffList() {
    if (!this.store.isPrismaConnected) {
      return [];
    }

    const staffRoles = ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT'];
    const staff = await this.store.prisma.user.findMany({
      where: {
        role: { in: staffRoles as any }
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true
      }
    });

    return staff;
  }

  async createStaffMember(
    dto: {
      email: string;
      fullName: string;
      role: 'ADMIN' | 'OPERATIONS' | 'SUPPORT';
      password: string;
    },
    adminUser: any
  ) {
    if (!this.store.isPrismaConnected) {
      throw new BadRequestException('Database connection required');
    }

    const allowedRoles = ['ADMIN', 'OPERATIONS', 'SUPPORT'];
    if (!allowedRoles.includes(dto.role)) {
      throw new BadRequestException(`Invalid staff role "${dto.role}". Allowed roles: ${allowedRoles.join(', ')}`);
    }

    const email = dto.email.toLowerCase().trim();
    const existing = await this.store.prisma.user.findFirst({
      where: { OR: [{ email }, { normalizedEmail: email }] }
    });

    if (existing) {
      throw new BadRequestException(`A user with email "${email}" already exists.`);
    }

    this.passwordService.validatePasswordPolicy(dto.password);
    const passwordHash = await this.passwordService.hash(dto.password);

    const user = await this.store.prisma.user.create({
      data: {
        email,
        normalizedEmail: email,
        fullName: dto.fullName.trim(),
        role: dto.role as any,
        status: 'ACTIVE',
        passwordHash,
        emailVerifiedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    await this.auditService.log({
      action: 'STAFF_CREATED',
      userId: adminUser.id || adminUser.sub,
      entityType: 'User',
      entityId: user.id,
      metadata: { staffEmail: user.email, assignedRole: user.role }
    });

    return user;
  }

  async updateStaffRole(
    id: string,
    dto: { role: 'ADMIN' | 'OPERATIONS' | 'SUPPORT' },
    adminUser: any
  ) {
    if (!this.store.isPrismaConnected) {
      throw new BadRequestException('Database required');
    }

    const targetUser = await this.store.prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    // Protection: Cannot demote or change own role
    const isSelfEdit =
      adminUser.id === id ||
      adminUser.sub === id ||
      (adminUser.email && targetUser.email && adminUser.email.toLowerCase() === targetUser.email.toLowerCase());

    if (isSelfEdit) {
      throw new BadRequestException('Administrators cannot change their own administrative role.');
    }

    const updated = await this.store.prisma.user.update({
      where: { id },
      data: { role: dto.role as any },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true
      }
    });

    await this.auditService.log({
      action: 'STAFF_ROLE_CHANGED',
      userId: adminUser.id || adminUser.sub,
      entityType: 'User',
      entityId: id,
      metadata: { previousRole: targetUser.role, newRole: dto.role }
    });

    return updated;
  }

  /**
   * 10. Platform Settings & System Health
   */
  async getSettings() {
    if (!this.store.isPrismaConnected) {
      return [];
    }

    let settings = await this.store.prisma.systemSetting.findMany({
      orderBy: { key: 'asc' }
    });

    // Seed default settings if empty
    if (settings.length === 0) {
      const defaults = [
        { key: 'platform.registration_enabled', value: 'true', description: 'Enable/disable public customer registration' },
        { key: 'platform.maintenance_mode', value: 'false', description: 'Enable/disable platform maintenance downtime mode' },
        { key: 'platform.max_members_per_household', value: '10', description: 'Maximum family members allowed per household' },
        { key: 'platform.demo_orders_enabled', value: 'true', description: 'Permit simulated checkout and demo order generation' },
        { key: 'ai.gemini_model', value: 'gemini-2.5-flash-lite', description: 'Active Google Gemini LLM model identifier' },
        { key: 'ai.secondary_provider', value: 'deterministic-offline', description: 'Fallback AI planning engine when primary quota is exhausted' },
        { key: 'pricing.default_delivery_fee_inr', value: '29', description: 'Standard quick-commerce delivery fee in INR' }
      ];

      for (const def of defaults) {
        await this.store.prisma.systemSetting.create({ data: def });
      }

      settings = await this.store.prisma.systemSetting.findMany({
        orderBy: { key: 'asc' }
      });
    }

    return settings;
  }

  async updateSetting(
    key: string,
    value: string,
    description?: string,
    adminUser?: any
  ) {
    if (!this.store.isPrismaConnected) {
      throw new BadRequestException('Database required');
    }

    const updated = await this.store.prisma.systemSetting.upsert({
      where: { key },
      create: {
        key,
        value,
        description: description || null,
        updatedBy: adminUser?.email || adminUser?.id || 'system'
      },
      update: {
        value,
        description: description !== undefined ? description : undefined,
        updatedBy: adminUser?.email || adminUser?.id || 'system'
      }
    });

    await this.auditService.log({
      action: 'SETTINGS_UPDATED',
      userId: adminUser?.id || adminUser?.sub || 'system',
      entityType: 'SystemSetting',
      entityId: updated.id,
      metadata: { key, value }
    });

    return updated;
  }

  async getSystemHealth() {
    const memUsage = process.memoryUsage();
    return {
      status: 'UP',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rssMb: Math.round(memUsage.rss / (1024 * 1024)),
        heapTotalMb: Math.round(memUsage.heapTotal / (1024 * 1024)),
        heapUsedMb: Math.round(memUsage.heapUsed / (1024 * 1024))
      },
      database: {
        mode: process.env.STORAGE_MODE || 'postgres',
        connected: this.store.isPrismaConnected,
        provider: 'postgresql'
      },
      aiEngine: {
        primaryModel: 'gemini-2.5-flash-lite',
        fallbackProvider: 'deterministic-offline',
        status: 'READY'
      },
      emailTransport: {
        mode: process.env.EMAIL_TRANSPORT || 'console-preview',
        status: 'OPERATIONAL'
      }
    };
  }
}
