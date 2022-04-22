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
  createRoom: Room;
  sendUserOffer: Scalars['Boolean'];
  /**
   * Mutation to trigger subscription serverStatus !
   * @deprecated Use only for testing
   */
  testSubscription: Scalars['Boolean'];
};


export type MutationCreateRoomArgs = {
  name: Scalars['String'];
};


export type MutationSendUserOfferArgs = {
  offer: OfferInput;
  roomUuid: Scalars['String'];
  userUuid: Scalars['String'];
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
  action: Offer;
  participant: Participant;
};

export type Participant = {
  __typename?: 'Participant';
  uuid: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  isAlive: Scalars['Boolean'];
  joinRoom?: Maybe<Scalars['Boolean']>;
  ping: Scalars['String'];
};


export type QueryJoinRoomArgs = {
  roomUuid: Scalars['String'];
  userUuid: Scalars['String'];
};

export enum RtcSdpType {
  Answer = 'answer',
  Offer = 'offer',
  Pranswer = 'pranswer',
  Rollback = 'rollback'
}

export type Room = {
  __typename?: 'Room';
  uuid: Scalars['String'];
};

export type Subscription = {
  __typename?: 'Subscription';
  /**
   * Subscription to server status, trigger using mutation `testSubscription`
   * @deprecated Use only for testing
   */
  serverStatus: Scalars['Float'];
  subscribeToAnswers: ParticiantAction;
  subscribeToOffers: Offer;
  subscribeToParticipants: Participant;
};


export type SubscriptionSubscribeToAnswersArgs = {
  uuid: Scalars['String'];
};


export type SubscriptionSubscribeToOffersArgs = {
  roomUuid: Scalars['String'];
  userUuid: Scalars['String'];
};


export type SubscriptionSubscribeToParticipantsArgs = {
  roomUuid: Scalars['String'];
};

export type CreateRoomMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateRoomMutation = { __typename?: 'Mutation', room: { __typename?: 'Room', uuid: string } };

export type OnNewParticipantSubscriptionVariables = Exact<{
  roomId: Scalars['String'];
}>;


export type OnNewParticipantSubscription = { __typename?: 'Subscription', subscribeToParticipants: { __typename?: 'Participant', uuid: string } };

export type OnSubscriptionWorksSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnSubscriptionWorksSubscription = { __typename?: 'Subscription', serverStatus: number };

export type TestSubMutationMutationVariables = Exact<{ [key: string]: never; }>;


export type TestSubMutationMutation = { __typename?: 'Mutation', testSubscription: boolean };
