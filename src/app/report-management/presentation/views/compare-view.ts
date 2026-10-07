import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { RiskBadge } from "../../../shared/presentation/components/risk-badge";
import { StateMessage } from "../../../shared/presentation/components/state-message";
import { LanguageStore } from "../../../shared/application/language.store";
import { ReportStore } from "../../application/report.store";
import { compareReports } from "../../domain/model/vehicle-report.entity";
@Component({
  imports: [...UI_IMPORTS, FormsModule, RouterLink, RiskBadge, StateMessage],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <a mat-button [routerLink]="['/reports', id()]"
      ><lucide-icon name="arrow-left" size="16" />{{
        "common.back" | translate
      }}</a
    >
    <div class="page-heading">
      <div>
        <h1>{{ "report.compare" | translate }}</h1>
        <p>{{ current()?.plate }}</p>
      </div>
    </div>
    <app-state-message
      [loading]="store.loading()"
      [error]="store.error()"
      (retry)="load()"
    />
    @if (current(); as report) {
      @if (previous(); as old) {
        <div class="toolbar">
          <mat-form-field appearance="outline"
            ><mat-label>{{ "report.before" | translate }}</mat-label
            ><mat-select
              [ngModel]="old.id"
              (ngModelChange)="selected.set($event)"
            >
              @for (r of options(); track r.id) {
                <mat-option [value]="r.id"
                  >v{{ r.version }} ·
                  {{ language.date(r.createdAt) }}</mat-option
                >
              }
            </mat-select></mat-form-field
          >
        </div>
        @if (!old.complete || !report.complete) {
          <div class="notice">{{ "report.partialComparison" | translate }}</div>
        }
        <div class="compare-grid">
          @for (r of [old, report]; track r.id) {
            <section class="section">
              <div class="section-heading">
                <div>
                  <h2>
                    {{
                      (r.id === old.id ? "report.before" : "report.after")
                        | translate
                    }}
                    · v{{ r.version }}
                  </h2>
                  <span class="secondary">{{
                    language.date(r.createdAt)
                  }}</span>
                </div>
                <app-risk-badge [risk]="r.risk" />
              </div>
              <div class="section-body">
                @for (f of r.findings; track f.id) {
                  <div class="finding" [class.high]="f.severity === 'high'">
                    <h3>{{ f.descriptionKey | translate }}</h3>
                    <p>{{ f.source }}</p>
                    @if (r.id === report.id && newIds().has(f.id)) {
                      <span class="badge status-open">{{
                        "report.newFinding" | translate
                      }}</span>
                    }
                  </div>
                }
                @if (!r.findings.length) {
                  <p class="muted">{{ "report.noFindings" | translate }}</p>
                }
                @for (s of r.sources; track s.name) {
                  <p style="font-size:12px">
                    {{ s.name }}: {{ "report." + s.status | translate }}
                  </p>
                }
              </div>
            </section>
          }
        </div>
        @if (!newIds().size && old.complete && report.complete) {
          <p class="success-text">{{ "report.unchanged" | translate }}</p>
        }
      } @else {
        <p class="state">{{ "report.noComparison" | translate }}</p>
      }
    } @else if (!store.loading() && !store.error()) {
      <p class="state">{{ "common.notFound" | translate }}</p>
    }`,
})
export class CompareView {
  readonly store = inject(ReportStore);
  readonly language = inject(LanguageStore);
  readonly id = signal(0);
  readonly selected = signal(0);
  readonly current = computed(() =>
    this.store.items().find((r) => r.id === this.id()),
  );
  readonly options = computed(() => {
    const r = this.current();
    return r
      ? this.store.forVehicle(r.vehicleId).filter((p) => p.version < r.version)
      : [];
  });
  readonly previous = computed(
    () =>
      this.options().find((r) => r.id === this.selected()) || this.options()[0],
  );
  readonly newIds = computed(() => {
    const p = this.previous(),
      c = this.current();
    return new Set(p && c ? compareReports(p, c).map((f) => f.id) : []);
  });
  constructor() {
    inject(ActivatedRoute)
      .paramMap.pipe(takeUntilDestroyed())
      .subscribe((p) => {
        this.id.set(Number(p.get("id")));
        this.selected.set(0);
      });
    void this.load();
  }
  load(): Promise<void> {
    return this.store.loadForUser();
  }
}
