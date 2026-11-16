import { Controller, Get, Param, Query } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { Recipe, IndianCuisine, DietaryTag, MealCategory } from '@rasoi/shared-types';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  async getRecipes(
    @Query('search') search?: string,
    @Query('cuisine') cuisine?: IndianCuisine,
    @Query('dietaryTag') dietaryTag?: DietaryTag,
    @Query('mealCategory') mealCategory?: MealCategory,
    @Query('isJainFriendly') isJainFriendly?: string,
    @Query('maxCookTime') maxCookTime?: string
  ): Promise<Recipe[]> {
    return this.recipesService.findAll({
      search,
      cuisine,
      dietaryTag,
      mealCategory,
      isJainFriendly: isJainFriendly === 'true',
      maxCookTime: maxCookTime ? parseInt(maxCookTime, 10) : undefined
    });
  }

  @Get(':id')
  async getRecipeById(@Param('id') id: string): Promise<Recipe> {
    return this.recipesService.findById(id);
  }
}
