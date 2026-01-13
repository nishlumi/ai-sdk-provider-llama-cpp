# ai-sdk-provider-llama-cpp

The **llama.cpp** provider for the [AI SDK](https://sdk.vercel.ai/docs) contains language model support for the [llama.cpp](https://github.com/ggerganov/llama.cpp) server.

## Setup

The llama.cpp provider is available in the `ai-sdk-provider-llama-cpp` module. You can install it with:

```bash
npm install ai-sdk-provider-llama-cpp
```

### **Install in your target project**:

Or you can install it from the tarball:

  To use this provider in another local project, you can install the generated tarball:

  ```bash
  npm install /full/path/to/ai-sdk-provider-llama-cpp/ai-sdk-provider-llama-cpp-0.0.1.tgz
  ```
  For example, you can place ai-sdk-provider-llama-cpp-0.0.1.tgz in a folder called `localpkg` and run it.

## Setup of llama.cpp

Run llama.cpp as a server:

```cmd
llama-server.exe -hf [Model path] -p [Port]
```

You should be able to do this on Linux or macOS as well.

*Once the server is running, take note of the URL.*


## Provider Instance

You can import the default provider instance `llamaCpp` from `ai-sdk-provider-llama-cpp`:

```ts
import { llamaCpp } from 'ai-sdk-provider-llama-cpp';
```

If you need to provide a custom base URL or other options, you can use the `createLlamaCpp` function:

```ts
import { createLlamaCpp } from 'ai-sdk-provider-llama-cpp';

const llamaCpp = createLlamaCpp({
  baseURL: 'http://127.0.0.1:8080/v1',
});
```

## Language Models

The **llama.cpp** provider is based on the [OpenAI Compatible Provider](https://sdk.vercel.ai/providers/openai-compatible), so it supports the standard Chat Completion API.

You can use the `llamaCpp` provider to generate text:

* Model name is dummy.

```ts
import { llamaCpp } from 'ai-sdk-provider-llama-cpp';
import { generateText } from 'ai';

const { text } = await generateText({
  model: llamaCpp('llama-2-7b-chat'),
  prompt: 'Write a vegetarian lasagna recipe.',
});
```

Or stream text:

```ts
import { llamaCpp } from 'ai-sdk-provider-llama-cpp';
import { streamText } from 'ai';

const result = streamText({
  model: llamaCpp('llama-2-7b-chat'),
  prompt: 'Write a vegetarian lasagna recipe.',
});

for await (const textPart of result.textStream) {
  process.stdout.write(textPart);
}
```

## Documentation


## Local Build & Usage

To build this package locally:

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Build the package**:
    ```bash
    npm run build
    ```

3.  **Create a tarball** (optional):
    ```bash
    npm pack
    ```



