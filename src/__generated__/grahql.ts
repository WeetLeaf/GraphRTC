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

export enum Action {
  Join = 'JOIN',
  Leave = 'LEAVE'
}

export type Mutation = {
  __typename?: 'Mutation';
  createRoom: Room;
  leaveRoom?: Maybe<Room>;
  /**
   * Mutation to trigger subscription serverStatus !
   * @deprecated Use only for testing
   */
  testSubscription: Scalars['Boolean'];
};


export type MutationCreateRoomArgs = {
  name: Scalars['String'];
  offer: OfferInput;
};


export type MutationLeaveRoomArgs = {
  name: Scalars['String'];
  uuid: Scalars['String'];
};

export type Offer = {
  __typename?: 'Offer';
  sdp?: Maybe<Scalars['String']>;
  type: RtcSdpType;
};

export type OfferInput = {
  sdp?: InputMaybe<Scalars['String']>;
  type: RtcSdpType;
};

export type ParticiantAction = {
  __typename?: 'ParticiantAction';
  action: Action;
  participant: Participant;
};

export type Participant = {
  __typename?: 'Participant';
  name: Scalars['String'];
  uuid: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  isAlive: Scalars['Boolean'];
  joinRoom?: Maybe<Room>;
  ping: Scalars['String'];
  room?: Maybe<Room>;
};


export type QueryJoinRoomArgs = {
  name: Scalars['String'];
  uuid: Scalars['String'];
};


export type QueryRoomArgs = {
  uuid: Scalars['String'];
};

export enum RtcSdpType {
  Answer = 'answer',
  Offer = 'offer',
  Pranswer = 'pranswer',
  Rollback = 'rollback'
}

export type Room = {
  __typename?: 'Room';
  participants: Array<Participant>;
  uuid: Scalars['String'];
};

export type Subscription = {
  __typename?: 'Subscription';
  /**
   * Subscription to server status, trigger using mutation `testSubscription`
   * @deprecated Use only for testing
   */
  serverStatus: Scalars['Float'];
  subscribeToParticipants: ParticiantAction;
};


export type SubscriptionSubscribeToParticipantsArgs = {
  uuid: Scalars['String'];
};

export type CreateRoomMutationVariables = Exact<{
  offer: OfferInput;
}>;


export type CreateRoomMutation = { __typename?: 'Mutation', room: { __typename?: 'Room', uuid: string } };

export type OnSubscriptionWorksSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnSubscriptionWorksSubscription = { __typename?: 'Subscription', serverStatus: number };

export type TestSubMutationMutationVariables = Exact<{ [key: string]: never; }>;


export type TestSubMutationMutation = { __typename?: 'Mutation', testSubscription: boolean };
