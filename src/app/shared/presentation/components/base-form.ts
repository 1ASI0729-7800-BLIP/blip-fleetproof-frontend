import { AbstractControl } from "@angular/forms";

export abstract class BaseForm {
  protected validateForm(form: AbstractControl): boolean {
    form.markAllAsTouched();
    return form.valid;
  }
}
