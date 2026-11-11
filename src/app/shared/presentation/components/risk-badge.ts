import { Component, input, ChangeDetectionStrategy } from "@angular/core";
import { UI_IMPORTS } from "../ui-imports";
@Component({
  selector: "app-risk-badge",
  imports: UI_IMPORTS,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<span class="badge" [class]="'badge risk-' + risk()"
    ><lucide-icon
      [name]="risk() === 'low' ? 'check-circle' : 'alert-triangle'"
      size="14"
    />{{ "risk." + risk() | translate }}</span
  >`,
})
export class RiskBadge {
  risk = input<string>("unknown");
}
