#!/usr/bin/env python3
"""
Interview Orchestrator Script

This script orchestrates technical interviews by running specialized agent prompts
for coding, systems design, and behavioral interviews.

Usage:
    python scripts/start_interview.py [mode] [--candidate NAME] [--auto-eval]

Modes:
    coding     - Coding interview (default)
    systems    - Systems design interview
    behavioral - Behavioral interview
    full       - Run coding, systems, and behavioral sequentially

Options:
    --candidate NAME  - Candidate name for transcript filename
    --auto-eval       - Enable automatic evaluation after interview
"""

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Optional, Tuple

VALID_MODES = ["coding", "systems", "behavioral", "full"]
FULL_SEQUENCE = ["coding", "systems", "behavioral"]

REPO_ROOT = Path(__file__).parent.parent
AGENTS_DIR = REPO_ROOT / ".claude" / "agents"
INTERVIEWS_DIR = REPO_ROOT / "interviews"


def get_agent_prompt_path(mode: str) -> Path:
    """Get the path to the agent prompt file for a given mode."""
    return AGENTS_DIR / f"{mode}-interview.md"


def get_transcript_path(candidate: str, interview_type: str) -> Path:
    """Generate transcript path with date and candidate name."""
    date_str = datetime.now().strftime("%Y-%m-%d")
    filename = f"transcript-{date_str}-{candidate}-{interview_type}.txt"
    return INTERVIEWS_DIR / filename


def get_rubric_path(candidate: str, interview_type: str) -> Path:
    """Generate rubric path with date and candidate name."""
    date_str = datetime.now().strftime("%Y-%m-%d")
    filename = f"interview-rubric-{date_str}-{candidate}-{interview_type}.md"
    return INTERVIEWS_DIR / filename


def find_llm_runner() -> Optional[str]:
    """
    Find an available LLM runner.
    
    Checks:
    1. CLAUDE_RUNNER environment variable
    2. 'claude-code' CLI
    3. 'claude' CLI
    
    Returns the runner command or None if not found.
    """
    # Check environment variable first
    env_runner = os.environ.get("CLAUDE_RUNNER")
    if env_runner and shutil.which(env_runner):
        return env_runner
    
    # Check common CLIs
    for cli in ["claude-code", "claude"]:
        if shutil.which(cli):
            return cli
    
    return None


def read_prompt_file(mode: str) -> str:
    """Read the agent prompt file for the given mode."""
    prompt_path = get_agent_prompt_path(mode)
    if not prompt_path.exists():
        raise FileNotFoundError(f"Agent prompt not found: {prompt_path}")
    return prompt_path.read_text()


def run_interview(
    mode: str,
    candidate: str,
    auto_eval: bool = False,
    runner: Optional[str] = None
) -> Tuple[bool, str]:
    """
    Run an interview session.
    
    Args:
        mode: Interview type (coding, systems, behavioral)
        candidate: Candidate name
        auto_eval: Whether to auto-evaluate after interview (creates placeholder rubric)
        runner: LLM runner command to use
    
    Returns:
        Tuple of (success, message)
    """
    prompt_content = read_prompt_file(mode)
    transcript_path = get_transcript_path(candidate, mode)
    
    # Ensure interviews directory exists
    INTERVIEWS_DIR.mkdir(parents=True, exist_ok=True)
    
    if runner is None:
        # No runner found - return prompt contents with simulated-run note
        simulated_output = f"""=== SIMULATED RUN (No LLM runner found) ===

Interview Type: {mode}
Candidate: {candidate}
Transcript would be saved to: {transcript_path}

Agent Prompt Contents:
---
{prompt_content}
---

To run this interview for real, either:
1. Set CLAUDE_RUNNER environment variable to your LLM CLI
2. Install 'claude-code' or 'claude' CLI

"""
        # Save simulated transcript
        transcript_path.write_text(simulated_output)
        return True, f"Simulated run complete. Transcript saved to: {transcript_path}"
    
    # Run the actual interview with the LLM runner
    try:
        # Write prompt to a temp file to avoid exposing in process list
        with tempfile.NamedTemporaryFile(
            mode='w',
            suffix='.md',
            delete=False,
            prefix='interview_prompt_'
        ) as prompt_file:
            prompt_file.write(prompt_content)
            prompt_file_path = prompt_file.name
        
        try:
            # Build command using file path instead of prompt content
            cmd = [runner, "--prompt-file", prompt_file_path]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=str(REPO_ROOT)
            )
        finally:
            # Clean up temp file
            os.unlink(prompt_file_path)
        
        # Save transcript
        transcript_content = f"""=== Interview Transcript ===
Interview Type: {mode}
Candidate: {candidate}
Date: {datetime.now().isoformat()}

--- Output ---
{result.stdout}

--- Errors (if any) ---
{result.stderr}
"""
        transcript_path.write_text(transcript_content)
        
        # Handle auto-evaluation
        if auto_eval and result.returncode == 0:
            rubric_path = get_rubric_path(candidate, mode)
            # Create a placeholder rubric that would be filled by evaluation
            rubric_content = f"""# Interview Rubric - {candidate}

## Interview Details
- **Type**: {mode}
- **Date**: {datetime.now().strftime("%Y-%m-%d")}
- **Transcript**: {transcript_path.name}

## Evaluation

*Auto-evaluation was requested. Please run the evaluate-interview command
with the transcript to complete this rubric.*

See: `.claude/commands/evaluate-interview.md`
"""
            rubric_path.write_text(rubric_content)
            return True, f"Interview complete. Transcript: {transcript_path}, Rubric: {rubric_path}"
        
        return True, f"Interview complete. Transcript saved to: {transcript_path}"
        
    except Exception as e:
        return False, f"Error running interview: {e}"


def main():
    parser = argparse.ArgumentParser(
        description="Interview Orchestrator - Run technical interviews with AI agents",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument(
        "mode",
        nargs="?",
        default="coding",
        choices=VALID_MODES,
        help="Interview mode (default: coding)"
    )
    
    parser.add_argument(
        "--candidate",
        default="candidate",
        help="Candidate name for transcript filename"
    )
    
    parser.add_argument(
        "--auto-eval",
        action="store_true",
        default=False,
        help="Enable automatic evaluation after interview (disabled by default)"
    )
    
    args = parser.parse_args()
    
    # Find LLM runner
    runner = find_llm_runner()
    if runner:
        print(f"Using LLM runner: {runner}")
    else:
        print("No LLM runner found. Will simulate run and return prompt contents.")
    
    # Determine which interviews to run
    modes_to_run = FULL_SEQUENCE if args.mode == "full" else [args.mode]
    
    results = []
    for mode in modes_to_run:
        print(f"\n{'=' * 50}")
        print(f"Starting {mode} interview for {args.candidate}")
        print(f"{'=' * 50}\n")
        
        success, message = run_interview(
            mode=mode,
            candidate=args.candidate,
            auto_eval=args.auto_eval,
            runner=runner
        )
        
        results.append((mode, success, message))
        print(message)
        
        if not success:
            print(f"Warning: {mode} interview failed. Continuing with next...")
    
    # Summary
    print(f"\n{'=' * 50}")
    print("Interview Session Summary")
    print(f"{'=' * 50}")
    for mode, success, message in results:
        status = "✓" if success else "✗"
        print(f"  {status} {mode}: {message.split('.')[0]}")
    
    # Return success if all interviews completed
    all_success = all(r[1] for r in results)
    sys.exit(0 if all_success else 1)


if __name__ == "__main__":
    main()
