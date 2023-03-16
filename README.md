# sawbot

Slack next-gen Platform app for conversing with ChatGPT using functions, triggers, and workflows

## Configuration

Set your OpenAI key to `OPENAI_API_KEY`:
```
slack env add OPENAI_API_KEY your_key_goes_here
```

If you're testing locally, copy `env.sample.txt` to `.env` and put it in there.

## Triggers

There are two triggers, Message Posted trigger and App Mentioned trigger.

Message Posted trigger will trigger on all messages posted to the channel specified in the trigger

App Mentioned trigger will trigger when the app is @mention in a channel specified in the trigger

## Retention

The bot retains conversation history within the same channel. To clear its history and start from nothing:

@sawbot clear all motor functions

## License

MIT