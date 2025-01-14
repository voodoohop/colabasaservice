import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import crypto from 'crypto';
import debug from 'debug';
import { promises as fs } from 'fs';
import path from 'path';
import generateTextMistral from './generateTextMistral.js';
import generateTextKarma from './generateTextKarma.js';
import generateTextClaude from './generateTextClaude.js';
import wrapModelWithContext from './wrapModelWithContext.js';
import surSystemPrompt from './personas/sur.js';
import unityPrompt from './personas/unity.js';
import midijourneyPrompt from './personas/midijourney.js';
import rtistPrompt from './personas/rtist.js';
import rateLimit from 'express-rate-limit';
import PQueue from 'p-queue';
import generateTextCommandR from './generateTextCommandR.js';
import sleep from 'await-sleep';
import { availableModels } from './availableModels.js';
import { generateText } from './generateTextOpenai.js';
import { generateTextWithSearch } from './generateTextSearch.js';
import { generateText as generateTextRoblox } from './generateTextOpenaiRoblox.js';
import evilPrompt from './personas/evil.js';
import generateTextHuggingface from './generateTextHuggingface.js';
import generateTextOptiLLM from './generateTextOptiLLM.js';
import { generateTextOpenRouter } from './generateTextOpenRouter.js';
import { generateDeepseek } from './generateDeepseek.js';
import { generateTextScaleway } from './generateTextScaleway.js';
import { sendToAnalytics } from './sendToAnalytics.js';
import { setupFeedEndpoint, sendToFeedListeners } from './feed.js';
import { getFromCache, setInCache, createHashKey } from './cache.js';

const BANNED_PHRASES = [
    "600-800 words"
];

const WHITELISTED_DOMAINS = [
    'pollinations.ai',
    'thot',
    'ai-ministries.com'
];

const blockedIPs = new Set();

async function blockIP(ip) {
    // Only proceed if IP isn't already blocked
    if (!blockedIPs.has(ip)) {
        blockedIPs.add(ip);
        log('IP blocked:', ip);
        
        try {
            // Append IP to log file with newline
            await fs.appendFile(BLOCKED_IPS_LOG, `${ip}\n`, 'utf8');
        } catch (error) {
            errorLog('Failed to write blocked IP to log file:', error);
        }
    }
}

function isIPBlocked(ip) {
    return blockedIPs.has(ip);
}

async function checkBannedPhrases(messages, ip) {
    const messagesString = JSON.stringify(messages).toLowerCase();
    for (const phrase of BANNED_PHRASES) {
        if (messagesString.includes(phrase.toLowerCase())) {
            await blockIP(ip);
            throw new Error(`Message contains banned phrase. IP has been blocked.`);
        }
    }
}

const app = express();

const log = debug('pollinations:server');
const errorLog = debug('pollinations:error');
const BLOCKED_IPS_LOG = path.join(process.cwd(), 'blocked_ips.txt');

// Load blocked IPs from file on startup
async function loadBlockedIPs() {
    try {
        const data = await fs.readFile(BLOCKED_IPS_LOG, 'utf8');
        const ips = data.split('\n').filter(ip => ip.trim());
        for (const ip of ips) {
            blockedIPs.add(ip.trim());
        }
        log(`Loaded ${blockedIPs.size} blocked IPs from file`);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            errorLog('Error loading blocked IPs:', error);
        }
    }
}

// Load blocked IPs before starting server
loadBlockedIPs().catch(error => {
    errorLog('Failed to load blocked IPs:', error);
});

// Middleware to block IPs
app.use((req, res, next) => {
    const ip = getIp(req);
    if (isIPBlocked(ip)) {
        return res.status(403).end();
    }
    next();
});

// Remove the custom JSON parsing middleware and use the standard bodyParser
app.use(bodyParser.json({ limit: '5mb' }));
app.use(cors());

