---
name: aware
description: scans current working directory to find the changed files, analyze them, fix the unit tests and commit changes.
disable-model-invocation: true
---

In the current working directory, get all changes made by a user (do it using git cli, it fit cli isn't installed ask a user to install it) and analyze them.  
As much as possible, use standard tools as grep, glob and read to analyze the files (not the script one-liner) so a user will not be asked for permissions each time.  
If there are any core changes that change the way the code has to be written, something like real architectural shift, propose the update CLUDE.md file.  
If there are any unit tests that need to be updated, created or removed, just do it without asking for confirmation and make a description of the changes.  
After analysis, commit the changes (don't ask user's permissions to commit, just commit all changed files including CLAUDE.md and other, but do not push them, just propose user push as a next step)  

