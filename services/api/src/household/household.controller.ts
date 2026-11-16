import { Controller, Get, Put, Post, Delete, Body, Param, Headers, ForbiddenException } from '@nestjs/common';
import { HouseholdService } from './household.service';
import { AuthService } from '../auth/auth.service';
import { Household, HouseholdMember } from '@rasoi/shared-types';

@Controller(['households', 'household'])
export class HouseholdController {
  constructor(
    private readonly householdService: HouseholdService,
    private readonly authService: AuthService
  ) {}

  private async resolveHouseholdAccess(authHeader?: string, targetId?: string): Promise<string> {
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '');
      const user: any = await this.authService.verifyToken(token);
      if (user.role === 'RETAILER') {
        throw new ForbiddenException('Access denied. Retailers cannot access customer household information.');
      }
      if (user.role === 'CUSTOMER') {
        if (targetId && targetId !== 'me' && user.householdId && user.householdId !== targetId) {
          throw new ForbiddenException(`Access denied. Customer is not authorized to access household "${targetId}".`);
        }
        return user.householdId || 'hh-sharma-family';
      }
      if (user.role === 'ADMIN') {
        return (targetId && targetId !== 'me') ? targetId : (user.householdId || 'hh-sharma-family');
      }
    }
    return (targetId && targetId !== 'me') ? targetId : 'hh-sharma-family';
  }

  @Get('me')
  async getMyHousehold(@Headers('authorization') authHeader?: string): Promise<Household> {
    const householdId = await this.resolveHouseholdAccess(authHeader, 'me');
    return this.householdService.getHousehold(householdId);
  }

  @Put('me')
  async updateMyHousehold(
    @Body() updates: Partial<Household>,
    @Headers('authorization') authHeader?: string
  ): Promise<Household> {
    const householdId = await this.resolveHouseholdAccess(authHeader, 'me');
    return this.householdService.updateHousehold(householdId, updates);
  }

  @Post('me/members')
  async addMember(
    @Body() member: Omit<HouseholdMember, 'id'>,
    @Headers('authorization') authHeader?: string
  ): Promise<Household> {
    const householdId = await this.resolveHouseholdAccess(authHeader, 'me');
    return this.householdService.addMember(householdId, member);
  }

  @Delete('me/members/:id')
  async removeMember(
    @Param('id') memberId: string,
    @Headers('authorization') authHeader?: string
  ): Promise<Household> {
    const householdId = await this.resolveHouseholdAccess(authHeader, 'me');
    return this.householdService.removeMember(householdId, memberId);
  }

  @Get(':id')
  async getHouseholdById(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string
  ): Promise<Household> {
    const householdId = await this.resolveHouseholdAccess(authHeader, id);
    return this.householdService.getHousehold(householdId);
  }

  @Put(':id')
  async updateHouseholdById(
    @Param('id') id: string,
    @Body() updates: Partial<Household>,
    @Headers('authorization') authHeader?: string
  ): Promise<Household> {
    const householdId = await this.resolveHouseholdAccess(authHeader, id);
    return this.householdService.updateHousehold(householdId, updates);
  }

  @Post(':id/members')
  async addMemberToHousehold(
    @Param('id') id: string,
    @Body() member: Omit<HouseholdMember, 'id'>,
    @Headers('authorization') authHeader?: string
  ): Promise<Household> {
    const householdId = await this.resolveHouseholdAccess(authHeader, id);
    return this.householdService.addMember(householdId, member);
  }

  @Delete(':id/members/:memberId')
  async removeMemberFromHousehold(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Headers('authorization') authHeader?: string
  ): Promise<Household> {
    const householdId = await this.resolveHouseholdAccess(authHeader, id);
    return this.householdService.removeMember(householdId, memberId);
  }

  @Post()
  async createHousehold(@Body() body: Partial<Household>): Promise<Household> {
    return this.householdService.createHousehold(body);
  }
}
