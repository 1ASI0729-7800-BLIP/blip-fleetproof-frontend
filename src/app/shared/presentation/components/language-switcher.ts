import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import { LanguageStore } from "../../application/language.store";
import { UI_IMPORTS } from "../ui-imports";
@Component({
  selector: "app-language-switcher",
  imports: UI_IMPORTS,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <div
    class="language-switch"
    role="group"
    [attr.aria-label]="'common.language' | translate"
  >
    <button
      type="button"
      [class.selected]="language.current() === 'es'"
      (click)="language.use('es')"
      [attr.aria-pressed]="language.current() === 'es'"
    >
      ES
    </button>
    <button
      type="button"
      [class.selected]="language.current() === 'en'"
      (click)="language.use('en')"
      [attr.aria-pressed]="language.current() === 'en'"
    >
      EN
    </button>
  </div>`,
})
export class LanguageSwitcher {
  readonly language = inject(LanguageStore);
}
