# Identify By Features - Demo Test Scenarios

## Quick Reference: Models with Linked Features

| Model | Era | Country | Key Distinguishing Features |
|-------|-----|---------|----------------------------|
| 5014 | 1975-1987 | Japan | Dreadnought, Rosewood bridge, Orange/gold label |
| 5021 | 1970-1985 | Japan | Dreadnought, Rosewood bridge, Orange/gold label |
| 5022 | 1968-1975 | Japan | Dreadnought, Rosewood bridge, Orange/gold label |
| 5045 | 1993-1999 | Korea | Dreadnought, Blue/silver label |
| 5059 | 1970-1985 | Japan | Dreadnought, Rosewood bridge, Orange/gold label |
| DY-77 | 1972-1978 | Japan | Dreadnought, Ebony bridge, Ebony fingerboard, All Solid |
| DY70 | 1970+ | Japan | Dreadnought, Ebony bridge, All Solid |

---

## Test Scenario 1: Find the DY-77 (Yairi Premium Model)
**Expected Result:** DY-77 as top match with high confidence

**Select these features:**
1. Body Shape → **Dreadnought**
2. Bridge → **Ebony bridge**
3. Fingerboard → **Ebony**
4. Construction → **All Solid**
5. Electronics → **No Electronics**
6. Label → **Orange/gold label**

**Demo Talking Point:** "This combination of premium features - ebony bridge, ebony fingerboard, all-solid construction - narrows it down to the DY-77, a top-tier Yairi model from the early 1970s."

---

## Test Scenario 2: Korean 5045 (1990s Budget Model)
**Expected Result:** 5045 as top match

**Select these features:**
1. Body Shape → **Dreadnought**
2. Label → **Blue/silver label**
3. Fingerboard → **Rosewood**
4. Bridge → **Rosewood bridge**

**Demo Talking Point:** "The blue/silver label is the key identifier here - it immediately tells us this is a Korean-made guitar from the 1990s."

---

## Test Scenario 3: Classic Japanese 5021
**Expected Result:** Multiple Japanese models match, 5021 among top results

**Select these features:**
1. Body Shape → **Dreadnought**
2. Label → **Orange/gold label**
3. Bridge → **Rosewood bridge**
4. Fingerboard → **Rosewood**
5. Electronics → **No Electronics**

**Demo Talking Point:** "With these common Japanese-era features, we get several possible matches - all from the 1970s-80s Japanese production period. The user would need the serial number to narrow it down further."

---

## Test Scenario 4: "No Match" Scenario (Shows Submit Flow)
**Expected Result:** No models match → "Submit This Guitar" prompt appears

**Select these features:**
1. Body Shape → **Grand Auditorium** (not linked to any models yet)
2. Label → **Green label** (if available, or any uncommon combination)

**Demo Talking Point:** "When we can't find a match, the system invites the user to be the first to document this guitar - turning a dead-end into community contribution."

---

## Test Scenario 5: Differentiating Similar Models
**Expected Result:** DY70 vs DY-77 comparison

**First run with:**
1. Body Shape → **Dreadnought**
2. Bridge → **Ebony bridge**
3. Construction → **All Solid**

**Demo Talking Point:** "Both the DY70 and DY-77 share these premium features. The system shows both as matches. To differentiate, we'd need the fingerboard material - DY-77 specifically has ebony fingerboard, which is a required feature."

**Then add:**
4. Fingerboard → **Ebony**

**Result:** DY-77 should now rank higher or be the sole top match.

---

## Feature Categories Quick Reference

When demonstrating, walk through categories in this order for natural flow:

1. **Body Shape** - Most obvious visual identifier
2. **Label** - Inside the soundhole, tells the era immediately
3. **Bridge** - Rosewood vs Ebony is a quality indicator
4. **Fingerboard** - Another quality/era indicator
5. **Construction** - All Solid vs Laminate
6. **Electronics** - Modern vs vintage differentiation

---

## Serial Lookup Demo Scenarios

Pair with these serial numbers for a complete demo:

| Serial | Type | Expected Result |
|--------|------|-----------------|
| E25092356 | Modern China | September 2025, 95% confidence |
| 75466 | Modern Yairi | ~2024, based on verified anchor points |
| 51708 | Legacy Yairi | Medium confidence, sequential dating |

---

## Tips for Live Demo

1. **Start with DY-77 scenario** - Shows the system working perfectly with a premium model
2. **Show the Korean 5045** - Demonstrates era/country differentiation via label color
3. **Show "no match" scenario** - Turns potential failure into user engagement opportunity
4. **End with serial lookup** - Complete the identification story with E25092356 for definitive dating

**Key Message:** "Between serial lookup and feature identification, we cover both scenarios - users who have a serial number, and those who don't."
