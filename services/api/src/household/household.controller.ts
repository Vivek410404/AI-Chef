import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Headers,
  Req,
  Query,
  ForbiddenException,
  UnauthorizedException
} from '@nestjs/common';
import { Request } from 'express';
import { HouseholdService } from './household.service';
import { AuthService } from '../auth/auth.service';
import { Household, HouseholdMember } from '@rasoi/shared-types';

@Controller(['households', 'household'])
export class HouseholdController {
  constructor(
    private readonly householdService: HouseholdService,
    private readonly authService: AuthService
  ) {}

  private async extractUser(authHeader?: string, req?: Request): Promise<any> {
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim() || (req as any)?.cookies?.rasoi_access_token;
    if (!token) {
      if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEMO_AUTH === 'true') {
        return (await this.authService.createDemoSession()).user;
      }
      throw new UnauthorizedException('Authentication token required');
    }
    return this.authService.verifyToken(token);
  }

  private async resolveHouseholdAccess(authHeader?: string, targetId?: string, req?: Request): Promise<string> {
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim() || (req as any)?.cookies?.rasoi_access_token;
    if (token) {
      const user: any = await this.authService.verifyToken(token);
      if (user.role === 'RETAILER') {
        throw new ForbiddenException('Access denied. Retailers cannot access customer household information.');
      }
      if (user.role === 'SUPPORT' || user.role === 'OPERATIONS') {
        throw new ForbiddenException(`Access denied. Internal staff role "${user.role}" cannot access household directly through customer endpoints.`);
      }
      if (user.role === 'CUSTOMER') {
        const userId = user.id || user.sub;
        if (targetId && targetId !== 'me') {
          if (user.householdId && user.householdId === targetId) {
            return targetId;
          }
          // Verify if user is actually a member of targetId
          const hasMembership = await this.householdService.getUserHouseholdRole(userId, targetId);
          if (!hasMembership) {
            throw new ForbiddenException(`Access denied. Customer is not authorized to access household "${targetId}".`);
          }
          return targetId;
        }

        if (user.householdId) {
          return user.householdId;
        }

        const userHouseholds = await this.householdService.getUserHouseholds(userId);
        if (userHouseholds && userHouseholds.length > 0) {
          return userHouseholds[0].id;
        }

        const newHh = await this.householdService.createHousehold({
          name: `${user.fullName?.split(' ')[0] || 'My'}'s Kitchen`,
          userId,
          userFullName: user.fullName || 'Household Owner',
          dietaryPreference: 'VEGETARIAN',
          spiceTolerance: 'Medium',
          weeklyBudgetInr: 3500
        });
        return newHh.id;
      }
      if (user.role === 'ADMIN') {
        return (targetId && targetId !== 'me') ? targetId : (user.householdId || 'hh-sharma-family');
      }
    }
    return (targetId && targetId !== 'me') ? targetId : 'hh-sharma-family';
  }

  @Get('my')
  async getMyHouseholds(@Headers('authorization') authHeader: string, @Req() req: Request) {
    const user = await this.extractUser(authHeader, req);
    return this.householdService.getUserHouseholds(user.id || user.sub);
  }

  @Get('invitations/validate')
  async validateInvitation(@Query('token') token: string) {
    return this.householdService.validateInvitationToken(token);
  }

  @Post('invitations/accept')
  async acceptInvitation(
    @Body() body: { token: string },
    @Headers('authorization') authHeader: string,
    @Req() req: Request
  ) {
    const user = await this.extractUser(authHeader, req);
    return this.householdService.acceptInvitation(body.token, {
      id: user.id || user.sub,
      email: user.email,
      fullName: user.fullName
    });
  }

  @Post()
  async createHousehold(
    @Body() body: any,
    @Headers('authorization') authHeader: string,
    @Req() req: Request
  ): Promise<Household> {
    const user = await this.extractUser(authHeader, req);
    return this.householdService.createHousehold({
      ...body,
      userId: user?.id || user?.sub || 'user-demo-1',
      userFullName: user?.fullName || 'Household Owner'
    });
  }

  @Get('me')
  async getMyHousehold(@Headers('authorization') authHeader?: string, @Req() req?: Request): Promise<Household> {
    const householdId = await this.resolveHouseholdAccess(authHeader, 'me', req);
    return this.householdService.getHousehold(householdId);
  }

  @Put('me')
  async updateMyHousehold(
    @Body() updates: Partial<Household>,
    @Headers('authorization') authHeader?: string,
    @Req() req?: Request
  ): Promise<Household> {
    const user = await this.extractUser(authHeader, req);
    const householdId = await this.resolveHouseholdAccess(authHeader, 'me', req);
    return this.householdService.updateHousehold(householdId, updates, user.id || user.sub);
  }

  @Post('me/members')
  async addMember(
    @Body() member: Omit<HouseholdMember, 'id'>,
    @Headers('authorization') authHeader?: string,
    @Req() req?: Request
  ): Promise<Household> {
    const user = await this.extractUser(authHeader, req);
    const householdId = await this.resolveHouseholdAccess(authHeader, 'me', req);
    return this.householdService.addMember(householdId, member, user.id || user.sub);
  }

  @Delete('me/members/:id')
  async removeMember(
    @Param('id') memberId: string,
    @Headers('authorization') authHeader?: string,
    @Req() req?: Request
  ): Promise<Household> {
    const user = await this.extractUser(authHeader, req);
    const householdId = await this.resolveHouseholdAccess(authHeader, 'me', req);
    return this.householdService.removeMember(householdId, memberId, user.id || user.sub);
  }

  @Post(':id/invitations')
  async inviteMember(
    @Param('id') householdId: string,
    @Body() body: { invitedEmail: string; role?: 'MEMBER' | 'COOK' },
    @Headers('authorization') authHeader: string,
    @Req() req: Request
  ) {
    const user = await this.extractUser(authHeader, req);
    return this.householdService.inviteMember({
      householdId,
      invitedEmail: body.invitedEmail,
      role: body.role,
      inviterUserId: user.id || user.sub,
      inviterName: user.fullName
    });
  }

  @Get(':id/invitations')
  async getInvitations(
    @Param('id') householdId: string,
    @Headers('authorization') authHeader: string,
    @Req() req: Request
  ) {
    const user = await this.extractUser(authHeader, req);
    return this.householdService.getHouseholdInvitations(householdId, user.id || user.sub);
  }

  @Delete(':id/invitations/:invitationId')
  async revokeInvitation(
    @Param('id') householdId: string,
    @Param('invitationId') invitationId: string,
    @Headers('authorization') authHeader: string,
    @Req() req: Request
  ) {
    const user = await this.extractUser(authHeader, req);
    return this.householdService.revokeInvitation(householdId, invitationId, user.id || user.sub);
  }

  @Post(':id/transfer-ownership')
  async transferOwnership(
    @Param('id') householdId: string,
    @Body() body: { newOwnerUserId: string },
    @Headers('authorization') authHeader: string,
    @Req() req: Request
  ) {
    const user = await this.extractUser(authHeader, req);
    return this.householdService.transferOwnership(householdId, user.id || user.sub, body.newOwnerUserId);
  }

  @Get(':id')
  async getHouseholdById(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
    @Req() req?: Request
  ): Promise<Household> {
    const householdId = await this.resolveHouseholdAccess(authHeader, id, req);
    return this.householdService.getHousehold(householdId);
  }

  @Put(':id')
  async updateHouseholdById(
    @Param('id') id: string,
    @Body() updates: Partial<Household>,
    @Headers('authorization') authHeader?: string,
    @Req() req?: Request
  ): Promise<Household> {
    const user = await this.extractUser(authHeader, req);
    const householdId = await this.resolveHouseholdAccess(authHeader, id, req);
    return this.householdService.updateHousehold(householdId, updates, user.id || user.sub);
  }

  @Post(':id/members')
  async addMemberToHousehold(
    @Param('id') id: string,
    @Body() member: Omit<HouseholdMember, 'id'>,
    @Headers('authorization') authHeader?: string,
    @Req() req?: Request
  ): Promise<Household> {
    const user = await this.extractUser(authHeader, req);
    const householdId = await this.resolveHouseholdAccess(authHeader, id, req);
    return this.householdService.addMember(householdId, member, user.id || user.sub);
  }

  @Delete(':id/members/:memberId')
  async removeMemberFromHousehold(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Headers('authorization') authHeader?: string,
    @Req() req?: Request
  ): Promise<Household> {
    const user = await this.extractUser(authHeader, req);
    const householdId = await this.resolveHouseholdAccess(authHeader, id, req);
    return this.householdService.removeMember(householdId, memberId, user.id || user.sub);
  }
}
