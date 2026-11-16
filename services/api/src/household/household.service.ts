import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger
} from '@nestjs/common';
import { StoreService } from '../data/store.service';
import { TokenService } from '../auth/security/token.service';
import { AuditService } from '../auth/security/audit.service';
import { EmailService } from '../email/email.service';
import { Household, HouseholdMember } from '@rasoi/shared-types';

@Injectable()
export class HouseholdService {
  private readonly logger = new Logger(HouseholdService.name);

  constructor(
    private readonly store: StoreService,
    private readonly tokenService: TokenService,
    private readonly auditService: AuditService,
    private readonly emailService: EmailService
  ) {}

  /**
   * Get user's membership and permission in a given household
   */
  async getUserHouseholdRole(userId: string, householdId: string): Promise<'OWNER' | 'MEMBER' | 'COOK' | null> {
    if (userId === 'user-demo-1' || userId === 'usr-default') {
      return householdId === 'hh-sharma-family' ? 'OWNER' : null;
    }
    if (userId === 'user-demo-patel' || userId === 'usr-patel-1') {
      return householdId === 'hh-patel-family' ? 'OWNER' : null;
    }
    if (userId === 'user-demo-mehta' || userId === 'usr-mehta-1') {
      return householdId === 'hh-mehta-family' ? 'OWNER' : null;
    }

    if (this.store.isPrismaConnected) {
      const member = await this.store.prisma.householdMember.findFirst({
        where: { householdId, userId }
      });
      if (member) return member.role as any;

      const household = await this.store.prisma.household.findUnique({
        where: { id: householdId }
      });
      if (household && household.userId === userId) return 'OWNER';
    }
    return null;
  }

  /**
   * Assert user has required permission level in household
   */
  async assertHouseholdPermission(userId: string, householdId: string, requiredRole: 'OWNER' | 'MEMBER' | 'COOK' = 'MEMBER'): Promise<void> {
    const role = await this.getUserHouseholdRole(userId, householdId);
    if (!role) {
      throw new ForbiddenException(`You are not a member of household "${householdId}".`);
    }

    if (requiredRole === 'OWNER' && role !== 'OWNER') {
      throw new ForbiddenException('Only the household OWNER has permission to perform this action.');
    }

    if (requiredRole === 'MEMBER' && role === 'COOK') {
      throw new ForbiddenException('Domestic cooks do not have permission to manage household configuration or grocery orders.');
    }
  }

  /**
   * Retrieve single household by ID
   */
  async getHousehold(id = 'hh-sharma-family'): Promise<Household> {
    if (this.store.isPrismaConnected) {
      const dbHh = await this.store.prisma.household.findUnique({
        where: { id },
        include: { members: true }
      });
      if (dbHh) {
        const memHh = this.store.households.get(id);
        return {
          id: dbHh.id,
          userId: dbHh.userId,
          name: dbHh.name,
          dietaryPreference: (dbHh.dietaryPreference as any) || memHh?.dietaryPreference || 'VEGETARIAN',
          cuisinePreference: dbHh.cuisinePreference || memHh?.cuisinePreference || 'ALL_INDIAN',
          primaryCuisines: memHh?.primaryCuisines || ['North Indian', 'Gujarati'],
          spiceTolerance: (dbHh.spiceTolerance as any) || memHh?.spiceTolerance || 'Medium',
          weeklyBudgetInr: dbHh.weeklyBudgetInr,
          cookingFrequency: (dbHh.cookingFrequency as any) || memHh?.cookingFrequency || 'Daily Fresh',
          members: dbHh.members.map(m => ({
            id: m.id,
            name: m.name,
            ageGroup: m.ageGroup as any,
            dietaryPreference: m.dietaryPreference.toLowerCase() as any,
            allergies: m.allergies,
            dislikedIngredients: m.dislikedIngredients,
            role: m.role as any,
            userId: m.userId || undefined
          }))
        };
      }
    }

    const hh = this.store.households.get(id);
    if (!hh) {
      throw new NotFoundException(`Household with ID ${id} not found.`);
    }
    return hh;
  }

