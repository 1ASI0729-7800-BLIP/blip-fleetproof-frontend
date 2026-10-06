import { signal } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { BaseEntity } from "../domain/model/base-entity";
import { BaseResource, BaseResponse } from "../infrastructure/base-response";
import { BaseApiEndpoint } from "../infrastructure/base-api-endpoint";
export class ResourceStore<
  T extends BaseEntity,
  R extends BaseResource,
  S extends BaseResponse,
> {
  readonly items = signal<T[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  private requestId = 0;
  private scope = "";
  constructor(protected endpoint: BaseApiEndpoint<T, R, S>) {}
  async load(params: Record<string, string | number> = {}): Promise<void> {
    const requestId = ++this.requestId;
    const scope = JSON.stringify(params);
    if (scope !== this.scope) {
      this.items.set([]);
      this.scope = scope;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      const items = await firstValueFrom(this.endpoint.getAll(params));
      if (requestId === this.requestId) this.items.set(items);
    } catch {
      if (requestId === this.requestId) this.error.set("common.loadError");
    } finally {
      if (requestId === this.requestId) this.loading.set(false);
    }
  }
  async save(entity: T): Promise<T | null> {
    if (this.saving()) return null;
    this.saving.set(true);
    this.error.set(null);
    try {
      const saved = await firstValueFrom(
        entity.id ? this.endpoint.update(entity) : this.endpoint.create(entity),
      );
      this.items.update((items) =>
        entity.id
          ? items.map((item) => (item.id === saved.id ? saved : item))
          : [...items, saved],
      );
      return saved;
    } catch {
      this.error.set("common.saveError");
      return null;
    } finally {
      this.saving.set(false);
    }
  }
}
