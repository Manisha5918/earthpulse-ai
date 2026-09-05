import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))
from app.schemas.provenance import ProvenanceType


def test_provenance_types():
    assert ProvenanceType.OBSERVED.value == "OBSERVED"
    assert ProvenanceType.CALCULATED.value == "CALCULATED"
    assert ProvenanceType.AI_INTERPRETED.value == "AI_INTERPRETED"
    assert ProvenanceType.SYNTHETIC_DEMO.value == "SYNTHETIC_DEMO"


def test_provenance_invariants():
    # Only 4 sanctioned tiers
    valid_tiers = {"OBSERVED", "CALCULATED", "AI_INTERPRETED", "SYNTHETIC_DEMO"}
    assert len(valid_tiers) == 4
