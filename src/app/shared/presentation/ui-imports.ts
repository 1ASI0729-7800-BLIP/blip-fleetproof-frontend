import { CommonModule } from "@angular/common";
import { TranslatePipe } from "@ngx-translate/core";
import { AppIcon } from "./components/app-icon";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";
export const UI_IMPORTS = [
  CommonModule,
  TranslatePipe,
  AppIcon,
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatTooltipModule,
];
