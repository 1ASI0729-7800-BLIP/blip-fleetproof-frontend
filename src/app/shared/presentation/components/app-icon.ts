import {
  Component,
  input,
  numberAttribute,
  ChangeDetectionStrategy,
} from "@angular/core";
import { LucideDynamicIcon } from "@lucide/angular";

@Component({
  selector: "lucide-icon",
  imports: [LucideDynamicIcon],
  template:
    '<svg [lucideIcon]="name()" [size]="size()" aria-hidden="true"></svg>',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [":host { display: inline-flex; align-items: center; }"],
})
export class AppIcon {
  readonly name = input.required<string>();
  readonly size = input(24, { transform: numberAttribute });
}
