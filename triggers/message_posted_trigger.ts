import { Trigger } from "deno-slack-api/types.ts";
import ReplyToMessageWorkflow from "../workflows/reply_to_message_workflow.ts";

const messagePostedTrigger: Trigger<typeof ReplyToMessageWorkflow.definition> =
  {
    type: "event",
    name: "Message posted to #test-sawbot",
    description: "Message posted to #test-sawbot",
    workflow: "#/workflows/reply_to_message_workflow",
    event: {
      event_type: "slack#/events/message_posted",
      channel_ids: ["C04T604MW80"],
      filter: {
        version: 1,
        root: {
          statement: "{{data.channel_id}} == C04T604MW80",
        },
      },
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

export default messagePostedTrigger;
