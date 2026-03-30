import {
    createOpenAICompatible,
    OpenAICompatibleProvider,
    OpenAICompatibleProviderSettings,
} from '@ai-sdk/openai-compatible';

export type LlamaCppProvider = OpenAICompatibleProvider;

export type LlamaCppProviderSettings = Omit<
    OpenAICompatibleProviderSettings,
    'name' | 'baseURL'
> & {
    /**
     * Base URL for the llama.cpp API calls.
     */
    baseURL?: string;
};

/**
 * llama-server の timings プロパティから usage の使用量を復元する fetch ストリームラッパーを作成します。
 * 他のプロバイダ等を使う場合でも、この fetch を噛ませることで usage が取得できるようになります。
 */
export function createLlamaCppFetch(
    baseFetch: typeof fetch = fetch
): typeof fetch {
    return async (input, init) => {
        const response = await baseFetch(input, init);
        const contentType = response.headers.get('content-type') ?? '';

        // 1. ストリーミングレスポンス (text/event-stream) のフック
        if (response.body && contentType.includes('text/event-stream')) {
            let buffer = '';
            const decoder = new TextDecoder();
            const encoder = new TextEncoder();

            const transformStream = new TransformStream({
                transform(chunk, controller) {
                    buffer += decoder.decode(chunk, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() ?? ''; // 最後の不完全な行を保持

                    for (let line of lines) {
                        line = line.replace(/\r$/, ''); // \r を除去 (SSE 仕様へのより堅牢な対応)
                        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                            try {
                                const payloadText = line.slice(6);
                                const data = JSON.parse(payloadText);
                                
                                // timings から usage へ変換して注入
                                if (data?.timings && !data?.usage) {
                                    // OpenAI 仕様に合わせて choices が空配列で usage だけを持つ別チャンクを生成
                                    const usageChunk = {
                                        id: data.id,
                                        object: data.object,
                                        created: data.created,
                                        model: data.model,
                                        choices: [],
                                        usage: {
                                            prompt_tokens: data.timings.prompt_n || 0,
                                            completion_tokens: data.timings.predicted_n || 0,
                                            total_tokens: (data.timings.prompt_n || 0) + (data.timings.predicted_n || 0),
                                            prompt_tokens_details: {
                                                cached_tokens: data.timings.cache_n || 0
                                            }
                                        }
                                    };

                                    // 元のデータチャンクはそのまま流す（\n\n でイベントを区切るため手動で \n を1つ足す）
                                    controller.enqueue(encoder.encode(line + '\n\n'));
                                    
                                    // 追加で usage 専用のチャンクを流す（直後の改行が元のストリームロジックで足される）
                                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(usageChunk)}\n`));
                                    continue;
                                }
                            } catch (e) {
                                // JSON パースに失敗した場合は無視してそのままバイパス
                            }
                        }
                        controller.enqueue(encoder.encode(line + '\n'));
                    }
                },
                flush(controller) {
                    if (buffer) controller.enqueue(encoder.encode(buffer));
                },
            });

            return new Response(response.body.pipeThrough(transformStream), {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
            });
        }

        // 2. 非ストリーミングレスポンス (application/json) のフック
        if (contentType.includes('application/json')) {
            const text = await response.text();
            try {
                const data = JSON.parse(text);
                if (data?.timings && !data?.usage) {
                    data.usage = {
                        prompt_tokens: data.timings.prompt_n || 0,
                        completion_tokens: data.timings.predicted_n || 0,
                        total_tokens: (data.timings.prompt_n || 0) + (data.timings.predicted_n || 0),
                    };
                    return new Response(JSON.stringify(data), {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers,
                    });
                }
            } catch (e) {
                // パースエラー時はそのまま無視
            }
            return new Response(text, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
            });
        }

        return response;
    };
}

/**
 * Create a llama.cpp provider instance.
 */
export function createLlamaCpp(
    options: LlamaCppProviderSettings = {},
): LlamaCppProvider {
    const { baseURL, fetch: userFetch, ...rest } = options;

    return createOpenAICompatible({
        name: 'llama-cpp',
        baseURL: baseURL ?? 'http://127.0.0.1:8080/v1',
        fetch: createLlamaCppFetch(userFetch),
        ...rest,
    });
}

/**
 * Default llama.cpp provider instance.
 */
export const llamaCpp = createLlamaCpp();
