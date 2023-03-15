import { Trigger } from "deno-slack-api/types.ts";
import ReplyToMessageWorkflow from "../workflows/reply_to_message_workflow.ts";

const appMentionedTrigger: Trigger<typeof ReplyToMessageWorkflow.definition> = {
  type: "event",
  name: "App mentioned",
  description: "App mentioned",
  workflow: "#/workflows/reply_to_message_workflow",
  event: {
    event_type: "slack#/events/app_mentioned",
    channel_ids: ["C04SDEU46LD", "C04TZJH42EN"],
  },
  inputs: {
    channel: {
      value: "{{data.channel_id}}",
    },
    text: {
      value: "{{data.text}}",
    },
    user: {
      value: "{{data.user_id}}",
    },
  },
};

export default appMentionedTrigger;
