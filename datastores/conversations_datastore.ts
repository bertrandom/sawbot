import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const ConversationsDatastore = DefineDatastore({
  name: "conversations",
  primary_key: "id",
  attributes: {
    id: { type: Schema.types.string },
    payload: { type: Schema.types.string },
  },
});
