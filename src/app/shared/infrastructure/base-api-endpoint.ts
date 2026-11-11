import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { BaseEntity } from "../domain/model/base-entity";
import { BaseResource, BaseResponse } from "./base-response";
import { BaseAssembler } from "./base-assembler";
// Adapted from the course learning-center BaseApiEndpoint; errors remain typed HTTP errors.
export class BaseApiEndpoint<
  T extends BaseEntity,
  R extends BaseResource,
  S extends BaseResponse,
> {
  constructor(
    protected http: HttpClient,
    protected endpointUrl: string,
    protected assembler: BaseAssembler<T, R, S>,
  ) {}
  getAll(params: Record<string, string | number> = {}): Observable<T[]> {
    return this.http
      .get<R[] | S>(this.endpointUrl, { params })
      .pipe(
        map((data) =>
          Array.isArray(data)
            ? data.map((item) => this.assembler.toEntityFromResource(item))
            : this.assembler.toEntitiesFromResponse(data),
        ),
      );
  }
  getById(id: number): Observable<T> {
    return this.http
      .get<R>(`${this.endpointUrl}/${id}`)
      .pipe(map((data) => this.assembler.toEntityFromResource(data)));
  }
  create(entity: T): Observable<T> {
    const resource: Partial<R> = {
      ...this.assembler.toResourceFromEntity(entity),
    };
    if (!entity.id) delete resource.id;
    return this.http
      .post<R>(this.endpointUrl, resource)
      .pipe(map((data) => this.assembler.toEntityFromResource(data)));
  }
  update(entity: T): Observable<T> {
    return this.http
      .put<R>(
        `${this.endpointUrl}/${entity.id}`,
        this.assembler.toResourceFromEntity(entity),
      )
      .pipe(map((data) => this.assembler.toEntityFromResource(data)));
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${id}`);
  }
}
