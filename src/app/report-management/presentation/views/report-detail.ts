import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { RiskBadge } from "../../../shared/presentation/components/risk-badge";
import { StateMessage } from "../../../shared/presentation/components/state-message";
import { LanguageStore } from "../../../shared/application/language.store";
import { ReportStore } from "../../application/report.store";
import { PdfExportService } from "../../application/pdf-export.service";
import { MatDialog } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { CaseDialog } from "../../../fleet-management/presentation/components/case-dialog";
import { Finding } from "../../domain/model/vehicle-report.entity";
@Component({
  imports: [...UI_IMPORTS, RouterLink, RiskBadge, StateMessage],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <a mat-button routerLink="/reports"
      ><lucide-icon name="arrow-left" size="16" />{{
        "common.back" | translate
      }}</a
    >
    <app-state-message
      [loading]="store.loading()"
      [error]="store.error()"
      (retry)="store.loadForUser()"
    />
    @if (report(); as r) {
      <div class="page-heading">
        <div>
          <h1>
            {{ r.plate }}
            <span class="muted" style="font-size:18px">· v{{ r.version }}</span>
          </h1>
          <p>
            {{ "report.generated" | translate }} ·
            {{ language.date(r.createdAt) }}
          </p>
        </div>
        <div class="actions">
          <button
            mat-stroked-button
            (click)="download()"
            [disabled]="exporting()"
          >
            <lucide-icon name="download" size="17" />{{
              "common.download" | translate
            }}</button
          ><a mat-flat-button [routerLink]="['/vehicles', r.vehicleId]">{{
            "common.view" | translate
          }}</a>
        </div>
      </div>
      <div class="notice">{{ "report.notOfficial" | translate }}</div>
      <div class="actions" style="margin-bottom:20px">
        <a mat-stroked-button [routerLink]="['/reports', r.id, 'compare']"
          ><lucide-icon name="history" size="17" />{{
            "report.compare" | translate
          }}</a
        >
      </div>
      <div class="split">
        <section class="section">
          <div class="section-heading">
            <h2>{{ "report.coverage" | translate }}</h2>
            <span
              [class]="'badge status-' + (r.complete ? 'complete' : 'partial')"
              >{{
                (r.complete ? "report.complete" : "report.partial") | translate
              }}</span
            >
          </div>
          @for (s of r.sources; track s.name) {
            <div class="source-row">
              <div style="flex:1;min-width:0">
                <h3>{{ s.name }}</h3>
                <p>{{ language.date(s.checkedAt) }}</p>
                @if (s.status === "unavailable") {
                  <p>{{ "report.sourceFailure" | translate }}</p>
                } @else {
                  <p>
                    {{ "report.evidenceLabel" | translate }} · {{ s.evidence }}
                  </p>
                }
                @for (f of s.findings; track f.id) {
                  <div class="finding" [class.high]="f.severity === 'high'">
                    <h3>{{ f.descriptionKey | translate }}</h3>
                    <p>
                      {{ "common.source" | translate }}: {{ f.source }} ·
                      {{ "risk." + f.severity | translate }}
                    </p>
                    <button mat-button (click)="createCase(f)">
                      <lucide-icon name="plus" size="15" />{{
                        "cases.create" | translate
                      }}
                    </button>
                  </div>
                }
              </div>
              <span
                [class]="
                  'badge status-' +
                  (s.status === 'available' ? 'complete' : 'unavailable')
                "
                >{{ "report." + s.status | translate }}</span
              >
            </div>
          }
        </section>
        <div class="stack">
          <section class="section">
            <div class="section-body">
              <h2>{{ "report.riskExplanation" | translate }}</h2>
              <app-risk-badge [risk]="r.risk" />
              <p>{{ r.explanation | translate }}</p>
              <p class="muted" style="font-size:12px">
                {{ "report.notOfficial" | translate }}
              </p>
            </div>
          </section>
          <section class="section">
            <div class="section-body">
              <h2>{{ "report.findings" | translate }}</h2>
              <strong style="font-size:28px">{{ r.findings.length }}</strong>
              @if (!r.findings.length) {
                <p class="muted">{{ "report.noFindings" | translate }}</p>
              }
            </div>
          </section>
        </div>
      </div>
    } @else if (!store.loading() && !store.error()) {
      <p class="state">{{ "common.notFound" | translate }}</p>
    }`,
})
export class ReportDetail {
  readonly store = inject(ReportStore);
  readonly language = inject(LanguageStore);
  private readonly pdf = inject(PdfExportService);
  readonly id = signal(0);
  readonly exporting = signal(false);
  readonly report = computed(() =>
    this.store.items().find((r) => r.id === this.id()),
  );
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);
  constructor() {
    inject(ActivatedRoute)
      .paramMap.pipe(takeUntilDestroyed())
      .subscribe((p) => this.id.set(Number(p.get("id"))));
    void this.store.loadForUser();
  }
  async download(): Promise<void> {
    const r = this.report();
    if (!r || this.exporting()) return;
    this.exporting.set(true);
    try {
      await this.pdf.download(r);
    } catch {
      this.store.error.set("common.saveError");
    } finally {
      this.exporting.set(false);
    }
  }
  createCase(f: Finding): void {
    const r = this.report();
    if (r)
      this.dialog.open(CaseDialog, {
        data: {
          vehicleId: r.vehicleId,
          reportId: r.id,
          findingId: f.id,
          title: this.translate.instant(f.descriptionKey),
        },
        width: "580px",
        maxWidth: "95vw",
      });
  }
}
