import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StoreService } from './data/store.service';
import { AuthModule } from './auth/auth.module';
import { HouseholdModule } from './household/household.module';
import { RecipesModule } from './recipes/recipes.module';
import { MealPlansModule } from './meal-plans/meal-plans.module';
import { GroceryModule } from './grocery/grocery.module';
import { PantryModule } from './pantry/pantry.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { AiModule } from './ai/ai.module';
import { HealthModule } from './health/health.module';
import { AdminModule } from './admin/admin.module';

@Global()
@Module({
  providers: [StoreService],
  exports: [StoreService]
})
export class StoreModule {}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env']
    }),
    StoreModule,
    AuthModule,
    HouseholdModule,
    RecipesModule,
    MealPlansModule,
    GroceryModule,
    PantryModule,
    MarketplaceModule,
    AiModule,
    HealthModule,
    AdminModule
  ]
})
export class AppModule {}
