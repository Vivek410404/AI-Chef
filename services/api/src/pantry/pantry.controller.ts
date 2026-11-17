import { Controller, Get, Post, Delete, Body, Param, Headers, Query, ForbiddenException } from '@nestjs/common';
import { PantryService } from './pantry.service';
import { AuthService } from '../auth/auth.service';
import { PantryItem, StandardUnit } from '@rasoi/shared-types';

@Controller('pantry')
export class PantryController {
  constructor(
    private readonly pantryService: PantryService,
    private readonly authService: AuthService
  ) {}

  private async resolveHouseholdId(authHeader?: string, requestedHouseholdId?: string): Promise<string> {
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '');
      const user: any = await this.authService.verifyToken(token);
      if (user.role === 'RETAILER') {
        throw new ForbiddenException('Access denied. Retailers cannot access household pantry.');
      }
      if (user.role === 'CUSTOMER') {
        if (requestedHouseholdId) {
          if (requestedHouseholdId === user.householdId) {
            return requestedHouseholdId;
          }
          if (this.authService.store.isPrismaConnected) {
            const member = await this.authService.store.prisma.householdMember.findFirst({
              where: { householdId: requestedHouseholdId, userId: user.id || user.sub }
            });
            if (member) return requestedHouseholdId;
          }
          throw new ForbiddenException(`Access denied. Customer is not authorized to access household "${requestedHouseholdId}".`);
        }
        if (user.householdId) {
          return user.householdId;
        }
        if (this.authService.store.isPrismaConnected) {
          const userMem = await this.authService.store.prisma.householdMember.findFirst({
            where: { userId: user.id || user.sub }
          }) || await this.authService.store.prisma.household.findFirst({
            where: { userId: user.id || user.sub }
          });
          if (userMem) {
            return (userMem as any).householdId || userMem.id;
          }
        }
        return `hh-${user.id || user.sub}`;
      }
      if (user.role === 'ADMIN') {
        return requestedHouseholdId || user.householdId || 'hh-sharma-family';
      }
    }
    return requestedHouseholdId || 'hh-sharma-family';
  }

  @Get()
  async getPantry(
    @Query('householdId') queryHouseholdId?: string,
    @Headers('authorization') authHeader?: string
  ): Promise<PantryItem[]> {
    const householdId = await this.resolveHouseholdId(authHeader, queryHouseholdId);
    return this.pantryService.getPantryItems(householdId);
  }

  @Post()
  async addOrUpdate(
    @Body() body: { ingredientId: string; quantity: number; unit: StandardUnit; isLowStock?: boolean; lowStockThreshold?: number; householdId?: string },
    @Headers('authorization') authHeader?: string
  ): Promise<PantryItem> {
    const householdId = await this.resolveHouseholdId(authHeader, body.householdId);
    return this.pantryService.addOrUpdatePantryItem(householdId, body);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('householdId') queryHouseholdId?: string,
    @Headers('authorization') authHeader?: string
  ): Promise<{ success: boolean }> {
    const householdId = await this.resolveHouseholdId(authHeader, queryHouseholdId);
    return this.pantryService.removePantryItem(householdId, id);
  }
}
