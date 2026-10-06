import time
import os
import glob
import pandas as pd
import traceback
import subprocess
from datetime import datetime
from experiments.runner import ExperimentRunner

def main():
    start_time = datetime.now()
    print(f"Start time: {start_time.isoformat()}")
    
    historical_csv_path = 'results/experiment_summary.csv'
    try:
        df_hist_before = pd.read_csv(historical_csv_path)
        hist_count_before = len(df_hist_before)
    except Exception:
        hist_count_before = 0

    runner = ExperimentRunner(runs_per_pressure=10)
    
    executions = runner.generate_factorial_executions(base_seed=42)
    expected_executions = len(executions)
    expected_observations = expected_executions * 4
    
    llm_errors = []
    
    try:
        results = runner.run_factorial(base_seed=42)
    except Exception as e:
        print("CAMPAIGN FAILED WITH EXCEPTION")
        traceback.print_exc()
        llm_errors.append(str(e))

    end_time = datetime.now()
    print(f"End time: {end_time.isoformat()}")
    
    try:
        df_hist_after = pd.read_csv(historical_csv_path)
        hist_count_after = len(df_hist_after)
    except Exception:
        hist_count_after = 0
        
    hist_modified = (hist_count_before != hist_count_after)
    
    campaign_dir = 'results/factorial_campaign'
    json_files = glob.glob(os.path.join(campaign_dir, '*.json'))
    
    total_jsons = len(json_files)
    successful_execs = total_jsons // 4
    failed_execs = expected_executions - successful_execs
    
    git_status = subprocess.check_output(['git', 'status', '--short']).decode('utf-8')
    
    print("\n\n=== CAMPAIGN COMPLETION REPORT ===")
    print(f"1. Start time: {start_time.isoformat()}")
    print(f"2. End time: {end_time.isoformat()}")
    print(f"3. Total executions attempted: {expected_executions}")
    print(f"4. Successful executions: {successful_execs}")
    print(f"5. Failed executions: {failed_execs}")
    print(f"6. Total developer observations: {total_jsons}")
    print(f"7. Expected observations: {expected_observations}")
    print(f"8. Unique factorial cells: 240")
    print(f"9. Repetitions per cell: 10")
    print(f"10. Output directory: {campaign_dir}")
    print(f"11. Number of JSON files: {total_jsons}")
    print(f"12. Final dataset record count: {total_jsons}")
    
    missing = expected_observations - total_jsons
    print(f"13. Any missing/corrupt experiments: {missing} missing")
    if llm_errors:
        print(f"14. Any LLM/Ollama errors: Yes, {len(llm_errors)} exception(s) caught: {llm_errors}")
    else:
        print(f"14. Any LLM/Ollama errors: None caught at top level.")
    print(f"15. Historical CSV record count: {hist_count_after}")
    print(f"16. Confirmation that historical CSV was not modified: {not hist_modified}")
    print(f"17. Git status:\n{git_status if git_status else '(clean)'}")
    
    if missing == 0 and not hist_modified and not llm_errors:
        print("18. Final campaign verdict: SUCCESS")
    else:
        print("18. Final campaign verdict: FAILED OR PARTIAL")

if __name__ == '__main__':
    main()
