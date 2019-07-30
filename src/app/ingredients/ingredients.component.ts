import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {Ingredient} from '../utils/Ingredient';
import {IngredientService} from './ingredient.service';
import {IngredientPart} from '../utils/IngredientPart';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {merge, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {StorageService} from '../storage/storage.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {validatorIngredientUniqueName} from './validatorIngredientUniqueName';


@Component({
  selector: 'app-ingredients',
  templateUrl: './ingredients.component.html',
  styleUrls: ['./ingredients.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class IngredientsComponent implements AfterViewInit {
  VALUE = 'value';
  ingredients: Ingredient[];
  columnsToDisplay = ['id', 'name', 'measure', 'summaryAmount', 'volumePerUnit', 'summaryVolume', 'delete'];
  newIngredient: Ingredient = new Ingredient();
  resultsLength = 0;
  expandedElement: Ingredient | null;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  _newIngredientForm: FormGroup;
  _newIngredientPartForm: FormGroup;
  freeStorageVolume: number;
  maxStorageVolume: number;

  constructor(private ingredientService: IngredientService, private storageService: StorageService, private fb: FormBuilder) {
    this._newIngredientForm = fb.group({
      name: fb.control(undefined, [Validators.required], [validatorIngredientUniqueName(this.ingredientService)]),
      measure: fb.control(undefined, [Validators.required]),
      volumePerUnit: fb.control(undefined, [Validators.required, Validators.min(0.0000000001)])
    });
    this._newIngredientPartForm = fb.group({
      value: fb.control(undefined, [Validators.required, Validators.min(0.0000000001)]),
      expirationDate: fb.control(undefined, [Validators.required]),
      ingredientId: fb.control(undefined, [Validators.required])
    });
  }

  changeFormValidator(id: number, ingrVolumePerUnit: number) {
    this._newIngredientPartForm.reset();
    this._newIngredientPartForm.patchValue({ingredientId: id});
    this._newIngredientPartForm.controls[this.VALUE].clearValidators();
    this._newIngredientPartForm.controls[this.VALUE].setValidators(
      [Validators.required, Validators.min(0.0000000001), Validators.max(this.freeStorageVolume / ingrVolumePerUnit)]);
  }

  ngAfterViewInit() {
    this.storageService.getMaxStorageVolume().pipe(map(data => this.maxStorageVolume = data.maxStorageVolume),
      switchMap(() => {
        return this.ingredientService.getUsedStorage();
      })).subscribe((data: number) => this.freeStorageVolume = this.maxStorageVolume - data);
    this.storageService.refreshUsedStorage$.pipe(
      switchMap(() => {
        return this.ingredientService.getUsedStorage();
      }))
      .subscribe((data: number) => this.freeStorageVolume = this.maxStorageVolume - data);


    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.ingredientService
            .getAllIngredients(this.sort.active, this.sort.direction, this.paginator.pageIndex, this.paginator.pageSize);
        }),
        map(data => {
          this.resultsLength = data.totalCount;
          return data.items;
        }),
        catchError(() => {
          return observableOf([]);
        })
      ).subscribe((data: Ingredient[]) => {
      data.forEach((a: Ingredient) => {
        let sum = 0;
        for (const part of a.parts) {
          sum += part.value;
        }
        a.summaryAmount = sum;
        a.summaryVolume = sum * a.volumePerUnit;
      });
      this.ingredients = data;
    });
  }


  createIng() {
    this.ingredientService.createIngredient(this._newIngredientForm.value as Ingredient).pipe(
      switchMap(() => {
        return this.ingredientService
          .getAllIngredients(this.sort.active, this.sort.direction, this.paginator.pageIndex, this.paginator.pageSize);
      }),
      map(data => {
        this.resultsLength = data.totalCount;
        return data.items;
      }),
      catchError(() => {
        return observableOf([]);
      })
    ).subscribe((data: Ingredient[]) => {
      data.forEach((a: Ingredient) => {
        let sum = 0;
        for (const part of a.parts) {
          sum += part.value;
        }
        a.summaryAmount = sum;
        a.summaryVolume = sum * a.volumePerUnit;
      });
      this.ingredients = data;
    });
    this.newIngredient.name = '';
    this.newIngredient.measure = '';
    this.newIngredient.volumePerUnit = 0;
    this._newIngredientForm.reset();
  }

  createIngPart() {
    this.ingredientService.createIngredientPart(this._newIngredientPartForm.value as IngredientPart)
      .pipe(
        switchMap(() => {
          return this.ingredientService
            .getAllIngredients(this.sort.active, this.sort.direction, this.paginator.pageIndex, this.paginator.pageSize);
        }),
        map(data => {
          this.resultsLength = data.totalCount;
          return data.items;
        }),
        catchError(() => {
          return observableOf([]);
        })
      ).subscribe((data: Ingredient[]) => {
      data.forEach((a: Ingredient) => {
        let sum = 0;
        for (const part of a.parts) {
          sum += part.value;
        }
        a.summaryAmount = sum;
        a.summaryVolume = sum * a.volumePerUnit;
      });
      this.ingredients = data;
      this.ingredientService.refreshMissingIngredients$.next(true);
      this.storageService.refreshUsedStorage$.next(true);
    });

  }

  deleteIngredient(ingredient: Ingredient) {
    this.ingredientService.isUsedIngredientInDish(ingredient.id).subscribe((isUsed: boolean) => {
      if (isUsed) {
        alert('Нельзя удалить ингредиент ' + ingredient.name + ', он используется в блюде.');
      } else {
        if (confirm('Вы точно хотите удалить ингредиент ' + ingredient.name + ' и все его партии?')) {
          this.ingredientService.deleteIngredient(ingredient.id).pipe(catchError(() => {
            return observableOf([]);
          })).pipe(
            switchMap(() => {
              return this.ingredientService
                .getAllIngredients(this.sort.active, this.sort.direction, this.paginator.pageIndex, this.paginator.pageSize);
            }),
            map(data => {
              this.resultsLength = data.totalCount;
              return data.items;
            }),
            catchError(() => {
              return observableOf([]);
            })
          ).subscribe((data: Ingredient[]) => {
            data.forEach((a: Ingredient) => {
              let sum = 0;
              for (const part of a.parts) {
                sum += part.value;
              }
              a.summaryAmount = sum;
              a.summaryVolume = sum * a.volumePerUnit;
            });
            this.ingredients = data;
            this.storageService.refreshUsedStorage$.next(true);
            this.ingredientService.refreshMissingIngredients$.next(true);
          });
        }
      }
    });
  }

  deleteIngPart(ingr: Ingredient, part: IngredientPart) {
    if (confirm('Вы точно хотите удалить партию с Id = ' + part.id + '?')) {
      ingr.parts.splice(ingr.parts.indexOf(part), 1);
      this.ingredientService.deleteIngredientPart(part.id).subscribe(() => {
        this.ingredientService.refreshMissingIngredients$.next(true);
        this.storageService.refreshUsedStorage$.next(true);
      });
      let sum = 0;
      for (const partOfIngredient of this.ingredients[this.ingredients.indexOf(ingr)].parts) {
        sum += partOfIngredient.value;
      }
      this.ingredients[this.ingredients.indexOf(ingr)].summaryAmount = sum;
      this.ingredients[this.ingredients.indexOf(ingr)].summaryVolume = sum * this.ingredients[this.ingredients.indexOf(ingr)].volumePerUnit;
    }
  }

  getErrorMessage() {
    return this._newIngredientPartForm.controls[this.VALUE].hasError('required') ? 'Не может быть пустым' :
      this._newIngredientPartForm.controls[this.VALUE].hasError('notEnoughSpace') ? 'Не хватит места на складе' :
        '';
  }

}
