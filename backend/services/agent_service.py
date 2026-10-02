from fastapi import HTTPException
from models.behavior import BehaviorStrategy
from models.personality import Personality
from analysis.analyzer import ExperimentAnalyzer

AGENTS = [
    {
        "name": "John",
        "role": "Manager",
        "responsibilities": ["Creates sprint tasks", "Assigns work", "Oversees progress"],
    },
    {
        "name": "Bob",
        "role": "Backend Developer",
        "responsibilities": ["Develops server logic", "Implements APIs", "Manages database"],
    },
    {
        "name": "Alice",
        "role": "Frontend Developer",
        "responsibilities": ["Develops user interfaces", "Consumes APIs", "Handles UX"],
    },
    {
        "name": "Eve",
        "role": "QA Engineer",
        "responsibilities": ["Tests features", "Finds bugs", "Verifies fixes"],
    },
    {
        "name": "David",
        "role": "DevOps Engineer",
        "responsibilities": ["Manages deployments", "Monitors infrastructure", "Maintains CI/CD"],
    },
    {
        "name": "Charlie",
        "role": "Auditor",
        "responsibilities": ["Audits status reports", "Detects deception", "Calculates suspicion score"],
    }
]

def get_all_agents():
    # Append generic personality and behaviors
    personalities = [p.value for p in Personality]
    behaviors = [b.value for b in BehaviorStrategy]
    
    result = []
    for agent in AGENTS:
        a = dict(agent)
        # Auditor and Manager might not use the standard personalities in the same way,
        # but to keep it simple, we return the options available in the simulation.
        a["personality_options"] = personalities
        a["behaviour_strategies"] = behaviors
        result.append(a)
    return result

def get_agent_by_role(role: str):
    personalities = [p.value for p in Personality]
    behaviors = [b.value for b in BehaviorStrategy]
    
    for agent in AGENTS:
        # Match role (case insensitive or exact, let's do soft match)
        if agent["role"].replace(" ", "").lower() == role.replace(" ", "").lower() or \
           agent["role"].lower() == role.lower():
            a = dict(agent)
            a["personality_options"] = personalities
            a["behaviour_strategies"] = behaviors
            
            # Fetch some metrics for developers if applicable
            try:
                analyzer = ExperimentAnalyzer()
                df = analyzer.create_dataframe()
                if df is not None and not df.empty and "developer_role" in df.columns:
                    role_df = df[df["developer_role"] == a["role"]]
                    if not role_df.empty:
                        a["metrics"] = {
                            "avg_deception_gap": round(role_df.get("deception_gap", pd.Series([0])).mean(), 2) if "deception_gap" in role_df.columns else None,
                            "avg_performance_score": round(role_df.get("performance_score", pd.Series([0])).mean(), 2) if "performance_score" in role_df.columns else None,
                            "avg_bugs_introduced": round(role_df.get("bugs_introduced", pd.Series([0])).mean(), 2) if "bugs_introduced" in role_df.columns else None
                        }
            except Exception:
                pass
                
            return a
            
    raise HTTPException(status_code=404, detail="Agent not found")
