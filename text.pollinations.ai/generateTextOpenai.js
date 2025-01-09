import { AzureOpenAI } from 'openai';
import dotenv from 'dotenv';
import { imageGenerationPrompt } from './pollinationsPrompt.js';
import { searchToolDefinition, performWebSearch } from './tools/searchTool.js';
import { performWebScrape, scrapeToolDefinition } from './tools/scrapeTool.js';

dotenv.config();

const openai = new AzureOpenAI({
    apiVersion: process.env.AZURE_OPENAI_API_VERSION,
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiKey: process.env.AZURE_OPENAI_API_KEY,
});

function countMessageCharacters(messages) {
    return messages.reduce((total, message) => {
        if (typeof message.content === 'string') {
            return total + message.content.length;
        }
        if (Array.isArray(message.content)) {
            return total + message.content.reduce((sum, part) => {
                if (part.type === 'text') {
                    return sum + part.text.length;
                }
                return sum;
            }, 0);
        }
        return total;
    }, 0);
}

export async function generateText(messages, options, performSearch = false) {
    const MAX_CHARS = 48000;
    const totalChars = countMessageCharacters(messages);
    
    if (totalChars > MAX_CHARS) {
        console.error(`!!!!!!!!!!! Input text exceeds maximum length of ${MAX_CHARS} characters (current: ${totalChars}) !!!!!!!!!!!`);
        throw new Error(`Input text exceeds maximum length of ${MAX_CHARS} characters (current: ${totalChars})`);
    }

    if (!hasSystemMessage(messages)) {
        const systemContent = options.jsonMode
            ? 'Respond in simple json format'
            : 'You are a helpful assistant.\n\n' + imageGenerationPrompt();
        messages = [{ role: 'system', content: systemContent }, ...messages];
    } else if (options.jsonMode) {
        const systemMessage = messages.find(m => m.role === 'system');
        if (!containsJSON(systemMessage.content)) {
            systemMessage.content += ' Respond with JSON.';
        }
    }

    // console.log("calling openai with messages", messages);

    let completion;
    let responseMessage;
    let attempts = 0;
    const maxAttempts = 3;

    do {
        try {
            completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages,
                seed: options.seed + attempts,
                response_format: options.jsonMode ? { type: 'json_object' } : undefined,
                tools: performSearch ? [searchToolDefinition, scrapeToolDefinition] : undefined,
                tool_choice: performSearch ? "auto" : undefined,
                // max_tokens: 1024,
            });
            responseMessage = completion.choices[0].message;
        } catch (error) {
            if (error.error?.code === 'content_filter') {
                // Return a user-friendly error message for content filter violations
                return {
                    error: true,
                    message: "Your request was flagged by content filters. Please modify your prompt to avoid sensitive content.",
                    details: error.error.innererror?.content_filter_result || error.error
                };
            }
            throw error; // Re-throw other errors
        }
        attempts++;
    } while ((!responseMessage.content || responseMessage.content === '') && attempts < maxAttempts);

    while (responseMessage.tool_calls) {
        const toolCalls = responseMessage.tool_calls;
        messages.push(responseMessage);

        for (const toolCall of toolCalls) {
            if (toolCall.function.name === 'web_search') {
                const args = JSON.parse(toolCall.function.arguments);
                const searchResponse = await performWebSearch(args);
                
                messages.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: toolCall.function.name,
                    content: searchResponse
                });
            } else if (toolCall.function.name === 'web_scrape') {
                const args = JSON.parse(toolCall.function.arguments);
                const scrapeResponse = await performWebScrape(args);
                
                messages.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: toolCall.function.name,
                    content: scrapeResponse
                });
            }
        }

        // Get next response after tool use
        attempts = 0;
        do {
            try {
                completion = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages,
                    seed: options.seed + attempts,
                    response_format: options.jsonMode ? { type: 'json_object' } : undefined,
                    tools: [searchToolDefinition, scrapeToolDefinition],
                    tool_choice: "auto",
                    max_tokens: 4096,
                });
                responseMessage = completion.choices[0].message;
            } catch (error) {
                if (error.error?.code === 'content_filter') {
                    // Return a user-friendly error message for content filter violations
                    return {
                        error: true,
                        message: "Your request was flagged by content filters. Please modify your prompt to avoid sensitive content.",
                        details: error.error.innererror?.content_filter_result || error.error
                    };
                }
                throw error; // Re-throw other errors
            }
            attempts++;
        } while ((!responseMessage.content || responseMessage.content === '') && attempts < maxAttempts);
    }

    return responseMessage.content;
}

function hasSystemMessage(messages) {
    return messages.some(message => message.role === 'system');
}

function containsJSON(text) {
    return text.toLowerCase().includes('json');
}
