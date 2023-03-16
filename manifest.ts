import { Manifest } from "deno-slack-sdk/mod.ts";
import ReplyToMessageWorkflow from "./workflows/reply_to_message_workflow.ts";
import { ConversationsDatastore } from "./datastores/conversations_datastore.ts";

export default Manifest({
  name: "sawbot",
  description: "sawbot",
  icon: "assets/app_icon.png",
  workflows: [ReplyToMessageWorkflow],
  outgoingDomains: ["api.openai.com"],
  datastores: [ConversationsDatastore],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "channels:read",
    "channels:history",
    "app_mentions:read",
    "datastore:read",
    "datastore:write",
  ],
});
