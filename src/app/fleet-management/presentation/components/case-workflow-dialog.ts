import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { IamStore } from "../../../iam/application/iam.store";
import { ResolutionCase } from "../../domain/model/fleet.entity";
import { CaseAction, CaseActivityData, CaseWorkflowApi } from "../../infrastructure/case-workflow-api";

@Component({
  imports: [...UI_IMPORTS, ReactiveFormsModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <h2 mat-dialog-title>{{ "cases.workflow" | translate }} · #{{ item.id }}</h2>
    <mat-dialog-content>
      <div class="case-summary">
        <div><span>{{ "cases.title" | translate }}</span><strong>{{ item.title }}</strong></div>
        <div><span>{{ "common.responsible" | translate }}</span><strong>{{ item.responsible }}</strong></div>
        <div><span>{{ "common.status" | translate }}</span><strong>{{ "cases." + item.status | translate }}</strong></div>
      </div>

      <section class="timeline">
        <h3>{{ "cases.history" | translate }}</h3>
        @if (loading()) { <p>{{ "common.loading" | translate }}</p> }
        @for (activity of activities(); track activity.id) {
          <article>
            <span class="dot"></span>
            <div>
              <header><strong>{{ actionLabel(activity.action) | translate }}</strong><time>{{ date(activity.recordedAt) }}</time></header>
              <p>{{ activity.description }}</p>
              <small>{{ "common.responsible" | translate }}: {{ activity.responsible }} · Actor #{{ activity.actorId }}</small>
            </div>
          </article>
        } @empty {
          @if (!loading()) { <p>{{ "cases.noActivities" | translate }}</p> }
        }
      </section>

      @if (item.status !== "closed") {
        <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid workflow-form">
          <mat-form-field appearance="outline" class="full">
            <mat-label>{{ "cases.action" | translate }}</mat-label>
            <mat-select formControlName="action">
              @for (action of availableActions(); track action) {
                <mat-option [value]="action">{{ actionLabel(action) | translate }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          @if (requiresResponsible()) {
            <mat-form-field appearance="outline" class="full">
              <mat-label>{{ "cases.newResponsible" | translate }}</mat-label>
              <input matInput formControlName="responsible" />
            </mat-form-field>
          }
          <mat-form-field appearance="outline" class="full">
            <mat-label>{{ descriptionLabel() | translate }}</mat-label>
            <textarea matInput rows="3" formControlName="description"></textarea>
            <mat-error>{{ "common.required" | translate }}</mat-error>
          </mat-form-field>
          @if (error()) { <p class="error full">{{ error() }}</p> }
          <button mat-flat-button class="full" type="submit" [disabled]="saving()">
            {{ (saving() ? "common.loading" : "cases.registerAction") | translate }}
          </button>
        </form>
      } @else {
        <p class="closed-message">{{ "cases.closedMessage" | translate }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end"><button mat-button (click)="close()">{{ "common.close" | translate }}</button></mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width:min(700px,82vw); }
    .case-summary { display:grid; grid-template-columns:2fr 1fr 1fr; gap:.75rem; margin-bottom:1.2rem; }
    .case-summary div { background:#f4f8fa; border:1px solid #dce6ec; border-radius:.65rem; padding:.75rem; }
    .case-summary span,.case-summary strong { display:block; }.case-summary span { color:#52677b; font-size:.72rem; margin-bottom:.3rem; }
    .timeline { border-top:1px solid #dce6ec; padding-top:1rem; max-height:310px; overflow:auto; }
    .timeline article { display:grid; grid-template-columns:12px 1fr; gap:.7rem; position:relative; padding-bottom:1rem; }
    .timeline article::before { content:""; position:absolute; left:5px; top:12px; bottom:-2px; width:2px; background:#dce6ec; }
    .timeline article:last-child::before { display:none; }.dot { width:12px; height:12px; border-radius:50%; background:#087f8c; margin-top:.25rem; z-index:1; }
    .timeline header { display:flex; justify-content:space-between; gap:1rem; }.timeline time,.timeline small { color:#52677b; font-size:.72rem; }.timeline p { margin:.35rem 0; }
    .workflow-form { border-top:1px solid #dce6ec; margin-top:.5rem; padding-top:1rem; }.closed-message { background:#e9f8f4; color:#08765a; border-radius:.6rem; padding:.8rem; }
    @media(max-width:650px){mat-dialog-content{min-width:0}.case-summary{grid-template-columns:1fr}}
  `],
})
export class CaseWorkflowDialog {
  readonly item = inject<ResolutionCase>(MAT_DIALOG_DATA);
  private readonly api = inject(CaseWorkflowApi);
  private readonly iam = inject(IamStore);
  private readonly ref = inject(MatDialogRef<CaseWorkflowDialog>);
  readonly activities = signal<CaseActivityData[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal("");
  readonly actions: CaseAction[] = ["ASSIGN", "CONTACT_DRIVER", "DRIVER_RESPONDED", "DRIVER_NO_RESPONSE", "ESCALATE", "REQUEST_ASSISTANCE", "RECORD_SOLUTION", "RESOLVE", "CLOSE"];
  readonly form = inject(FormBuilder).nonNullable.group({
    action: ["CONTACT_DRIVER" as CaseAction, Validators.required],
    description: ["", [Validators.required, Validators.pattern(/\S/)]],
    responsible: [""],
  });

  constructor() { void this.load(); }

  availableActions(): CaseAction[] {
    return this.item.status === "resolved" ? ["CLOSE"] : this.actions.filter((action) => action !== "CLOSE");
  }
  requiresResponsible(): boolean { return ["ASSIGN", "ESCALATE"].includes(this.form.controls.action.value); }
  descriptionLabel(): string { return ["RECORD_SOLUTION", "RESOLVE"].includes(this.form.controls.action.value) ? "cases.solution" : "cases.actionDescription"; }
  actionLabel(action: string): string { return `cases.actions.${action}`; }
  date(value: string): string { return new Intl.DateTimeFormat(document.documentElement.lang === "en" ? "en-US" : "es-PE", { dateStyle:"medium", timeStyle:"short" }).format(new Date(value)); }

  async load(): Promise<void> {
    this.loading.set(true);
    try { this.activities.set(await this.api.activities(this.item.id)); }
    catch { this.error.set("No se pudo cargar el historial."); }
    finally { this.loading.set(false); }
  }

  async submit(): Promise<void> {
    if (this.form.invalid || (this.requiresResponsible() && !this.form.controls.responsible.value.trim())) {
      this.form.markAllAsTouched(); return;
    }
    this.saving.set(true); this.error.set("");
    try {
      const value = this.form.getRawValue();
      await this.api.addActivity(this.item.id, {
        actorId: this.iam.user()!.id,
        action: value.action,
        description: value.description.trim(),
        responsible: value.responsible.trim() || undefined,
      });
      this.form.controls.description.setValue(""); this.form.controls.responsible.setValue("");
      await this.load();
      if (["RESOLVE", "CLOSE", "ASSIGN", "ESCALATE"].includes(value.action)) this.ref.close(true);
    } catch { this.error.set("No se pudo registrar la acción. Revisa la transición del caso."); }
    finally { this.saving.set(false); }
  }
  close(): void { this.ref.close(true); }
}
