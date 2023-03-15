import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const GenerateResponseFunctionDefinition = DefineFunction({
  callback_id: "generate_reponse_function",
  title: "Generate Response",
  description: "Generate a response to a message using OpenAI",
  source_file: "functions/generate_response_function.ts",
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
  output_parameters: {
    properties: {
      response_text: {
        type: Schema.types.string,
        description: "Response text",
      },
    },
    required: ["response_text"],
  },
});

export default SlackFunction(
  GenerateResponseFunctionDefinition,
  async ({ env, inputs }) => {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              "role": "system",
              "content": "You are a sassy assistant.",
            },
            {
              "role": "user",
              "content": inputs.text,
            },
          ],
          user: inputs.user,
        }),
      },
    );

    const body = await response.json();

    let botResponse = "";

    if (body.choices.length > 0) {
      botResponse = body.choices[0].message.content;
      botResponse = botResponse.replace("\n", "");
    }

    return {
      outputs: {
        response_text: botResponse,
      },
    };
  },
);