  /**
   * List all households for a user
   */
  async getUserHouseholds(userId: string): Promise<Household[]> {
    if (this.store.isPrismaConnected) {
      const memberships = await this.store.prisma.householdMember.findMany({
        where: { userId },
        include: { household: { include: { members: true } } }
      });

      const owned = await this.store.prisma.household.findMany({
        where: { userId },
        include: { members: true }
      });

      const map = new Map<string, any>();
      for (const o of owned) map.set(o.id, o);
      for (const m of memberships) map.set(m.household.id, m.household);

      return Array.from(map.values()).map(dh => ({
        id: dh.id,
        userId: dh.userId,
        name: dh.name,
        dietaryPreference: (dh.dietaryPreference as any) || 'VEGETARIAN',
        cuisinePreference: dh.cuisinePreference || 'ALL_INDIAN',
        primaryCuisines: ['North Indian', 'Gujarati'],
        spiceTolerance: (dh.spiceTolerance as any) || 'Medium',
        weeklyBudgetInr: dh.weeklyBudgetInr,
        cookingFrequency: (dh.cookingFrequency as any) || 'Daily Fresh',
        members: dh.members.map((m: any) => ({
          id: m.id,
          name: m.name,
          ageGroup: m.ageGroup as any,
          dietaryPreference: m.dietaryPreference.toLowerCase() as any,
          allergies: m.allergies,
          dislikedIngredients: m.dislikedIngredients,
          role: m.role as any,
          userId: m.userId || undefined
        }))
      }));
    }

    return Array.from(this.store.households.values());
  }

  /**
   * Create a new household in a database transaction with OWNER membership
   */
  async createHousehold(data: {
    id?: string;
    name: string;
    userId: string;
    userFullName: string;
    country?: string;
    state?: string;
    city?: string;
    locality?: string;
    size?: number;
    dietaryPreference?: any;
    cuisinePreference?: string;
    spiceTolerance?: any;
    weeklyBudgetInr?: number;
  }): Promise<Household> {
    const userId = data.userId || 'user-demo-1';
    const userFullName = data.userFullName || 'Household Owner';

    if (data.id) {
      const targetId = data.id;
      const memExisting = this.store.households.get(targetId);
      if (memExisting) {
        return this.updateHousehold(targetId, data as any);
      }
      if (this.store.isPrismaConnected) {
        const dbEx = await this.store.prisma.household.findUnique({ where: { id: targetId } });
        if (dbEx) {
          return this.updateHousehold(targetId, data as any);
        }
      }
    }

    if (!data.name || data.name.trim().length < 2) {
      throw new BadRequestException('Household name must be at least 2 characters long');
    }

    const dietaryPref = data.dietaryPreference || 'VEGETARIAN';
    const cuisinePref = data.cuisinePreference || 'ALL_INDIAN';
    const spice = data.spiceTolerance || 'MEDIUM';
    const budget = data.weeklyBudgetInr || 3500;

    if (this.store.isPrismaConnected) {
      const created = await this.store.prisma.$transaction(async tx => {
        const hhData: any = {
          userId,
          name: data.name.trim(),
          country: data.country || 'India',
          state: data.state || 'Gujarat',
          city: data.city || 'Ahmedabad',
          locality: data.locality || null,
          size: data.size || 4,
          dietaryPreference: dietaryPref.toUpperCase() as any,
          cuisinePreference: cuisinePref,
          spiceTolerance: spice.toUpperCase() as any,
          weeklyBudgetInr: budget
        };
        if (data.id) {
          hhData.id = data.id;
        }

        const hh = await tx.household.create({ data: hhData });

        const ownerMember = await tx.householdMember.create({
          data: {
            householdId: hh.id,
            userId,
            name: userFullName,
            ageGroup: 'adult',
            dietaryPreference: dietaryPref.toUpperCase() as any,
            role: 'OWNER',
            status: 'ACTIVE'
          }
        });

        return { ...hh, members: [ownerMember] };
      });

      const formatted: Household = {
        id: created.id,
        userId: created.userId,
        name: created.name,
        dietaryPreference: dietaryPref,
        cuisinePreference: cuisinePref,
        primaryCuisines: ['North Indian', 'Gujarati'],
        spiceTolerance: spice,
        weeklyBudgetInr: budget,
        cookingFrequency: 'Daily Fresh',
        members: created.members.map(m => ({
          id: m.id,
          name: m.name,
          ageGroup: m.ageGroup as any,
          dietaryPreference: m.dietaryPreference.toLowerCase() as any,
          allergies: m.allergies,
          dislikedIngredients: m.dislikedIngredients,
          role: m.role as any,
          userId: m.userId || undefined
        }))
      };

      this.store.households.set(formatted.id, formatted);
      await this.auditService.log({
        action: 'HOUSEHOLD_CREATED',
        userId,
        entityType: 'Household',
        entityId: created.id,
        metadata: { name: created.name }
      });

      return formatted;
    }

    const id = data.id || `hh-${Date.now()}`;
    const newHousehold: Household = {
      id,
      userId,
      name: data.name,
      dietaryPreference: dietaryPref,
      cuisinePreference: cuisinePref,
      primaryCuisines: ['North Indian', 'South Indian'],
      spiceTolerance: spice,
      weeklyBudgetInr: budget,
      cookingFrequency: 'Daily Fresh',
      members: [
        {
          id: `mem-${Date.now()}-1`,
          name: userFullName,
          ageGroup: 'adult',
          dietaryPreference: dietaryPref,
          allergies: [],
          dislikedIngredients: [],
          role: 'OWNER' as any,
          userId
        }
      ]
    };
    this.store.households.set(id, newHousehold);
    return newHousehold;
  }

