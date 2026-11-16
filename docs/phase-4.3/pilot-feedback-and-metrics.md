# RasoiIQ — Pilot Feedback Framework & Validation Metrics

**Milestone:** Phase 4.3 — Supervised Pilot Deployment  
**Audience:** Product Lead, Founder, Investors, QA Team  
**Data Integrity Policy:** Zero Fabricated Data. Automated test metrics are strictly demarcated from upcoming live household qualitative feedback.  

---

## 1. Quantitative Validation Metrics Framework

To measure the product's value proposition objectively during the upcoming 7-day supervised pilot, six core metrics have been established.

| Metric | Target Benchmark | Measurement Formula | Practical Business Interpretation |
| :--- | :---: | :--- | :--- |
| **Weekly Plan Acceptance Rate** | **&ge; 75%** | `(Accepted Meals / 21 Total Meals) * 100` | Indicates whether the AI/deterministic suggestions match family tastes without full regeneration. |
| **Dish Swap Frequency** | **&le; 4 meals/week** | `Count(Swapped Meals across 7 days)` | Measures how often individual suggestions need minor replacement. |
| **Basket Accuracy Rate** | **&ge; 85%** | `(Retained Items / Total Basket Items) * 100` | Measures whether pantry deduction and recipe scaling yield realistic grocery shopping lists. |
| **Estimated Time Saved** | **&ge; 120 mins/week** | `Baseline Planning Mins - RasoiIQ Planning Mins` | Measures reduction in daily "what to cook" negotiations and fragmented grocery ordering. |
| **Maharaj / Cook Briefing Utility** | **&ge; 4.0 / 5.0** | `Average Likert Rating (1 to 5)` | Evaluates whether WhatsApp cook briefings reduce domestic kitchen misunderstandings. |
| **Dietary & Allergy Precision** | **100.0%** | `100 - (Allergy Violations / Total Meals * 100)` | Mandatory non-negotiable safety constraint: Zero peanut/Jain violations. |

---

## 2. Structured Household Exit Interview (Day 7 Protocol)

This standardized 10-question evaluation form will be administered to the primary meal planner and household cook coordinator at the conclusion of Day 7.

### 2.1 Quantitative Questionnaire (Scale 1–5: 1 = Strongly Disagree, 5 = Strongly Agree)

1. **Relevance of Suggestions**: *"The meals suggested by RasoiIQ felt natural, appetizing, and appropriate for our family's regional palate."*  
   `[ 1 | 2 | 3 | 4 | 5 ]`
2. **Allergy & Dietary Confidence**: *"I trusted RasoiIQ to completely respect our family's dietary restrictions and allergies."*  
   `[ 1 | 2 | 3 | 4 | 5 ]`
3. **Grocery List Convenience**: *"The Smart Basket accurately reflected what we needed to buy after checking our pantry."*  
   `[ 1 | 2 | 3 | 4 | 5 ]`
4. **Domestic Cook Coordination**: *"The Maharaj / Cook briefing note made communicating daily instructions to our cook substantially easier."*  
   `[ 1 | 2 | 3 | 4 | 5 ]`
5. **Retailer Comparison Value**: *"Being able to see price differences across Blinkit, Zepto, Instamart, and BigBasket was valuable."*  
   `[ 1 | 2 | 3 | 4 | 5 ]`
6. **Time Saved**: *"Using RasoiIQ saved me significant mental energy and time planning meals this week."*  
   `[ 1 | 2 | 3 | 4 | 5 ]`
7. **Ease of Mobile Use**: *"The mobile interface was fast, intuitive, and easy to navigate on my phone."*  
   `[ 1 | 2 | 3 | 4 | 5 ]`
8. **Repeat Intent**: *"I would want to continue using RasoiIQ for our weekly meal planning after this pilot."*  
   `[ 1 | 2 | 3 | 4 | 5 ]`

---

### 2.2 Qualitative Deep-Dive Questions

- **Question 9 (Kitchen Cook Reaction)**: *"How did your domestic cook (Maharaj/bai) respond when you sent them the WhatsApp briefing? Was anything unclear or phrased awkwardly?"*
- **Question 10 (Critical Friction Point)**: *"What was the single most frustrating or confusing moment you experienced while using the app this week?"*

---

## 3. Data Integrity & Live Pilot Status

> [!IMPORTANT]
> **Data Provenance Standard**
> RasoiIQ strictly adheres to factual verification standards. No live household survey responses, customer ratings, or participant quotes will be fabricated.
> 
> The figures documented below represent the **pre-pilot baseline verification state** established by automated simulations. Live pilot validation results will be populated as participating families complete the 7-day protocol.

### Current Status Table

| Metric Category | Automated Simulation Result (`test-phase43`) | Live Household Pilot Metric | Verification Status |
| :--- | :---: | :---: | :---: |
| **Allergy & Constraint Safety** | **100% (27/27 passed)** | *Pending Live Field Trial* | **CERTIFIED READY** |
| **Multi-Household Isolation** | **100% (3/3 households isolated)** | *Pending Live Field Trial* | **CERTIFIED READY** |
| **Cook Briefing Generation** | **100% (Formatted correctly)** | *Pending Cook Feedback* | **CERTIFIED READY** |
| **Smart Basket Deduction** | **100% (Pantry items deducted)** | *Pending User Audit* | **CERTIFIED READY** |
| **Household Satisfaction Score** | *N/A (Automated)* | *Pending Day 7 Survey* | **PENDING TRIAL** |
| **Actual Time Saved (Minutes)** | *N/A (Simulated <2s generation)* | *Pending Day 7 Survey* | **PENDING TRIAL** |

---

## 4. Post-Pilot Data Aggregation Template

When live pilot data is gathered from Households 1 through 5, it will be compiled into the following summary format:

```markdown
### Summary of Live Pilot Household Findings (Template)
- **Total Participating Families**: [ N ]
- **Average Weekly Acceptance Rate**: [ XX.X% ]
- **Average Dish Swaps per Week**: [ X.X ]
- **Average Time Saved**: [ XX minutes/week ]
- **Average Cook Briefing Score**: [ X.X / 5.0 ]
- **Dietary Safety Record**: [ 100% - Zero Incidents ]
- **Top 3 Feature Requests**:
  1. [ Feature A ]
  2. [ Feature B ]
  3. [ Feature C ]
```
