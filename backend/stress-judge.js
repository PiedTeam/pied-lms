// Usage:
// node stress-judge.js single
// node stress-judge.js stress --concurrency 20 --duration 60
// node stress-judge.js stress --concurrency 50 --duration 30 --timeoutMs 7000

"use strict";

const DEFAULT_URL = "http://localhost:5211/compiler/judge";
const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_CONCURRENCY = 10;
const DEFAULT_DURATION_SECONDS = 30;
const DEFAULT_WEIGHTS = {
    AC: 0.6,
    CE: 0.1,
    RE: 0.1,
    TLE: 0.15,
    WA: 0.05,
};

const ERROR_CODE_TO_CATEGORY = {
    COMPILE_ERROR: "CE",
    RUNTIME_ERROR: "RE",
    SEGMENTATION_FAULT: "RE",
    FLOATING_POINT_EXCEPTION: "RE",
    TIME_LIMIT_EXCEEDED: "TLE",
    MEMORY_LIMIT_EXCEEDED: "MLE",
    OUTPUT_LIMIT_EXCEEDED: "OLE",
    STDERR_LIMIT_EXCEEDED: "OLE",
    INVALID_REQUEST: "INVALID",
    RATE_LIMIT_EXCEEDED: "HTTP_ERROR",
    SERVER_BUSY: "HTTP_ERROR",
};

const PAYLOADS = [
    {
        name: "baseline_accepted",
        expectedCategory: "AC",
        requestBody: {
            code: '#include <stdio.h>\nint main(){printf("OK"); return 0;}',
            testCases: [{ input: "", expectedOutput: "OK" }],
            timeLimit: 1000,
            memoryLimit: 128,
            optimizationLevel: 2,
        },
    },
    {
        name: "compile_error_missing_semicolon",
        expectedCategory: "CE",
        requestBody: {
            code: '#include <stdio.h>\nint main(){int a; scanf("%d", &a); printf("%d", a*2); return 0}',
            testCases: [{ input: "5", expectedOutput: "10" }],
            timeLimit: 1000,
            memoryLimit: 128,
            optimizationLevel: 2,
        },
    },
    {
        name: "runtime_error_divide_by_zero",
        expectedCategory: "RE",
        requestBody: {
            code: "#include <signal.h>\nint main(){raise(SIGFPE); return 0;}",
            testCases: [{ input: "", expectedOutput: "" }],
            timeLimit: 1000,
            memoryLimit: 128,
            optimizationLevel: 2,
        },
    },
    {
        name: "runtime_error_segfault",
        expectedCategory: "RE",
        requestBody: {
            code: '#include <stdio.h>\nint main(){int *p = NULL; *p = 5; printf("%d", *p); return 0;}',
            testCases: [{ input: "", expectedOutput: "5" }],
            timeLimit: 1000,
            memoryLimit: 128,
            optimizationLevel: 2,
        },
    },
    {
        name: "time_limit_infinite_loop",
        expectedCategory: "TLE",
        requestBody: {
            code: "int main(){for(;;){} return 0;}",
            testCases: [{ input: "", expectedOutput: "" }],
            timeLimit: 500,
            memoryLimit: 128,
            optimizationLevel: 2,
        },
    },
    {
        name: "input_blocking",
        expectedCategory: "TLE",
        requestBody: {
            code: '#include <stdio.h>\nint main(){int a; while(scanf("%d", &a)!=1){} printf("%d", a); return 0;}',
            testCases: [{ input: "", expectedOutput: "" }],
            timeLimit: 800,
            memoryLimit: 128,
            optimizationLevel: 2,
        },
    },
    {
        name: "wrong_answer_logic_error",
        expectedCategory: "WA",
        requestBody: {
            code: '#include <stdio.h>\nint main(){int a; if(scanf("%d", &a)!=1) return 0; printf("%d", a*3); return 0;}',
            testCases: [{ input: "5", expectedOutput: "10" }],
            timeLimit: 1000,
            memoryLimit: 128,
            optimizationLevel: 2,
        },
    },
    {
        name: "output_limit_exceeded",
        expectedCategory: "OLE",
        requestBody: {
            code: "#include <stdio.h>\nint main(){for(int i=0;i<2000000;i++){putchar('a');} return 0;}",
            testCases: [{ input: "", expectedOutput: "" }],
            timeLimit: 1000,
            memoryLimit: 128,
            optimizationLevel: 2,
        },
    },
    {
        name: "memory_stress_low_limit",
        expectedCategory: "MLE",
        requestBody: {
            code: "#include <stdlib.h>\nint main(){size_t n=1024UL*1024UL*512UL; char *p=malloc(n); if(!p) return 1; for(size_t i=0;i<n;i+=4096){p[i]=1;} return 0;}",
            testCases: [{ input: "", expectedOutput: "" }],
            timeLimit: 1000,
            memoryLimit: 128,
            optimizationLevel: 2,
        },
    },
    {
        name: "whitespace_sensitivity",
        expectedCategory: "WA",
        requestBody: {
            code: '#include <stdio.h>\nint main(){printf("Hello  World"); return 0;}',
            testCases: [{ input: "", expectedOutput: "Hello World" }],
            timeLimit: 1000,
            memoryLimit: 128,
            optimizationLevel: 2,
        },
    },
    {
        name: "large_integer_overflow",
        expectedCategory: "WA",
        requestBody: {
            code: '#include <stdio.h>\nint main(){int a; if(scanf("%d", &a)!=1) return 0; printf("%d", a*2); return 0;}',
            testCases: [{ input: "2147483647", expectedOutput: "4294967294" }],
            timeLimit: 1000,
            memoryLimit: 128,
            optimizationLevel: 2,
        },
    },
    {
        name: "multiple_testcases_mix",
        expectedCategory: "WA",
        requestBody: {
            code: '#include <stdio.h>\nint main(){int a; if(scanf("%d", &a)!=1) return 0; printf("%d", a*2); return 0;}',
            testCases: [
                { input: "2", expectedOutput: "4" },
                { input: "3", expectedOutput: "8" },
            ],
            timeLimit: 1000,
            memoryLimit: 128,
            optimizationLevel: 2,
        },
    },
];