  /**
   * Update household profile (OWNER only)
   */
  async updateHousehold(id: string, updates: Partial<Household>, requestingUserId?: string): Promise<Household> {
    if (requestingUserId) {
      await this.assertHouseholdPermission(requestingUserId, id, 'OWNER');
    }

    const current = await this.getHousehold(id);
    const updated: Household = {
      ...current,
      ...updates,
      dietaryPreference: updates.dietaryPreference || current.dietaryPreference || 'VEGETARIAN',
      cuisinePreference: updates.cuisinePreference || current.cuisinePreference || 'ALL_INDIAN'
    };
    this.store.households.set(id, updated);
    await this.store.persistHouseholdUpdate(id, updates);
    return updated;
  }

  /**
   * Add member to household (OWNER only)
   */
  async addMember(householdId: string, member: Omit<HouseholdMember, 'id'>, requestingUserId?: string): Promise<Household> {
    if (requestingUserId) {
      await this.assertHouseholdPermission(requestingUserId, householdId, 'OWNER');
    }

    const hh = await this.getHousehold(householdId);
    const newMember: HouseholdMember = {
      id: `mem-${Date.now()}`,
      ...member
    };
    hh.members.push(newMember);
    this.store.households.set(householdId, hh);
    await this.store.persistMemberAdd(householdId, newMember);
    return hh;
  }

  /**
   * Remove member from household (OWNER only)
   */
  async removeMember(householdId: string, memberId: string, requestingUserId?: string): Promise<Household> {
    if (requestingUserId) {
      await this.assertHouseholdPermission(requestingUserId, householdId, 'OWNER');
    }

    const hh = await this.getHousehold(householdId);
    hh.members = hh.members.filter(m => m.id !== memberId);
    this.store.households.set(householdId, hh);
    await this.store.persistMemberRemove(memberId);

    if (requestingUserId) {
      await this.auditService.log({
        action: 'HOUSEHOLD_MEMBER_REMOVED',
        userId: requestingUserId,
        entityType: 'HouseholdMember',
        entityId: memberId
      });
    }

    return hh;
  }

