---
title: BDD can make your code review 6x faster
description: AI made writing code cheap; review is now the bottleneck. Here is how BDD cut my team's review time from 21.8h to 3.6h per MR.
date: 2026-11-20
thumbnail: /images/bdd-can-make-your-code-review-6x-faster/cover.svg
---

I have a hypothesis: BDD can speed up code review.

Writing code has become cheap and fast, so review is now the weak link in the chain: LLMs produce more code than we can review in the same time.

Since we are no longer the ones writing the code, we understand less of what it actually does. Less understanding means less confidence, and less confidence makes us hold the approval much longer.

So, to me, the right question is: why can't we review as fast as we produce?

To answer it, I need to share my view that AI created a new level of abstraction, exactly like frameworks did, or like high-level languages did over low-level ones.

The problem is that we write code in a much higher-level language and review it in a very low-level one. It's as if we were writing in Python, Ruby or even Java, and reviewing in Assembly. That still works only because we still know the "Assembly" of the AI age.

If you don't know what BDD is, here is my translation: a failed attempt to create a common language between product and engineering.

Every successful BDD case I know leaned toward engineering language in its feature files. The literature pushed us toward heavy collaboration with stakeholders, and that is why I believe BDD "failed". It worked as a testing technology but failed in adoption. (How I use it may become another post.)

Since Cursor launched, I've been using LLMs + BDD to code faster. I started on personal projects, and right after I introduced it to my team, we saw really interesting numbers in only 45 days:

- Median hours per MR dropped from 21.8h to 3.6h, 6x faster.
- MRs open for more than 3 days were cut in half.
- Small MRs (<50 lines) decreased, and large MRs (300+ lines) increased by 86%.
- Quality stayed the same.

The numbers were so good that I thought it was just luck, so I asked Claude to calculate the chance that this was a false positive.

Claude compared this service with 3 others that didn't adopt BDD, based on the number of MRs and the time spent on each. All three got a p-value around 0.5, far above the usual 0.05 threshold, which means no real change. This service got 0.0004, which classifies the adoption as a real gain.

Claude also ran a placebo test: it picked random dates before the adoption to check whether the team was already trending toward faster reviews. It found no trend, which strongly suggests BDD was the factor behind the 6x faster review.

We are now adopting BDD in more services to validate this hypothesis again.