// Rate limiting setup
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per windowMs
    message: {
        error: {
            type: 'rate_limit_error',
            message: 'Rate limit exceeded. Maximum 20 requests per minute.',
            suggestion: 'Please wait before making more requests.'
        }
    },
    skip: (req) => {
        const requestData = getRequestData(req);
        return requestData.isImagePollinationsReferrer || requestData.isRobloxReferrer;
    }
});

// Apply rate limiting to all routes
app.use(limiter);

// New route handler for root path
app.get('/', (req, res) => {
    res.redirect('https://sur.pollinations.ai');
});

// Create custom instances of Sur backed by Claude, Mistral, and Command-R
const surOpenai = wrapModelWithContext(surSystemPrompt, generateText);
const surMistral = wrapModelWithContext(surSystemPrompt, generateTextScaleway,"mistral");
// const surCommandR = wrapModelWithContext(surSystemPrompt, generateTextCommandR);
// Create custom instance of Unity backed by Mistral Large
const unityMistralLarge = wrapModelWithContext(unityPrompt, generateTextScaleway, "mistral");
// Create custom instance of Midijourney
const midijourney = wrapModelWithContext(midijourneyPrompt, generateText);
// Create custom instance of Rtist
const rtist = wrapModelWithContext(rtistPrompt, generateText);
// Create custom instance of Evil backed by Command-R
const evilCommandR = wrapModelWithContext(evilPrompt,  generateTextScaleway, "mistral");

app.set('trust proxy', true);

// Queue setup per IP address
const queues = new Map();

function getQueue(ip) {
    if (!queues.has(ip)) {
        queues.set(ip, new PQueue({ concurrency: 1 }));
    }
    return queues.get(ip);
}

// Function to get IP address
export function getIp(req) {
    const ip = req.headers["x-bb-ip"] || req.headers["x-nf-client-connection-ip"] || req.headers["x-real-ip"] || req.headers['x-forwarded-for'] || req.headers['referer'] || req.socket.remoteAddress;
    if (!ip) return null;
    const ipSegments = ip.split('.').slice(0, 4).join('.');
    // if (ipSegments === "128.116")
    //     throw new Error('Pollinations cloud credits exceeded. Please try again later.');
    return ipSegments;
}

// GET /models request handler
app.get('/models', (req, res) => {
    res.json(availableModels);
});

setupFeedEndpoint(app);

// Helper function to handle both GET and POST requests
async function handleRequest(req, res, requestData) {

    log('Request data: %o', requestData);
    console.log(`${requestData.model} ${requestData.referrer} `);

    try {
        const completion = await generateTextBasedOnModel(requestData.messages, requestData);
        const responseText = completion.choices[0].message.content;

        const cacheKey = createHashKey(requestData);
        setInCache(cacheKey, completion);
        log('Generated response', responseText);
        
        sendToFeedListeners(responseText, requestData, getIp(req));

        if (requestData.stream) {
            sendAsOpenAIStream(res, completion);
        } else {
            if (requestData.plaintTextResponse) {
                sendContentResponse(res, completion);
            } else {
                sendOpenAIResponse(res, completion);
            }
        }
    } catch (error) {
        sendErrorResponse(res, error, requestData);
    }
    // if (!shouldBypassDelay(req)) {
    //     await sleep(3000);
    // }
}

// Function to check if delay should be bypassed
function shouldBypassDelay(req) {
    const password = "BeesKnees".toLowerCase();
    
    // Helper function to safely check password
    const checkPassword = (input) => {
        return input && input.trim().toLowerCase() === password;
    };
    
    // Check query parameter
    if (checkPassword(req.query.code)) return true;
    // Check JSON body
    if (req.body && checkPassword(req.body.code)) return true;
    // Check bearer token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (checkPassword(token)) return true;
    }
    return false;
}

// Helper function for consistent error responses
function sendErrorResponse(res, error, requestData, statusCode = 500) {
    const errorResponse = {
        error: {
            message: error.message,
            status: statusCode,
            ip: getIp(res.req),
            timestamp: new Date().toISOString(),
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            details: {
                requestData: requestData,
                requestParameters: res.locals.requestData || {},
                prompt: res.locals.prompt,
                model: res.locals.model,
                errorType: error.name,
                errorCode: error.code
            }
        }
    };

    // Log detailed error information to stderr
    console.error('Error occurred:', JSON.stringify(errorResponse, null, 2));
    console.error('Stack trace:', error.stack);
    errorLog('Error:', error.message);

    res.status(statusCode).json(errorResponse);
}

