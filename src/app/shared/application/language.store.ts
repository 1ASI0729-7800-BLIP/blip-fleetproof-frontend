import { Injectable, inject, signal } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
@Injectable({ providedIn: "root" })
export class LanguageStore {
  private readonly translate = inject(TranslateService);
  readonly current = signal(
    localStorage.getItem("fleetproof.language") === "en" ? "en" : "es",
  );
  constructor() {
    this.use(this.current());
  }
  use(lang: string): void {
    const selected = lang === "en" ? "en" : "es";
    this.current.set(selected);
    localStorage.setItem("fleetproof.language", selected);
    document.documentElement.lang = selected;
    this.translate.use(selected);
  }
  date(value: string): string {
    return new Intl.DateTimeFormat(
      this.current() === "es" ? "es-PE" : "en-US",
      { dateStyle: "medium", timeStyle: "short" },
    ).format(new Date(value));
  }
}
