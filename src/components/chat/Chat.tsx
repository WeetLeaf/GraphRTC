import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { gql, useMutation, useSubscription } from "@apollo/client";
import {
  OnMessageSubscription,
  OnMessageSubscriptionVariables,
  SendMessageMutation,
  SendMessageMutationVariables,
} from "../../__generated__/grahql";
import { IChatMessage } from "../../../api/graphql/resolvers/chat.message";
import { useRTC } from "../../contexts/rtc.context";

type ChatRoomProps = {
  roomUuid: string;
};

const messageSchema = z.object({
  message: z.string().min(1).max(1000),
});

type MessageForm = z.infer<typeof messageSchema>;

const subscribeToMessages = gql`
  subscription onMessage($roomUuid: String!) {
    message: subscribeToMessages(roomUuid: $roomUuid) {
      message
      roomUuid
      sender
    }
  }
`;

const sendMessage = gql`
  mutation sendMessage(
    $message: String!
    $roomUuid: String!
    $sender: String!
  ) {
    sendMessage(message: $message, roomUuid: $roomUuid, sender: $sender)
  }
`;

export const ChatRoom = ({ roomUuid }: ChatRoomProps) => {
  const form = useForm<MessageForm>({ resolver: zodResolver(messageSchema) });
  const { identity } = useRTC();

  const ref = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Omit<IChatMessage, "roomUuid">[]>([
    { sender: "system", message: "Bienvenu dans le chat" },
  ]);

  const [sendMessageMutation] = useMutation<
    SendMessageMutation,
    SendMessageMutationVariables
  >(sendMessage);

  useEffect(() => {
    ref.current?.scrollTo({
      behavior: "smooth",
      top: ref.current.scrollHeight,
    });
  }, [messages]);

  useSubscription<OnMessageSubscription, OnMessageSubscriptionVariables>(
    subscribeToMessages,
    {
      variables: { roomUuid },
      onSubscriptionData: (data) => {
        console.log(data.subscriptionData.data?.message);
        const message = data.subscriptionData.data?.message;
        if (!message) return;
        setMessages((messages) => [...messages, message]);
      },
    }
  );

  const onSubmit = form.handleSubmit((value) => {
    return sendMessageMutation({
      variables: { message: value.message, roomUuid, sender: identity },
    }).then(() => {
      form.reset();
    });
  });

  return (
    <div className="h-screen max-h-screen  bg-indigo-400 p-4 scroll relative flex flex-col space-y-4">
      <div
        ref={ref}
        className="space-y-2 overflow-hidden overflow-y-scroll flex-1 no-scrollbar"
      >
        {messages.map(({ message, sender }, i) => (
          <div className="bg-white rounded-lg" key={i + message}>
            <div className="text-sm text-gray-500 p-2">
              {sender.toUpperCase()}
            </div>
            <div className="px-4 pb-4">{message}</div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-400">
        <form onSubmit={onSubmit} className=" flex space-x-4">
          <input
            type="text"
            className="w-full p-2 flex-1 rounded-md"
            placeholder="message"
            {...form.register("message")}
          />
          <button className="px-8 rounded-md bg-indigo-700 text-white">
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
};