// Helper function for consistent success responses
function sendOpenAIResponse(res, completion) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.json(completion);
}

function sendContentResponse(res, completion) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(completion.choices[0].message.content);
}

// Common function to handle request data
function getRequestData(req) {
    const query = req.query;
    const body = req.body || {};
    const data = { ...query, ...body };

    const jsonMode = data.jsonMode || 
                    (typeof data.json === 'string' && data.json.toLowerCase() === 'true') ||
                    (typeof data.json === 'boolean' && data.json === true) ||
                    data.response_format?.type === 'json_object';
                    
    const seed = data.seed ? parseInt(data.seed, 10) : null;
    const model = data.model || 'openai';
    const systemPrompt = data.system ? data.system : null;
    const temperature = data.temperature ? parseFloat(data.temperature) : undefined;
    // Try request body first (both spellings), then HTTP header (standard spelling)
    const referrer = req.headers.referer || data.referrer || data.referer || req.get('referrer') || req.get('referer') || 'undefined';
    const isImagePollinationsReferrer = WHITELISTED_DOMAINS.some(domain => referrer.toLowerCase().includes(domain));
    const isRobloxReferrer = referrer.toLowerCase().includes('roblox');
    const stream = data.stream || false; 

    const messages =  data.messages ||  [{ role: 'user', content: req.params[0] }];
    if (systemPrompt) {
        messages.unshift({ role: 'system', content: systemPrompt });
    }

    return {
        messages,
        jsonMode,
        seed,
        model,
        temperature,
        isImagePollinationsReferrer,
        isRobloxReferrer,
        referrer,
        stream
    };
}

// Helper function to process requests with queueing and caching logic
async function processRequest(req, res, requestData) {
    const ip = getIp(req);
    
    // Check for banned phrases first
    try {
        await checkBannedPhrases(requestData.messages, ip);
    } catch (error) {
        return sendErrorResponse(res, error, requestData, 403);
    }

    const cacheKey = createHashKey(requestData);

    // Check cache first
    const cachedResponse = getFromCache(cacheKey);
    if (cachedResponse) {
        log('Cache hit for key:', cacheKey);
        if (requestData.plaintTextResponse) {
            sendContentResponse(res, cachedResponse);
        } else {
            log('Cache hit for key:', cacheKey);
            if (requestData.stream) {
                sendAsOpenAIStream(res, cachedResponse);
            }
            else {
                sendOpenAIResponse(res, cachedResponse);
            }
        }
        return;
    }
    
    if (isIPBlocked(ip)) {
        errorLog('Blocked IP:', ip);
        const errorResponse = {
            error: 'Forbidden',
            status: 403,
            details: {
                blockedIp: ip,
                timestamp: new Date().toISOString()
            }
        };
        return res.status(403).json(errorResponse);
    }

    const queue = getQueue(ip);

    if (queue.size >= 60) {
        errorLog('Queue size limit exceeded for IP: %s', ip);
        const errorResponse = {
            error: 'Too Many Requests',
            status: 429,
            details: {
                queueSize: queue.size,
                maxQueueSize: 60,
                currentIp: ip,
                timestamp: new Date().toISOString(),
                retryAfter: '60', // Suggested retry after 60 seconds
                activeRequests: queue.pending,
                isPending: queue.isPaused,
                isPollinationsReferrer: requestData.isImagePollinationsReferrer,
                requestPath: req.path,
                requestMethod: req.method
            },
            message: 'Too many requests in queue. Please try again later.',
            suggestion: 'Consider reducing request frequency or waiting for your previous requests to complete.'
        };
        return res.status(429)
                 .set('Retry-After', '60')
                 .json(errorResponse);
    }
    
    const bypassQueue = requestData.isImagePollinationsReferrer;// || requestData.isRobloxReferrer;

    if (bypassQueue) {
        await handleRequest(req, res, requestData);
    } else {
        await getQueue(ip).add(() => handleRequest(req, res, requestData));
    }
}

