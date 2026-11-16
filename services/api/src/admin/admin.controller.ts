import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 1. Overview & Trends
   */
  @Get('overview')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT')
  async getOverview() {
    return this.adminService.getOverview();
  }

  @Get('trends')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT')
  async getTrends(@Query('days') days?: string) {
    return this.adminService.getTrends(days ? Number(days) : 14);
  }

  /**
   * 2. User Directory & Management
   */
  @Get('users')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'OPERATIONS')
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('role') role?: string,
    @Query('status') status?: string
  ) {
    return this.adminService.getUsers({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      q,
      role,
      status
    });
  }

  @Get('users/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'OPERATIONS')
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id/status')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: { status: 'ACTIVE' | 'SUSPENDED'; reason?: string },
    @Req() req: any
  ) {
    return this.adminService.updateUserStatus(id, dto, req.user);
  }

  @Post('users/:id/revoke-sessions')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SUPPORT')
  async revokeUserSessions(
    @Param('id') id: string,
    @Body() dto: { reason?: string },
    @Req() req: any
  ) {
    return this.adminService.revokeUserSessions(id, dto?.reason, req.user);
  }

  @Post('users/:id/resend-verification')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SUPPORT')
  async resendUserVerification(
    @Param('id') id: string,
    @Req() req: any
  ) {
    return this.adminService.resendUserVerification(id, req.user);
  }

  /**
   * 3. Household Management
   */
  @Get('households')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT')
  async getHouseholds(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('dietaryPreference') dietaryPreference?: string
  ) {
    return this.adminService.getHouseholds({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      q,
      dietaryPreference
    });
  }

  @Get('households/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT')
  async getHouseholdById(
    @Param('id') id: string,
    @Query('reason') supportReasonQuery: string,
    @Req() req: any
  ) {
    const reason = req.headers['x-support-reason'] || supportReasonQuery;
    return this.adminService.getHouseholdById(id, req.user, reason);
  }

  /**
   * 4. Retailer & Application Management
   */
  @Get('retailers/applications')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATIONS')
  async getRetailerApplications(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.adminService.getRetailerApplications({
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20
    });
  }

  @Patch('retailers/applications/:id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async reviewRetailerApplication(
    @Param('id') id: string,
    @Body() dto: { status: 'APPROVED' | 'REJECTED'; rejectionReason?: string },
    @Req() req: any
  ) {
    return this.adminService.reviewRetailerApplication(id, dto, req.user);
  }

  @Get('retailers')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT')
  async getRetailers() {
    return this.adminService.getRetailers();
  }

  @Patch('retailers/:id/status')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async updateRetailerStatus(
    @Param('id') id: string,
    @Body() dto: { status: 'ACTIVE' | 'SUSPENDED'; reason?: string },
    @Req() req: any
  ) {
    return this.adminService.updateRetailerStatus(id, dto, req.user);
  }

  /**
   * 5. Order Operations
   */
  @Get('orders')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT')
  async getOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.adminService.getOrders({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      status,
      q,
      startDate,
      endDate
    });
  }

  @Get('orders/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT')
  async getOrderById(@Param('id') id: string) {
    return this.adminService.getOrderById(id);
  }

  @Patch('orders/:id/status')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATIONS')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: {
      status: string;
      statusReason?: string;
      substitutionNotes?: string;
      fulfillmentNotes?: string;
    },
    @Req() req: any
  ) {
    return this.adminService.updateOrderStatus(id, dto, req.user);
  }

  /**
   * 6. Recipe Catalog Management
   */
  @Get('recipes')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT')
  async getRecipes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('cuisine') cuisine?: string,
    @Query('dietaryTag') dietaryTag?: string,
    @Query('isArchived') isArchived?: string
  ) {
    return this.adminService.getRecipes({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      q,
      cuisine,
      dietaryTag,
      isArchived
    });
  }

  @Get('recipes/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT')
  async getRecipeById(@Param('id') id: string) {
    return this.adminService.getRecipeById(id);
  }

  @Post('recipes')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async createRecipe(@Body() dto: any, @Req() req: any) {
    return this.adminService.createRecipe(dto, req.user);
  }

  @Patch('recipes/:id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async updateRecipe(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: any
  ) {
    return this.adminService.updateRecipe(id, dto, req.user);
  }

  @Patch('recipes/:id/archive')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async archiveRecipe(
    @Param('id') id: string,
    @Body() dto: { isArchived: boolean },
    @Req() req: any
  ) {
    return this.adminService.archiveRecipe(id, dto.isArchived, req.user);
  }

  /**
   * 7. Audit Logs Stream
   */
  @Get('audit-logs')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('q') q?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.adminService.getAuditLogs({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 25,
      action,
      userId,
      q,
      startDate,
      endDate
    });
  }

  /**
   * 8. Staff Account Management (SUPER_ADMIN only)
   */
  @Get('staff')
  @Roles('SUPER_ADMIN')
  async getStaffList() {
    return this.adminService.getStaffList();
  }

  @Post('staff')
  @Roles('SUPER_ADMIN')
  async createStaffMember(
    @Body() dto: {
      email: string;
      fullName: string;
      role: 'ADMIN' | 'OPERATIONS' | 'SUPPORT';
      password: string;
    },
    @Req() req: any
  ) {
    return this.adminService.createStaffMember(dto, req.user);
  }

  @Patch('staff/:id/role')
  @Roles('SUPER_ADMIN')
  async updateStaffRole(
    @Param('id') id: string,
    @Body() dto: { role: 'ADMIN' | 'OPERATIONS' | 'SUPPORT' },
    @Req() req: any
  ) {
    return this.adminService.updateStaffRole(id, dto, req.user);
  }

  /**
   * 9. Platform Settings & System Health
   */
  @Get('settings')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  @Roles('SUPER_ADMIN')
  async updateSetting(
    @Body() dto: { key: string; value: string; description?: string },
    @Req() req: any
  ) {
    return this.adminService.updateSetting(dto.key, dto.value, dto.description, req.user);
  }

  @Get('health')
  @Roles('SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT')
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }
}
