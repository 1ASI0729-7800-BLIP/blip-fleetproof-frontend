import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from "@angular/core";
import { UI_IMPORTS } from "../ui-imports";
@Component({
  selector: "app-state-message",
  imports: UI_IMPORTS,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` @if (loading()) {
      <div class="state" role="status">
        <span class="spinner"></span>{{ "common.loading" | translate }}
      </div>
    } @else if (error()) {
      <div class="state error" role="alert">
        <lucide-icon name="alert-triangle" size="22" />
        <p>{{ error()! | translate }}</p>
        <button mat-stroked-button (click)="retry.emit()">
          {{ "common.retry" | translate }}
        </button>
      </div>
    } @else if (empty()) {
      <div class="state">
        <lucide-icon name="file-text" size="24" />
        <p>{{ "common.empty" | translate }}</p>
      </div>
    }`,
})
export class StateMessage {
  loading = input(false);
  error = input<string | null>(null);
  empty = input(false);
  retry = output<void>();
}
