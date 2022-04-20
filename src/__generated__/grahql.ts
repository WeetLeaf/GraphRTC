export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
};

export type Mutation = {
  __typename?: 'Mutation';
  /**
   * Mutation to trigger subscription serverStatus !
   * @deprecated Use only for testing
   */
  testSubscription: Scalars['Boolean'];
};

export type Query = {
  __typename?: 'Query';
  isAlive: Scalars['Boolean'];
  ping: Scalars['String'];
};

export type Subscription = {
  __typename?: 'Subscription';
  /**
   * Subscription to server status, trigger using mutation `testSubscription`
   * @deprecated Use only for testing
   */
  serverStatus: Scalars['Float'];
};

export type OnSubscriptionWorksSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnSubscriptionWorksSubscription = { __typename?: 'Subscription', serverStatus: number };

export type TestSubMutationMutationVariables = Exact<{ [key: string]: never; }>;


export type TestSubMutationMutation = { __typename?: 'Mutation', testSubscription: boolean };
