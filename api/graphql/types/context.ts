import type { IncomingMessage, ServerResponse } from "http";
import { CustomPubSub } from "../../utils/pubsub.utils";

export type IncomingNextMessage = IncomingMessage;

type GenericContext = {
  pubsub: CustomPubSub;
};

export type HttpContext = {
  req: IncomingMessage;
  res: ServerResponse;
} & GenericContext;

export type HttpContextWithUser = HttpContext;
export type SubscriptionsContext = GenericContext;

export type HandlerContext = { req: IncomingNextMessage; res: ServerResponse };
