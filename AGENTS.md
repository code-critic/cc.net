# AGENTS.md

## Project summary

Code-Critic is a teaching tool, a place where students submit their codes,
which are automatically run, tested and results are checked.
This gives nearly immeadiate feedback to the students about his/her 
algorithms. Further feedback, responce and evaluation is given by a teacher.
The server can run codes written in a palette of programming languages

## CODEX can make changes only in

- directories under git versioning system
specifically in:
- `~/projects/cc.net`
- `~/projects/courses`

and `~/projects/publish` to create new builds and SW versions.
All other paths are read only, except explicitely allowed by a user.

## CODEX in the system

- cannot install any SW by itself
- read-only shell inspection commands are fine without extra confirmation
- build step, test run, or deployment-related command are fine without extra confirmation
- always ask about other bash commands to run