function parseArgs(argv) {
    const args = { _: [] };
    for (let i = 2; i < argv.length; i += 1) {
        const arg = argv[i];
        if (arg.startsWith("--")) {
            const key = arg.slice(2);
            const value = argv[i + 1];
            args[key] = value;
            i += 1;
        } else {
            args._.push(arg);
        }
    }
    return args;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function nowMs() {
    return Date.now();
}

function percentile(values, p) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

function truncate(text, maxLen) {
    if (!text) return "";
    return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
}

function buildCategoryFromResponse(status, envelope) {
    if (status !== 200) return "HTTP_ERROR";
    if (!envelope || typeof envelope !== "object") return "HTTP_ERROR";

    const errorCode =
        envelope.errorCode || (envelope.data && envelope.data.errorCode);
    if (envelope.success === false && errorCode) {
        return ERROR_CODE_TO_CATEGORY[errorCode] || "RE";
    }

    if (envelope.data && Array.isArray(envelope.data.results)) {
        const failed = envelope.data.results.filter(
            (item) => item && item.passed === false,
        );
        if (failed.length > 0) {
            for (const item of failed) {
                if (item.errorCode && ERROR_CODE_TO_CATEGORY[item.errorCode]) {
                    return ERROR_CODE_TO_CATEGORY[item.errorCode];
                }
            }
            return "WA";
        }
    }

    return "AC";
}

function pickWeightedPayload(weights) {
    const categories = Object.keys(weights);
    const total = categories.reduce((sum, key) => sum + weights[key], 0);
    const r = Math.random() * total;
    let acc = 0;
    let picked = categories[0];
    for (const key of categories) {
        acc += weights[key];
        if (r <= acc) {
            picked = key;
            break;
        }
    }

    const candidates = PAYLOADS.filter((p) => p.expectedCategory === picked);
    if (candidates.length === 0) {
        return PAYLOADS[Math.floor(Math.random() * PAYLOADS.length)];
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
}

function parseWeights(input) {
    if (!input) return DEFAULT_WEIGHTS;
    const parts = input.split(",");
    const weights = {};
    for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const [key, rawValue] = trimmed.split(":");
        const value = Number(rawValue);
        if (!key || Number.isNaN(value)) continue;
        weights[key.trim().toUpperCase()] = value / 100;
    }
    const hasAny = Object.keys(weights).length > 0;
    return hasAny ? weights : DEFAULT_WEIGHTS;
}

async function fetchWithTimeout(url, body, timeoutMs, retries) {
    const start = nowMs();
    let attempt = 0;
    let lastError = null;

    while (attempt <= retries) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            const text = await response.text();
            let json = null;
            try {
                json = text ? JSON.parse(text) : null;
            } catch {
                json = null;
            }

            clearTimeout(timeoutId);

            if (
                (response.status === 502 ||
                    response.status === 503 ||
                    response.status === 504) &&
                attempt < retries
            ) {
                const jitter = Math.floor(Math.random() * 200);
                await sleep(100 + jitter);
                attempt += 1;
                continue;
            }

            return {
                ok: true,
                status: response.status,
                bodyText: text,
                json,
                latencyMs: nowMs() - start,
            };
        } catch (error) {
            lastError = error;
            const message = error && error.message ? error.message : "";
            const isTimeout = error && error.name === "AbortError";
            const transient =
                message.includes("ECONNRESET") ||
                message.includes("socket") ||
                message.includes("fetch failed");

            clearTimeout(timeoutId);

            if (isTimeout || !transient || attempt === retries) {
                return {
                    ok: false,
                    status: 0,
                    bodyText: isTimeout ? "Request timeout" : message,
                    json: null,
                    latencyMs: nowMs() - start,
                };
            }

            const jitter = Math.floor(Math.random() * 200);
            await sleep(100 + jitter);
            attempt += 1;
        }
    }

    return {
        ok: false,
        status: 0,
        bodyText: lastError ? String(lastError) : "unknown error",
        json: null,
        latencyMs: nowMs() - start,
    };
}