  /**
   * Invite a new member or cook to household (OWNER only)
   */
  async inviteMember(params: {
    householdId: string;
    invitedEmail: string;
    role?: 'MEMBER' | 'COOK';
    inviterUserId: string;
    inviterName: string;
  }) {
    await this.assertHouseholdPermission(params.inviterUserId, params.householdId, 'OWNER');

    const cleanEmail = params.invitedEmail.toLowerCase().trim();
    const role = params.role || 'MEMBER';

    const household = await this.getHousehold(params.householdId);

    if (this.store.isPrismaConnected) {
      // Invalidate existing pending invitations to the same email for this household
      await this.store.prisma.householdInvitation.updateMany({
        where: {
          householdId: params.householdId,
          invitedEmail: cleanEmail,
          acceptedAt: null,
          revokedAt: null
        },
        data: { revokedAt: new Date() }
      });

      const rawToken = this.tokenService.generateRandomToken(32);
      const tokenHash = this.tokenService.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const invitation = await this.store.prisma.householdInvitation.create({
        data: {
          householdId: params.householdId,
          invitedEmail: cleanEmail,
          invitedByUserId: params.inviterUserId,
          tokenHash,
          role: role as any,
          expiresAt
        }
      });

      await this.emailService.sendHouseholdInvitationEmail(cleanEmail, household.name, params.inviterName, rawToken);

      await this.auditService.log({
        action: 'HOUSEHOLD_INVITATION_SENT',
        userId: params.inviterUserId,
        entityType: 'HouseholdInvitation',
        entityId: invitation.id,
        metadata: { invitedEmail: cleanEmail, role }
      });

      return {
        success: true,
        message: `Invitation sent to ${cleanEmail}`,
        invitation: {
          id: invitation.id,
          householdId: invitation.householdId,
          invitedEmail: invitation.invitedEmail,
          role: invitation.role,
          expiresAt: invitation.expiresAt
        },
        rawToken // Returned for programmatic test validation
      };
    }

    return {
      success: true,
      message: `Invitation sent to ${cleanEmail} (dev mode)`
    };
  }

