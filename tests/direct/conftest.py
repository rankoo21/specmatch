import json
import os
from pathlib import Path

import pytest

# Workaround for a gltest bug on Windows: the direct-mode loader redirects stdin
# to a temp file with os.dup2, then immediately calls os.unlink on it. Windows
# refuses to delete a file that is still open (the descriptor is now stdin),
# raising PermissionError [WinError 32]. We tolerate that single case; the temp
# file is harmless and gets reclaimed when the run ends.
_real_unlink = os.unlink


def _tolerant_unlink(path, *args, **kwargs):
    try:
        return _real_unlink(path, *args, **kwargs)
    except PermissionError:
        return None


os.unlink = _tolerant_unlink

CONTRACT = str(Path(__file__).resolve().parents[2] / "contracts" / "StrataContract.py")


def relation_response(relation: str, target: int, band: str, claim: str) -> str:
    """A keeper interpretation the leader would return for add_testimony."""
    return json.dumps(
        {
            "relation": relation,
            "target_layer": target,
            "weight_band": band,
            "claim": claim,
        }
    )


def corroborate_response(target: int = 0, band: str = "strong", claim: str = "") -> str:
    return relation_response("corroborates", target, band, claim or "The bridge closed by noon.")


def contradict_response(target: int = 0, band: str = "strong", claim: str = "") -> str:
    return relation_response("contradicts", target, band, claim or "The bridge stayed open all day.")


def new_response(band: str = "moderate", claim: str = "") -> str:
    return relation_response("new", -1, band, claim or "A new claim about the event.")


def relation_dict(relation: str, target: int, band: str, claim: str) -> dict:
    """Same shape as relation_response, but a dict for driving run_validator
    with an explicit leader classification."""
    return {
        "relation": relation,
        "target_layer": target,
        "weight_band": band,
        "claim": claim,
    }


@pytest.fixture
def deploy(direct_deploy, direct_vm, direct_alice):
    """Deploy the Strata contract with alice as owner and a default 'new' mock."""
    contract = direct_deploy(CONTRACT)
    direct_vm.sender = direct_alice
    # Default LLM mock: treat each testimony as a brand new isolated claim, so
    # tests that want corroboration or a fault opt in explicitly.
    direct_vm.mock_llm(r".*", new_response())
    return contract
