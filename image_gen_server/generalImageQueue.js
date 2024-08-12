import PQueue from 'p-queue';

export const BATCH_SIZE = 1; // Number of requests per batch

export const concurrency = 40; // Number of concurrent requests per bucket key

export const generalImageQueue = new PQueue({ concurrency });