  /**
   * List pending invitations for a household (OWNER only)
   */
  async getHouseholdInvitations(householdId: string, requestingUserId: string) {
    await this.assertHouseholdPermission(requestingUserId, householdId, 'OWNER');

    if (this.store.isPrismaConnected) {
      const list = await this.store.prisma.householdInvitation.findMany({
        where: {
          householdId,
          acceptedAt: null,
          revokedAt: null,
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      });

      return list.map(inv => ({
        id: inv.id,
        invitedEmail: inv.invitedEmail,
        role: inv.role,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt
      }));
    }
    return [];
  }

  /**
   * Revoke an invitation (OWNER only)
   */
  async revokeInvitation(householdId: string, invitationId: string, requestingUserId: string) {
    await this.assertHouseholdPermission(requestingUserId, householdId, 'OWNER');

    if (this.store.isPrismaConnected) {
      const inv = await this.store.prisma.householdInvitation.findUnique({
        where: { id: invitationId }
      });

      if (!inv || inv.householdId !== householdId) {
        throw new NotFoundException('Invitation not found');
      }

      await this.store.prisma.householdInvitation.update({
        where: { id: invitationId },
        data: { revokedAt: new Date() }
      });

      await this.auditService.log({
        action: 'HOUSEHOLD_INVITATION_REVOKED',
        userId: requestingUserId,
        entityType: 'HouseholdInvitation',
        entityId: invitationId
      });

      return { success: true, message: 'Invitation revoked successfully' };
    }
    return { success: true, message: 'Invitation revoked' };
  }

  /**
   * Validate invitation by token
   */
  async validateInvitationToken(token: string) {
    if (!token) throw new BadRequestException('Token is required');
    const tokenHash = this.tokenService.hashToken(token);

    if (this.store.isPrismaConnected) {
      const inv = await this.store.prisma.householdInvitation.findUnique({
        where: { tokenHash },
        include: { household: true }
      });

      if (!inv || inv.acceptedAt || inv.revokedAt || inv.expiresAt < new Date()) {
        throw new BadRequestException('Invalid, revoked, or expired invitation token');
      }

      return {
        valid: true,
        householdName: inv.household.name,
        invitedEmail: inv.invitedEmail,
        role: inv.role,
        expiresAt: inv.expiresAt
      };
    }

    return { valid: true, householdName: 'Sample Household', role: 'MEMBER' };
  }

  /**
   * Accept an invitation
   */
  async acceptInvitation(token: string, user: { id: string; email: string; fullName: string }) {
    if (!token) throw new BadRequestException('Token is required');
    const tokenHash = this.tokenService.hashToken(token);

    if (this.store.isPrismaConnected) {
      const inv = await this.store.prisma.householdInvitation.findUnique({
        where: { tokenHash },
        include: { household: true }
      });

      if (!inv || inv.acceptedAt || inv.revokedAt) {
        throw new BadRequestException('Invalid or already accepted invitation');
      }

      if (inv.expiresAt < new Date()) {
        throw new BadRequestException('Invitation has expired');
      }

      // Validate that authenticated user's email matches invited email
      if (inv.invitedEmail.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
        throw new ForbiddenException(`Invitation email (${inv.invitedEmail}) does not match your signed-in email address (${user.email}).`);
      }

      // Check if user is already a member
      const existingMember = await this.store.prisma.householdMember.findFirst({
        where: {
          householdId: inv.householdId,
          userId: user.id
        }
      });

      if (existingMember) {
        throw new BadRequestException('You are already a member of this household');
      }

      await this.store.prisma.$transaction([
        this.store.prisma.householdInvitation.update({
          where: { id: inv.id },
          data: { acceptedAt: new Date() }
        }),
        this.store.prisma.householdMember.create({
          data: {
            householdId: inv.householdId,
            userId: user.id,
            name: user.fullName || 'Family Member',
            ageGroup: 'adult',
            dietaryPreference: inv.household.dietaryPreference,
            role: inv.role,
            status: 'ACTIVE'
          }
        })
      ]);

      await this.auditService.log({
        action: 'HOUSEHOLD_INVITATION_ACCEPTED',
        userId: user.id,
        entityType: 'Household',
        entityId: inv.householdId,
        metadata: { role: inv.role }
      });

      return {
        success: true,
        message: `Successfully joined ${inv.household.name}!`,
        householdId: inv.householdId,
        role: inv.role
      };
    }

    return { success: true, message: 'Joined household (dev mode)' };
  }

  /**
   * Transfer ownership to another existing member (OWNER only)
   */
  async transferOwnership(householdId: string, currentOwnerUserId: string, newOwnerUserId: string) {
    await this.assertHouseholdPermission(currentOwnerUserId, householdId, 'OWNER');

    if (this.store.isPrismaConnected) {
      const targetMember = await this.store.prisma.householdMember.findFirst({
        where: { householdId, userId: newOwnerUserId }
      });

      if (!targetMember) {
        throw new BadRequestException('Target user is not a member of this household');
      }

      const currentOwnerMember = await this.store.prisma.householdMember.findFirst({
        where: { householdId, userId: currentOwnerUserId }
      });

      await this.store.prisma.$transaction([
        this.store.prisma.household.update({
          where: { id: householdId },
          data: { userId: newOwnerUserId }
        }),
        this.store.prisma.householdMember.update({
          where: { id: targetMember.id },
          data: { role: 'OWNER' }
        }),
        ...(currentOwnerMember
          ? [
              this.store.prisma.householdMember.update({
                where: { id: currentOwnerMember.id },
                data: { role: 'MEMBER' }
              })
            ]
          : [])
      ]);

      return { success: true, message: 'Ownership transferred successfully' };
    }

    return { success: true, message: 'Ownership transferred (dev mode)' };
  }
}
