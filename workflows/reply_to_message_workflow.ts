import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GenerateResponseFunctionDefinition } from "../functions/generate_response_function.ts";

const ReplyToMessageWorkflow = DefineWorkflow({
  callback_id: "reply_to_message_workflow",
  title: "Reply to message",
  description: "Reply to a message",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
      },
      text: {
        type: Schema.types.string,
      },
      user: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["channel", "text", "user"],
  },
});

const generateResponseFunctionStep = ReplyToMessageWorkflow.addStep(
  GenerateResponseFunctionDefinition,
  {
    channel: ReplyToMessageWorkflow.inputs.channel,
    text: ReplyToMessageWorkflow.inputs.text,
    user: ReplyToMessageWorkflow.inputs.user,
  },
);

ReplyToMessageWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: ReplyToMessageWorkflow.inputs.channel,
  message: generateResponseFunctionStep.outputs.response_text,
});

export default ReplyToMessageWorkflow;
