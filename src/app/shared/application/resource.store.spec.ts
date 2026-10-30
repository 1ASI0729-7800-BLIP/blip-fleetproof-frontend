import { of, Subject } from "rxjs";
import { ResourceStore } from "./resource.store";
import { BaseApiEndpoint } from "../infrastructure/base-api-endpoint";
import { BaseResponse } from "../infrastructure/base-response";

describe("ResourceStore user scope", () => {
  type Item = { id: number };
  it("does not append a late save to a different user's list", async () => {
    const response = new Subject<Item>();
    const endpoint = {
      getAll: () => of([]), create: () => response,
    } as unknown as BaseApiEndpoint<Item, Item, BaseResponse>;
    const store = new ResourceStore(endpoint);
    await store.load({ userId: 1 });
    const saving = store.save({ id: 0 });
    await store.load({ userId: 2 });
    response.next({ id: 12 });response.complete();
    expect(await saving).toBeNull();
    expect(store.items()).toEqual([]);
  });
  it("does not overwrite a new user's error with a late save error", async () => {
    const response = new Subject<Item>();
    const endpoint = { getAll: () => of([]), create: () => response } as unknown as BaseApiEndpoint<Item, Item, BaseResponse>;
    const store = new ResourceStore(endpoint);
    await store.load({ userId: 1 });const saving = store.save({ id: 0 });
    await store.load({ userId: 2 });response.error(new Error("old request"));
    expect(await saving).toBeNull();expect(store.error()).toBeNull();
  });
});
