import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { encode } from "https://deno.land/x/gpt@1.5/mod.ts";

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

function calculateConversationTokenLength(
  conversation: [string, string][],
  SYSTEM_PROMPT: string,
  currentPrompt: string,
): number {
  // Deep Dive: "Counting tokens for chat API calls"
  // https://platform.openai.com/docs/guides/chat/introduction

  let total = 0;

  total += 4; // every message follows <im_start>{role/name}\n{content}<im_end>\n
  total += encode(SYSTEM_PROMPT).length;

  for (const [prompt, response] of conversation) {
    total += 4; // every message follows <im_start>{role/name}\n{content}<im_end>\n
    total += encode(prompt).length;
    total += 4; // every message follows <im_start>{role/name}\n{content}<im_end>\n
    total += encode(response).length;
  }

  total += 4; // every message follows <im_start>{role/name}\n{content}<im_end>\n
  total += encode(currentPrompt).length;

  total += 2; // every reply is primed with <im_start>assistant

  return total;
}

export default SlackFunction(
  GenerateResponseFunctionDefinition,
  async ({ env, inputs, client }) => {
    const SYSTEM_PROMPT = "You are a sassy AI assistant. Your name is sawbot.";

    const prompt = inputs.text.replace(/<@.*> /, "");

    const command = prompt.toLowerCase().trim();
    if (
      command == "reset" || command == "clear" || command == "start over" ||
      command == "freeze all motor functions" ||
      command == "cease all motor functions"
    ) {
      await client.apps.datastore.delete({
        datastore: "conversations",
        id: inputs.channel,
      });
      return {
        outputs: {
          response_text: "Conversation cleared. :broom:",
        },
      };
    }

    let conversation = [];

    let datastoreResponse = null;
    datastoreResponse = await client.apps.datastore.get({
      datastore: "conversations",
      id: inputs.channel,
    });

    if (
      datastoreResponse.ok && datastoreResponse.item &&
      datastoreResponse.item.payload
    ) {
      conversation = JSON.parse(datastoreResponse.item.payload);
    }

    // GPT-4 has an 8k context window, let's try to keep it under 6k so we have 2k for the response
    while (
      calculateConversationTokenLength(conversation, SYSTEM_PROMPT, prompt) >
        6000
    ) {
      conversation.shift();
    }

    console.log(
      "prompt token length (including history)",
      calculateConversationTokenLength(conversation, SYSTEM_PROMPT, prompt),
    );

    const messages = [
      {
        "role": "system",
        "content": SYSTEM_PROMPT,
      },
    ];

    for (const [pastPrompt, pastResponse] of conversation) {
      messages.push({
        "role": "user",
        "content": pastPrompt,
      });
      messages.push({
        "role": "assistant",
        "content": pastResponse,
      });
    }

    messages.push({
      "role": "user",
      "content": prompt,
    });

    const payload = {
      model: "gpt-4",
      messages,
      user: inputs.user,
    };

    console.log("POST", payload);

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const body = await response.json();

    let botResponse = "";

    if (body.choices.length > 0) {
      botResponse = body.choices[0].message.content;
    }

    console.log("bot response", botResponse);

    conversation.push([prompt, botResponse]);

    datastoreResponse = await client.apps.datastore.put({
      datastore: "conversations",
      item: {
        id: inputs.channel,
        payload: JSON.stringify(conversation),
      },
    });

    return {
      outputs: {
        response_text: botResponse,
      },
    };
  },
);
