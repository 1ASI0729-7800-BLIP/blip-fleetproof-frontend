import { Injectable, inject } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { LanguageStore } from "../../shared/application/language.store";
import { VehicleReport } from "../domain/model/vehicle-report.entity";
@Injectable({ providedIn: "root" })
export class PdfExportService {
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageStore);
  async download(report: VehicleReport): Promise<void> {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 22;
    const line = (text: string, size = 11): void => {
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(text, 174);
      for (const value of lines) {
        if (y > 275) {
          doc.addPage();
          y = 22;
        }
        doc.text(value, 18, y);
        y += 7;
      }
      y += 3;
    };
    const t = (key: string): string => this.translate.instant(key);
    doc.setTextColor(22, 50, 79);
    line("FleetProof | BLIP", 22);
    line(t("report.title") + " · " + report.plate, 16);
    line(t("report.notOfficial"));
    line(t("common.date") + ": " + this.language.date(report.createdAt));
    line(t("vehicle.risk") + ": " + t("risk." + report.risk));
    line(t(report.explanation));
    line(
      t("common.status") +
        ": " +
        t(report.complete ? "report.complete" : "report.partial"),
    );
    for (const source of report.sources) {
      line(source.name + " · " + t("report." + source.status), 13);
      line(this.language.date(source.checkedAt));
      line(
        source.status === "available"
          ? source.evidence
          : t("report.sourceFailure"),
      );
      for (const finding of source.findings)
        line(t(finding.descriptionKey) + " · " + t("risk." + finding.severity));
    }
    doc.save(
      "FleetProof-" +
        report.plate +
        "-v" +
        report.version +
        "-" +
        this.language.current() +
        ".pdf",
    );
  }
}
