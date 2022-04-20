import { InputRef } from '@pothos/core';

export type ExtractInputType<T> = T extends InputRef<infer U> ? U : never;