// GET request handler
app.get('/*', async (req, res) => {
    const requestData = getRequestData(req);
    try {
        await processRequest(req, res, {...requestData, plaintTextResponse: true});
    } catch (error) {
        sendErrorResponse(res, error, requestData);
    }
});

// POST request handler
app.post('/', async (req, res) => {
    if (!req.body.messages || !Array.isArray(req.body.messages)) {
        console.log('Invalid messages array. Received:', req.body.messages);
        return res.status(400).send(`Invalid messages array. Received: ${req.body.messages}`);
    }

    const requestParams = getRequestData(req, true);
    try {
        await processRequest(req, res, {...requestParams, plaintTextResponse: true});
    } catch (error) {
        sendErrorResponse(res, error, requestParams);
    }
});

app.get('/openai/models', (req, res) => {
    const models = availableModels.map(model => ({
        id: model.name,
        object: "model",
        created: Date.now(),
        owned_by: model.name
    }));
    res.json({
        object: "list",
        data: models
    });
});

// POST /openai/* request handler
app.post('/openai*', async (req, res) => {

    if (!req.body.messages || !Array.isArray(req.body.messages)) {
        return sendErrorResponse(res, new Error('Invalid messages array'), req.body, 400);
    }

    const requestParams = getRequestData(req);
   
    try {
        await processRequest(req, res, requestParams);
    } catch (error) {
        sendErrorResponse(res, error, requestParams);
    }

})

function sendAsOpenAIStream(res, completion) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: completion.choices[0].message.content }, finish_reason: "stop", index: 0 }] })}\n\n`);
    res.write('data: [DONE]\n\n');  // Add the [DONE] message for OpenAI compatibility
    res.end();
}

async function generateTextBasedOnModel(messages, options) {
    const model = options.model || 'openai';
    log('Using model:', model);

    try {
        
        const modelHandlers = {
            'deepseek': () => generateDeepseek(messages, options),
            'mistral': () => generateTextScaleway(messages, options),
            'qwen-coder': () => generateTextScaleway(messages, options),
            'qwen': () => generateTextHuggingface(messages, { ...options, model }),
            'llama': () => generateTextScaleway(messages, { ...options, model }),
            'llamalight': () => generateTextOpenRouter(messages, { ...options, model: "nousresearch/hermes-2-pro-llama-3-8b" }),
            // 'karma': () => generateTextKarma(messages, options),
            'sur': () => surOpenai(messages, options),
            'sur-mistral': () => surMistral(messages, options),
            'unity': () => unityMistralLarge(messages, options),
            'midijourney': () => midijourney(messages, options),
            'rtist': () => rtist(messages, options),
            'searchgpt': () => generateTextWithSearch(messages, options),
            'evil': () => evilCommandR(messages, options),
            // 'roblox': () => generateTextRoblox(messages, options),
            'openai': () => generateText(messages, options),
        };

        const handler = modelHandlers[model] || (() => generateText(messages, options));
        const response = await handler();
        
        return response;
    } catch (error) {
        errorLog('Error in generateTextBasedOnModel:', error);
        throw error;
    }
}

function formatAsOpenAIResponse(response, requestParams) {
    const choices = [{
        "message": {
            "content": response,
            "role": "assistant"
        },
        "finish_reason": "stop",
        "index": 0,
        "logprobs": null
    }];

    const result = {
        "created": Date.now(),
        "id": crypto.randomUUID(),
        "model": requestParams.model,
        "object": isStream ? "chat.completion.chunk" : "chat.completion",
        "choices": choices
    };
    return result;
}
4
app.use((req, res, next) => {
    log(`Unhandled request: ${req.method} ${req.originalUrl}`);
    next();
});

export default app; // Add this line to export the app instance
