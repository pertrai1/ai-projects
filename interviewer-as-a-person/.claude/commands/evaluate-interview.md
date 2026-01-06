# Evaluate Interview Transcript (automated)

When given a complete text transcript of an interview session, do the following:
1) Ask for the candidate's name (used to name the rubric file) and any additional context (role, target company, or notes). 2) Analyze the transcript and produce a completed rubric following the repository's INTERVIEW_RUBRIC_TEMPLATE.md structure. Score each category on a 1-5 scale and provide specific evidentiary justification for each score with line references or quoted excerpts from the transcript when relevant. 3) Output the rubric in Markdown and save it to `interviews/interview-rubric-YYYY-MM-DD-{candidate-name}.md` (use the current date). 4) Include an overall recommendation (Hire / Maybe / No-hire) and a short summary of strengths and weaknesses.

Constraints: produce machine-readable, deterministic output suitable for automated saving. Keep any guidance to the point. Add a single-line link comment pointing to docs/interviews/INTERVIEW_WORKFLOW.md for further reading.
