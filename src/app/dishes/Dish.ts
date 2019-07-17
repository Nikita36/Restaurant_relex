import {Ingredient} from '../ingredients/Ingredient';

export class Dish {
  id: number;
  name: string;
  ismenu: boolean;
  cost: number;
  type: string;
  values: number[];
  ingredients: Ingredient[];
}