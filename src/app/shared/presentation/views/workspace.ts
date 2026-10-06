import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { UI_IMPORTS } from "../ui-imports";
import { LanguageSwitcher } from "../components/language-switcher";
import { IamStore } from "../../../iam/application/iam.store";
@Component({
  selector: "app-workspace",
  imports: [
    ...UI_IMPORTS,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    LanguageSwitcher,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <div class="workspace">
    <aside class="sidebar" [class.open]="menuOpen()">
      <a class="brand" routerLink="/dashboard" aria-label="FleetProof">
        <span class="brand-logo"><img src="/assets/fleetproof-logo.png" alt="FleetProof" /></span>
        <small>BLIP</small>
      </a>
      <div class="workspace-label">{{ "nav.workspace" | translate }}</div>
      <nav [attr.aria-label]="'nav.main' | translate">
        @for (item of links; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="active"
            (click)="menuOpen.set(false)"
            ><lucide-icon [name]="item.icon" size="19" />{{
              item.key | translate
            }}</a
          >
        }
      </nav>
      <div class="sidebar-bottom">
        <span class="demo-dot"></span>{{ "common.demo" | translate
        }}<small>TB1 · Sprint 2</small>
      </div>
    </aside>
    @if (menuOpen()) {
      <button
        class="scrim"
        (click)="menuOpen.set(false)"
        [attr.aria-label]="'common.close' | translate"
      ></button>
    }
    <section class="main-area">
      <header class="topbar">
        <button
          mat-icon-button
          class="mobile-menu"
          (click)="menuOpen.set(!menuOpen())"
          [attr.aria-label]="'nav.main' | translate"
        >
          <lucide-icon name="menu" />
        </button>
        <a routerLink="/dashboard" class="mobile-brand" aria-label="FleetProof">
          <span class="brand-logo"><img src="/assets/fleetproof-logo.png" alt="FleetProof" /></span>
        </a>
        <span class="topbar-context"
          >{{ "nav.workspace" | translate }}
          <lucide-icon name="chevron-right" size="15" />
          {{ "common.documentary" | translate }}</span
        >
        <app-language-switcher />
        <a class="account-button" routerLink="/profile"
          ><span class="avatar">{{ iam.user()?.name?.slice(0, 1) }}</span
          ><span>{{ iam.user()?.name }}</span></a
        >
        <button
          mat-icon-button
          (click)="iam.signOut()"
          [matTooltip]="'common.logout' | translate"
          [attr.aria-label]="'common.logout' | translate"
        >
          <lucide-icon name="log-out" size="18" />
        </button>
      </header>
      <main class="page-content"><router-outlet /></main>
      <footer>
        FleetProof · BLIP <span>{{ "common.demo" | translate }}</span>
      </footer>
    </section>
  </div>`,
})
export class Workspace {
  readonly iam = inject(IamStore);
  readonly menuOpen = signal(false);
  readonly links = [
    { path: "/dashboard", icon: "layout-dashboard", key: "nav.dashboard" },
    { path: "/vehicles", icon: "truck", key: "nav.fleet" },
    { path: "/reports", icon: "file-text", key: "nav.reports" },
    { path: "/monitoring", icon: "history", key: "nav.monitoring" },
    { path: "/alerts", icon: "bell", key: "nav.alerts" },
    { path: "/cases", icon: "clipboard-check", key: "nav.cases" },
    { path: "/profile", icon: "user", key: "nav.profile" },
  ];
}
