# Hallucination Patterns in Code Q&A Systems

## What is Hallucination?

**Hallucination** occurs when an LLM makes claims not supported by the retrieved evidence. In code Q&A, this is particularly dangerous because:

1. Code is precise - a wrong function name or line number breaks everything
2. Users trust the system - they'll copy-paste hallucinated code
3. Hallucinations sound confident - LLMs don't express uncertainty when making things up

---

## Common Hallucination Patterns (Real Examples)

### Pattern 1: Line Number Drift

**What the LLM says:**
```
The caching logic is implemented in lines 150-180 of cache.ts, where the TTL
is set to 3600 seconds and Redis is configured [Source 1].
```

**What Source 1 actually contains:**
- File: `cache.ts:45-60` (NOT 150-180)
- Contains: Interface definition for `CacheConfig`
- Does NOT mention: TTL values, Redis configuration, or actual caching logic

**Why it happens:** LLM sees "cache" in the retrieved chunk and generates plausible-sounding details, but the specific line numbers and implementation details are invented.

---

### Pattern 2: Function Name Invention

**What the LLM says:**
```
The system uses the `validateUserPermissions()` function to check access rights
before executing queries [Source 2].
```

**What Source 2 actually contains:**
- File: `query-handler.ts:20-35`
- Contains: A generic query execution function
- Does NOT contain: Any function named `validateUserPermissions()`
- Does NOT mention: Permission checking at all

**Why it happens:** LLM knows that permission checking is a common pattern in query systems, so it invents a plausible function name.

---

### Pattern 3: Confident Speculation

**What the LLM says:**
```
The retry logic uses exponential backoff with a maximum of 5 retries, starting
at 100ms and doubling each time. This is implemented in the connection pool
manager [Source 3].
```

**What Source 3 actually contains:**
- File: `connection.ts:10-25`
- Contains: Basic connection initialization code
- Does NOT mention: Retry logic, exponential backoff, or specific timing values

**Why it happens:** LLM recognizes the code SHOULD have retry logic (best practice) and fills in details based on common patterns, not actual evidence.

---

### Pattern 4: Cross-File Confusion

**What the LLM says:**
```
The `parseQuery()` function in parser.ts validates the input and then calls
`executeQuery()` from executor.ts to run the query [Source 1, Source 2].
```

**What the sources actually contain:**
- Source 1: `parser.ts:30-45` - Defines a completely different parsing function
- Source 2: `executor.ts:100-115` - Contains query execution, but NOT called by parser.ts
- Reality: These files don't actually call each other

**Why it happens:** LLM sees both files in context and invents a plausible relationship between them.

---

### Pattern 5: Citation Misattribution

**What the LLM says:**
```
The error handling wraps exceptions in a custom ErrorWrapper class [Source 2]
and logs them using the Logger utility [Source 3].
```

**What the sources actually say:**
- Source 2: Mentions error handling but not ErrorWrapper (wrong citation)
- Source 3: Shows logging code but not in an error context (wrong citation)
- Reality: The answer might be correct, but the citations point to the wrong evidence

**Why it happens:** LLM generates the answer first, then tries to match citations afterward.

---

### Pattern 6: The "Plausible Implementation" Hallucination

**What the LLM says:**
```
The code uses a bloom filter to quickly check if an item might be in the cache
before doing a full lookup, reducing unnecessary database queries [Source 1].
```

**What Source 1 actually contains:**
- File: `cache.ts:70-90`
- Contains: Simple cache lookup with `Map.has()`
- Does NOT use: Bloom filters (not even mentioned)

**Why it happens:** Bloom filters are a sophisticated caching technique. LLM knows about them and suggests they "should" be used, even though they aren't.

---

### Pattern 7: The "Filling in the Gaps" Hallucination

**Query:** "What happens if the database connection fails?"

**What the LLM says:**
```
If the database connection fails, the system catches the error, logs it to the
error tracking service (Sentry), notifies the operations team via Slack, and
returns a 503 Service Unavailable response to the client [Source 1].
```

**What Source 1 actually contains:**
- File: `db-connector.ts:45-55`
- Contains: `try { connect() } catch (err) { console.error(err) }`
- Does NOT mention: Sentry, Slack, 503 responses, or any sophisticated error handling

**Why it happens:** LLM sees basic error handling and fills in what a "production-ready" system SHOULD do.

---

## Why Hallucinations Are Hard to Detect

1. **They sound plausible** - LLMs are trained on code, so invented code looks realistic
2. **They match user expectations** - Users asking about caching expect Redis and TTLs
3. **They cite real files** - The citations exist, just not the claims made about them
4. **They use correct terminology** - Function names, patterns, and concepts are technically valid
5. **They're confident** - No hedging language like "might" or "possibly"

---

## Stage 2 Goal: Build Validation to Catch These

In Stage 2, we'll build a `CitationValidator` that:

1. **Extracts claims** from the LLM's answer text
2. **Checks file/line references** against actual retrieved chunks
3. **Validates code quotes** match the actual code
4. **Detects function name mismatches** (mentioned vs actually in code)
5. **Flags unsupported claims** that aren't backed by evidence

This is the "shield" against hallucinations.

---

## Key Insight

**Hallucinations aren't bugs - they're features of how LLMs work.** LLMs are trained to generate plausible continuations of text. When evidence is thin, they fill in gaps with "what code usually looks like."

Our job as engineers is to:
- Design prompts that reduce hallucinations
- Build validation that detects them
- Fail gracefully when evidence is insufficient

This is what separates a toy demo from a production code Q&A system.