async function runSingleMode(url, timeoutMs) {
    const rows = [];
    for (const payload of PAYLOADS) {
        const result = await executeRequest(url, payload, timeoutMs, 2);
        rows.push(result);
    }

    printSingleSummary(rows);
}

async function executeRequest(url, payload, timeoutMs, retries) {
    const response = await fetchWithTimeout(
        url,
        payload.requestBody,
        timeoutMs,
        retries,
    );
    const category = buildCategoryFromResponse(response.status, response.json);
    const status = response.status || 0;
    const record = {
        name: payload.name,
        expectedCategory: payload.expectedCategory,
        status,
        category,
        latencyMs: response.latencyMs,
        bodySnippet: truncate(response.bodyText, 300),
        success: response.ok,
    };

    if (!response.ok || status >= 400) {
        logFailure(record);
    } else if (category !== "AC" && category !== payload.expectedCategory) {
        logFailure(record);
    }

    return record;
}

function logFailure(record) {
    const snippet = record.bodySnippet ? ` | body: ${record.bodySnippet}` : "";
    console.log(
        `[FAIL] ${record.name} status=${record.status} category=${record.category} latencyMs=${record.latencyMs}${snippet}`,
    );
}

function printSingleSummary(rows) {
    const header = ["Name", "Expected", "Actual", "Status", "LatencyMs"];
    console.log(header.join("\t"));
    for (const row of rows) {
        console.log(
            [
                row.name,
                row.expectedCategory,
                row.category,
                row.status,
                row.latencyMs,
            ].join("\t"),
        );
    }

    const latencies = rows.map((r) => r.latencyMs);
    console.log("");
    console.log(`Totals: ${rows.length}`);
    console.log(
        `p50=${percentile(latencies, 50)}ms p95=${percentile(latencies, 95)}ms p99=${percentile(latencies, 99)}ms`,
    );
}

async function runStressMode(
    url,
    concurrency,
    durationSeconds,
    timeoutMs,
    weights,
) {
    const endTime = nowMs() + durationSeconds * 1000;
    const results = [];
    let totalRequests = 0;
    let timeouts = 0;

    async function worker() {
        while (nowMs() < endTime) {
            const payload = pickWeightedPayload(weights);
            const response = await executeRequest(url, payload, timeoutMs, 2);
            results.push(response);
            totalRequests += 1;
            if (!response.success && response.status === 0) {
                timeouts += 1;
            }
        }
    }

    const workers = [];
    for (let i = 0; i < concurrency; i += 1) {
        workers.push(worker());
    }

    await Promise.all(workers);
    printStressSummary(results, totalRequests, durationSeconds, timeouts);
}

function printStressSummary(results, totalRequests, durationSeconds, timeouts) {
    const latencies = results.map((r) => r.latencyMs);
    const categories = {};
    const statuses = {};
    for (const r of results) {
        categories[r.category] = (categories[r.category] || 0) + 1;
        statuses[r.status] = (statuses[r.status] || 0) + 1;
    }

    const qps = totalRequests / durationSeconds;
    const successCount = categories.AC || 0;
    const successRate =
        totalRequests === 0 ? 0 : (successCount / totalRequests) * 100;

    const slowest = [...results]
        .sort((a, b) => b.latencyMs - a.latencyMs)
        .slice(0, 5)
        .map((r) => `${r.name} (${r.latencyMs}ms, ${r.status}, ${r.category})`);

    console.log("");
    console.log("Final Report");
    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Duration: ${durationSeconds}s`);
    console.log(`QPS: ${qps.toFixed(2)}`);
    console.log(`Success Rate: ${successRate.toFixed(2)}%`);
    console.log(`Timeouts: ${timeouts}`);
    console.log(
        `Latency p50=${percentile(latencies, 50)}ms p95=${percentile(latencies, 95)}ms p99=${percentile(latencies, 99)}ms`,
    );
    console.log("");
    console.log("Counts by Category:");
    for (const key of Object.keys(categories).sort()) {
        console.log(`  ${key}: ${categories[key]}`);
    }
    console.log("");
    console.log("Counts by HTTP Status:");
    for (const key of Object.keys(statuses).sort(
        (a, b) => Number(a) - Number(b),
    )) {
        console.log(`  ${key}: ${statuses[key]}`);
    }
    console.log("");
    console.log("Top 5 Slowest Samples:");
    for (const entry of slowest) {
        console.log(`  ${entry}`);
    }
}

async function main() {
    const args = parseArgs(process.argv);
    const mode = args._[0] || "single";
    const url = args.url || DEFAULT_URL;
    const timeoutMs = Number(args.timeoutMs || DEFAULT_TIMEOUT_MS);

    if (mode === "single") {
        await runSingleMode(url, timeoutMs);
        return;
    }

    if (mode === "stress") {
        const concurrency = Number(args.concurrency || DEFAULT_CONCURRENCY);
        const durationSeconds = Number(
            args.duration || DEFAULT_DURATION_SECONDS,
        );
        const weights = parseWeights(args.mix);
        await runStressMode(
            url,
            concurrency,
            durationSeconds,
            timeoutMs,
            weights,
        );
        return;
    }

    console.log('Unknown mode. Use "single" or "stress".');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
