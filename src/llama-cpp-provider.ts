import {
    createOpenAICompatible,
    OpenAICompatibleProvider,
    OpenAICompatibleProviderSettings,
} from '@ai-sdk/openai-compatible';

export type LlamaCppProvider = OpenAICompatibleProvider;

export type LlamaCppProviderSettings = Pick<
    OpenAICompatibleProviderSettings,
    'apiKey' | 'headers' | 'fetch'
> & {
    baseURL?: string;
    /**
     * Whether the provider supports structured outputs in chat models.
     */
    supportsStructuredOutputs?: boolean;
};

/**
 * Create a llama.cpp provider instance.
 */
export function createLlamaCpp(
    options: LlamaCppProviderSettings = {},
): LlamaCppProvider {
    return createOpenAICompatible({
        name: 'llama-cpp',
        baseURL: options.baseURL ?? 'http://127.0.0.1:8080/v1',
        apiKey: options.apiKey,
        headers: options.headers,
        fetch: options.fetch,
        supportsStructuredOutputs: options.supportsStructuredOutputs,
    });
}

/**
 * Default llama.cpp provider instance.
 */
export const llamaCpp = createLlamaCpp();
