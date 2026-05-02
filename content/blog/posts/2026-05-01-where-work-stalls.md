---
title: Where work stalls
slug: where-work-stalls
date: 2026-05-01
description: "AI's first institutional job is not to answer. It is to listen with purpose so that the judgment that makes science and civic systems work has somewhere to live before the people who hold it leave the room."
draft_label: v5
parent_draft: 2026-05-01-where-work-stalls.v5.md
---

# Where work stalls

> *Where initiatives stagnate is almost always the human-to-human layer.*
>
> *People freeze, not just slow down, in the face of systems they feel they cannot control.*
>
> *Listening restores **personal agency** → **team agency** → **systemic response.***

---

In March 2020, the right person to review an infectious-disease preprint already existed. She knew the assay. She knew the outbreak literature. She would have caught the flaw hidden in figure three. But unless someone knew that *she* knew, unless her expertise lived in a memory, an inbox, a phone, or a colleague's head, the system could not find her in time.

That is where work stalls. Not at the database. Not at the funding line. Not at the algorithm. Work stalls at the **human-to-human layer**, where the knowledge needed to make a system work is real, consequential, and mostly unwritten. The people who hold it have no trusted method, no time, and no incentive to externalize it before they retire, burn out, or get reassigned.

A working group at Colorado State, writing about exactly this problem inside research labs, named it precisely:

> *"A significant portion of a research group's collective know-how remains informal, scattered, or undocumented—typically transmitted orally through meetings, mentorship, and day-to-day collaboration. These practices embody the group's tacit knowledge: the experiential, context-specific expertise at the core of their work. Extracting this knowledge is often challenging, demanding both time and nuanced insider perspective."* ([Wright et al., AquiLLM, 2025](https://www.alphaxiv.org/abs/2508.05648))

The AquiLLM paper proposes a retrieval system to surface that tacit knowledge once it has been written down somewhere. This essay is about the step before retrieval: how to *get the knowledge written down at all*, while the people who hold it are still in the room. **AI's first institutional job is not to answer. It is to listen with purpose, so that the judgment that makes a system work has somewhere durable to live before the people who hold it disappear.**

That is the worldview shift this essay is asking you to consider.

---

## The shift this essay proposes

| Before reading | After reading |
|---|---|
| Institutions stall because they lack data, software, AI, or funding. | Institutions stall because the operating knowledge of the system is socially held, not technically stored. |
| AI for science means faster generation, retrieval, and summarization. | AI for science means *listening with purpose* so the institution can preserve judgment before it disappears. |
| Reproducibility, reviewer attention, and lab-tradition transfer are separate problems. | They are the same problem in three costumes: tacit knowledge that today's infrastructure systematically fails to capture. |
| Institutional memory is internal documentation. | Institutional memory is civic infrastructure. A society that cannot preserve tacit knowledge cannot accumulate institutional wisdom. |

The first three shifts are partly already in the air: Jennifer Pahlka has named the *project vs. product funding* trap; Seemay Chou has argued that *publishing defines science*; Doris Tsao's discipline is that the test of understanding is *writing into* the system, not only *reading from* it. Eli Dourado's frame for the post-1973 productivity stall is structurally the same: *concrete vision → identify the obstacle → use entrepreneurial will to obliterate the obstacle.* The fourth row, *institutional memory as civic infrastructure*, is what this essay is contributing.

---

## Why ordinary instruments don't reach the bottleneck

The instruments we already have, at industrial maturity, can do many things. They cannot do this thing.

- **Quantitative dashboards** aggregate the legible. They cannot capture the question that should have been asked, the half-formed objection no one wrote down, or the codebook key that lives inside an undocumented field labelled `9999`.
- **Search and retrieval-augmented generation** retrieve documents at speed. They retrieve *without listening with purpose*. Their confident wrongness is concentrated exactly where it matters most.
- **Generic AI summarization** produces plausible prose at low cost. It captures what was said without knowing what the institution needed to learn, and it can train people to perform for the recorder rather than think with the system.
- **Surveys and structured interviews** are comparable and replicable. They flatten texture. They force respondents into the surveyor's categories.
- **Traditional ethnography** produces thick description and standpoint epistemology. It is usually funded as episodic research rather than maintained operational infrastructure, and it rarely produces a successor-ready artifact.

What is missing is a method that fuses three things at once: emotional safety so people will think out loud rather than perform; a theoretical frame that takes everyday work seriously as data; and AI that **listens with purpose**, knowing the project, the rubric, and the values, rather than transcribing.

In plain language, this is **Deep Listening**: a structured pairing of human-to-human conversation with AI that holds the listening load. A facilitator (or a colleague, or a peer) sits with the person whose judgment the system depends on. The two of them talk. The AI does not interrupt, does not summarize, does not generate answers. It listens against a named rubric: *what is this person's project, what does good look like for it, what values must hold, who needs the output, in their own voice.* It produces durable artifacts the next session, the next colleague, and the next agent can actually use: workflow maps, decision logs, open-question logs, voice-and-vocabulary lexicons, and small `.context/` directories. By `.context/`, I mean a version-controlled folder that travels with a project, holding the judgment layer around the work rather than the work itself.

The name is plain. The discipline is what makes it new.

---

## What listening is *not*

This only works if the people being listened to retain agency over what is captured, how it is interpreted, who can access it, and how it is used. **An instrument that becomes surveillance has failed before it begins.** Six guardrails, written into the method, before any session runs:

- *Steward, not user.* Communities and individuals retain authority and ethical claims over data about them; the data consumer holds responsibility on their behalf. (CARE Principles for Indigenous Data Governance.)
- *Probabilistic estimates, not definitive facts.* Model outputs are signals that point toward patterns. They do not replace the responsibility to validate findings against local knowledge, lived experience, and the input of people who know the ground.
- *Informed consent on every recording. No covert capture. Participant review of every artifact before it is committed. Redaction rights for any segment a participant flags.*
- *Discretion maps* (`sensitive-topics.md`) written with the partner on day one, naming what the system will not surface even when it could.
- *No use in performance evaluation.* The artifacts exist to preserve judgment. They cannot be used to grade individuals.
- *Aggregate-only public outputs* with population thresholds when the data touches over-surveilled populations; *local-first AI* and clear data-governance defaults; community ownership where community knowledge is captured.

These are not decorative. They are the operating boundary of the method, and they are why this can be listening as instrumentation rather than listening as surveillance.

---

## Three places the method already runs

The method is not a proposal. It is a discipline that has been deployed across several domains and tested in the wild. Three of them are vivid enough to walk a reader through.

### 1. Rapid Reviews / Infectious Diseases: the science-side deployment

During an outbreak, methodologically qualified expertise must find the right preprint within days, anywhere in the world, without quietly defaulting to the same fifty people in everyone's rolodex. Rapid Reviews / Infectious Diseases is an open-access overlay journal jointly run by MIT Press and the UC Berkeley School of Public Health. Over two years it has moved more than thirty undergraduate STEM students plus medical and public-health graduate students through a global review program, with a faculty editorial team across the United States, India, and beyond. The journal exists; the reviewers exist; the science is real.

What does not yet exist, anywhere in scholarly publishing, is a workflow that captures *what each reviewer reads for* across successive engagements: the methodological-competence rubric kept in their heads. Deep Listening builds that rubric session by session, in the reviewer's own voice, with the reviewer's own examples, into a `.context/` artifact a successor can read. The deeper move, named by the RR/ID team itself, is that the work is not just infrastructure but *conditions that allow others to build further*: a help-desk and ticketing layer that turned person-dependent support into something the next cohort of students can run; a culture in which a student's question gets met with *what is your goal* before *here is the fix*. That is the shape of metascience that scales: the platform plus the next cohort of practitioners trained inside it.

### 2. The California Research Bureau and the clearing account: the civic-policy deployment

California's Open Fi$Cal data is technically public. Interpreting it is not. In one fiscal year alone, **18,995 expenditures** parsed; **9,425** matched to authorizing texts; **9,491** routed to a single clearing account that everyone in the budget shop knows about and almost no public artifact mentions. Without a CA State fiscal analyst who has worked with that system for a decade, the published numbers would be *numerically right and easy to mis-story*. That phrase is the whole essay in miniature: data access is not the same as public intelligibility, and tacit knowledge is the difference.

The CRB Nexus three-part workshop series ran February through April 2026. Roughly seventy registered, thirty live each session. A non-programmer staff member built a working AI agent to verify provenance chains in legislative research. Another built a workflow-mapping prototype for a recurring newsletter. Both shipped because the listening surfaced the staff's values — accuracy, nonpartisan rigor, transparency — *before* the prompts. The artifact a successor agency analyst (at LAO, ODI, or the Senate Office of Research) can adopt is a `.context/` substrate: not a franchise, a starter culture.

But the artifact itself is not the deepest impact. **The real transformation was what shifted for the people in the room.** As Tonya, a staff member, described during the process, the act of being listened to—having to articulate her decisions, caveats, and the tacit insights she’d never previously voiced—changed how she related to her own work. This process required *Deep Speaking*: making the invisible aspects of expertise explicit, in her own words. The relief was palpable; she could participate fully in the conversation, knowing the responsibility of detailed note-taking was handled by the AI. The listening load was lifted. The next session could begin with shared context; decisions and reasoning weren’t lost. Two participants could *talk and actually be heard* in a way traditional note-taking never allowed. [See Tonya discuss this shift](https://youtu.be/7A1vVkfz_tE?si=6MMx0P0xdU2SMNTj&t=2302).

### 3. The civic-legal-aid deployment, scaled from city to federal

Eviction filings, sheriff writs, court dispositions, and housing-precarity risk indicators are technically queryable. Whether the case-management system can track address, whether a model trained on 2019 data still flags a community whose displacement intensified in 2022, whether a city qualifies for adaptation funding because of an indicator embedded in a state GIS platform: each of these depends on tacit knowledge no public artifact carries. The interpretive bottleneck is not the data. It is the institutional history of why a system measures what it measures, and what it leaves out.

The deployment runs across five rungs of the same instrument: a single neighborhood vulnerability assessment whose locally-known precarity is *not* flagged by the conservative national risk model; a county-by-county housing-element analysis serving twenty-one cities under a single county umbrella; a county courts report partner-mediated by Legal Aid and the county Community Development Agency; a state-level housing-precarity model embedded in California's coastal-adaptation GIS platform as one of the indicators that determine funding eligibility under SB 272; and federal connections through HUD AFFH and the National Academies' COVID-era eviction work. The same method runs at every scale. The civil-legal-aid sector frames the public-value case directly: independent state studies report ratios on the order of $7 in benefits per $1 invested, and a single regional legal-aid organization reports more than $50M in direct economic benefits returned to families in a single year. The bottleneck has never been the value of the work. It has always been the institutional listening that lets the work compound.

---

## What these three places share

In each case, the breakthrough that science-and-civic infrastructure needs is not a paper, a grant, or a policy memo. It is **a piece of operational infrastructure built by people who understood the bottleneck from the inside**, with an instrumented workflow that survives the people who built it. The Protein Data Bank, arXiv, and Focused Research Organizations are the canonical scientific examples. Each turned a recurring informal practice into shared infrastructure: deposition, circulation, coordination. Deep Listening attempts the same move for *tacit judgment*, and it does so across science *and* the civic systems science is embedded in.

The frame that makes this legible is not new. *Concrete vision → identify the obstacles → entrepreneurial will to obliterate the obstacles* is the recipe Eli Dourado has been articulating for the post-1973 productivity stall. The argument here is structurally identical. Ideas are not the binding constraint. Capability is not the binding constraint. The institutional listening that lets ideas and capability compound *is* the constraint. Build that, and the pace of useful science and useful civic action both move at once.

The general public is not a respondent in this design. They are *first-person experts* on what their own lives, families, and communities experienced. A resident whose neighborhood is invisible to a national risk model is not anecdotal noise. She is evidence that the model may be missing the thing policy most needs to see. The instrument treats her that way.

---

## The hypothesis, with baselines

Three claims, each willing to be wrong out loud. Each specifies *baseline against what, graded by whom*.

| # | Claim | Baseline | Grader | Pre-registered rubric |
|---|---|---|---|---|
| 1 | **Successor usability.** In any team where the method runs for one quarter, the share of analyst (or reviewer, or postdoc) workflows with a written-down version usable by a successor on day one rises from <10% to >50%. | Pre-pilot baseline: a sampled audit of how many current workflows have a documented version a peer could run. | Domain experts in the same team. | "Usable on day one" means: identifies needed approvals, reproduces the analysis, explains known caveats, names handoff points. |
| 2 | **Agent reliability.** AI assistants built on top of the captured `.context/` artifacts hit ≥80% on a *would pass our nonpartisan-research / methods-section / peer-review bar* rubric on a randomly sampled set of routine outputs. | Off-the-shelf agents trained without context, on the same task set. | Domain experts using a pre-registered rubric. | The rubric is published before the agent is run; outputs are blind-graded. |
| 3 | **Cross-domain transfer.** The method, applied in a new domain (rapid review, fiscal, housing, EMS, environmental policy), reaches its first useful artifact within one quarter. | Time-to-first-useful-artifact measured in domains where this method has not previously been applied. | Domain experts in the new domain. | "Useful artifact" means: a partner inside the domain says they would adopt it. |

What would tell me the hypothesis is wrong: a deployment that completes the full method cycle and *still* produces outputs the domain experts will not vouch for. An *informative* failure would isolate which layer broke (the trust substrate, the theoretical frame, the listening protocol, the capture pipeline, or the artifact specification) and would itself be a metascience finding worth publishing in the open by default.

---

## What is actually at stake

Tom Negrete is the director of the California Research Bureau. Before the listening sessions began, he and his staff were stuck. Not slow. Stuck. AI was overwhelming. The cadence of change was overwhelming. The forecast for state agencies was overwhelming. Their response, a year ago, was paralysis dressed as professional caution.

A year of *talking and listening together* accomplished what no purely technical solution could. Tom shared: *we used to be paralyzed. Now we aren't. We have language for our work. We have artifacts our colleagues can reference. Our knowledge and judgment persist beyond staff turnover.* He added, more softly: *my peers at other agencies who didn't have these conversations remain where we were a year ago.*  
[Watch Tom discuss this transformation](https://youtu.be/7A1vVkfz_tE?si=4Wioz_FT3ODNU0TL&t=369).

This is the part that does not show up in any falsifiability table. The instrument's first effect is not on the artifact. It is on the people in the conversation. **When the AI takes the listening load, the humans can stop performing for the recorder and start being present for each other.** The notes get taken. The decisions get logged. The next session walks in already knowing what was decided. *And* the participants do something they had quietly stopped doing under the weight of constant note-taking and meeting documentation: they hear each other.

That is the deeper claim of this essay. Listening is not therapy and it is not surveillance. It is what becomes possible when the load of remembering shifts off the humans in the room and onto a tool that listens with purpose. Personal agency returns first. Team agency follows. Systemic response is what those two compound into.

---

## The ask

Fund **one year of structured listening in one bounded scientific or civic system**. Publish the artifacts where possible. Protect what must be protected. Measure whether successors can act on them. Let domain experts grade the AI. Let the people whose judgment was captured tell us whether the artifacts represent them.

The technology exists. The people exist. The method runs. The distance between the world where this is treated as institutional infrastructure and the world where it is not is *will*: the will to write down what we know before the people who know it leave; to treat the human-to-human layer as load-bearing rather than overhead; to keep showing up to the next conversation when the calendar tries to go quiet.

Let's listen. Together.

[DeeperListening.AI](/blog/colophon/#bespoke-tools-methods)

---

*Aaron Culich is an independent research-software engineer at CiDR Lab <https://cidrlab.org/> and mindfulness, emotional intelligence and listening trainer and facilitator at PEEQ.WORK <https://peeq.work/>. The deployments referenced run at varying status: Rapid Reviews / Infectious Diseases <https://rrid.mitpress.mit.edu/> (in progress, MIT Press / UC Berkeley School of Public Health); CRB Nexus <https://www.library.ca.gov/crb/nexus/> (workshops completed Feb–Apr 2026; MaCSS <https://macss.berkeley.edu/> capstone completed May 1, 2026); the multi-scale civic-legal-aid program (CiDR Lab: city / county / state / federal).
