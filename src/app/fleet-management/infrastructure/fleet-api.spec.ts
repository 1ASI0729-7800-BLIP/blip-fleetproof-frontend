import { CaseAssembler } from "./fleet-api";
import { CaseData } from "./resources";

describe("CaseAssembler history", () => {
  const data: CaseData = {
    id: 1, userId: 1, vehicleId: 1, reportId: 1, findingId: "fine",
    title: "Synthetic finding", responsible: "Demo", dueDate: "2026-10-30",
    status: "open", evidence: "", notes: "", createdAt: "2026-10-29T12:00:00Z",
  };
  it("loads old cases without inventing historical actions", () => {
    expect(new CaseAssembler().toEntityFromResource(data).history).toEqual([]);
  });
  it("preserves history and does not alias the HTTP resource", () => {
    const resource = { ...data, history: [{ recordedAt: data.createdAt, actorId: 1, responsible: "Demo", status: "open" as const, evidence: "ref", notes: "note" }] };
    const assembler = new CaseAssembler();
    const entity = assembler.toEntityFromResource(resource);
    resource.history[0].evidence = "changed";
    expect(entity.history[0].evidence).toBe("ref");
    expect(assembler.toResourceFromEntity(entity).history).toEqual(entity.history);
  });
  it("requires evidence to resolve a case", () => {
    const entity = new CaseAssembler().toEntityFromResource(data);
    expect(entity.canResolve).toBeFalse();
    entity.recordEvidence("  synthetic receipt  ");
    expect(entity.canResolve).toBeTrue();
  });
});
