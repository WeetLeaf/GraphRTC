import { Input } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

type FormType = {
  uuid: string;
};

export const JoinRoom = () => {
  const { push } = useRouter();

  const form = useForm<FormType>();

  return (
    <div className="space-y-2">
      <Input
        placeholder="Room ID"
        bg="white"
        textColor="blackAlpha.800"
        {...form.register("uuid")}
      />
      <button
        className="bg-white text-indigo-500 px-4 py-2 w-full rounded-md font-semibold"
        onClick={async () => {
          const uuid = form.getValues("uuid");
          push(`/${uuid}`);
        }}
      >
        Join room
      </button>
    </div>
  );
};
