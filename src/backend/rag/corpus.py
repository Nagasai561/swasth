from dataclasses import dataclass


@dataclass(frozen=True)
class BloodCorpusSource:
    source_id: str
    title: str
    url: str
    tags: tuple[str, ...]


# All URLs verified against the live MedlinePlus "Medical Tests" index
# (https://medlineplus.gov/lab-tests/) on 2026-07-18.
BLOOD_CORPUS_SOURCES: tuple[BloodCorpusSource, ...] = (
    BloodCorpusSource(
        source_id="medlineplus-cbc",
        title="Complete Blood Count (CBC) - MedlinePlus",
        url="https://medlineplus.gov/lab-tests/complete-blood-count-cbc/",
        tags=("cbc", "rbc", "wbc", "hemoglobin", "platelets"),
    ),
    BloodCorpusSource(
        source_id="medlineplus-comprehensive-metabolic-panel",
        title="Comprehensive Metabolic Panel (CMP) - MedlinePlus",
        url="https://medlineplus.gov/lab-tests/comprehensive-metabolic-panel-cmp/",
        tags=("cmp", "electrolytes", "liver", "kidney", "glucose"),
    ),
    BloodCorpusSource(
        source_id="medlineplus-basic-metabolic-panel",
        title="Basic Metabolic Panel (BMP) - MedlinePlus",
        url="https://medlineplus.gov/lab-tests/basic-metabolic-panel-bmp/",
        tags=("bmp", "electrolytes", "kidney", "glucose"),
    ),
    BloodCorpusSource(
        source_id="medlineplus-cholesterol-levels",
        title="Cholesterol Levels (Lipid Panel) - MedlinePlus",
        url="https://medlineplus.gov/lab-tests/cholesterol-levels/",
        tags=("lipid", "cholesterol", "hdl", "ldl", "triglycerides"),
    ),
    BloodCorpusSource(
        source_id="medlineplus-thyroid-stimulating-hormone",
        title="TSH (Thyroid-Stimulating Hormone) Test - MedlinePlus",
        url="https://medlineplus.gov/lab-tests/tsh-thyroid-stimulating-hormone-test/",
        tags=("tsh", "thyroid", "endocrine"),
    ),
    BloodCorpusSource(
        source_id="medlineplus-a1c",
        title="Hemoglobin A1c (HbA1c) Test - MedlinePlus",
        url="https://medlineplus.gov/lab-tests/hemoglobin-a1c-hba1c-test/",
        tags=("hba1c", "diabetes", "glucose"),
    ),
    BloodCorpusSource(
        source_id="medlineplus-iron-tests",
        title="Iron Tests - MedlinePlus",
        url="https://medlineplus.gov/lab-tests/iron-tests/",
        tags=("iron", "ferritin", "anemia"),
    ),
    BloodCorpusSource(
        source_id="medlineplus-vitamin-d",
        title="Vitamin D Test - MedlinePlus",
        url="https://medlineplus.gov/lab-tests/vitamin-d-test/",
        tags=("vitamin-d", "bone", "deficiency"),
    ),
    BloodCorpusSource(
        source_id="medlineplus-liver-function-tests",
        title="Liver Function Tests - MedlinePlus",
        url="https://medlineplus.gov/lab-tests/liver-function-tests/",
        tags=("liver", "alt", "ast", "bilirubin", "cmp"),
    ),
    BloodCorpusSource(
        source_id="medlineplus-triglycerides",
        title="Triglycerides Test - MedlinePlus",
        url="https://medlineplus.gov/lab-tests/triglycerides-test/",
        tags=("lipid", "triglycerides", "cholesterol"),
    ),
    BloodCorpusSource(
        source_id="medlineplus-ferritin",
        title="Ferritin Blood Test - MedlinePlus",
        url="https://medlineplus.gov/lab-tests/ferritin-blood-test/",
        tags=("ferritin", "iron", "anemia"),
    ),
    BloodCorpusSource(
        source_id="medlineplus-crp",
        title="C-Reactive Protein (CRP) Test - MedlinePlus",
        url="https://medlineplus.gov/lab-tests/c-reactive-protein-crp-test/",
        tags=("crp", "inflammation"),
    ),
    BloodCorpusSource(
        source_id="medlineplus-esr",
        title="Erythrocyte Sedimentation Rate (ESR) - MedlinePlus",
        url="https://medlineplus.gov/lab-tests/erythrocyte-sedimentation-rate-esr/",
        tags=("esr", "inflammation"),
    ),
    BloodCorpusSource(
        source_id="medlineplus-electrolyte-panel",
        title="Electrolyte Panel - MedlinePlus",
        url="https://medlineplus.gov/lab-tests/electrolyte-panel/",
        tags=("electrolytes", "sodium", "potassium", "chloride"),
    ),
    BloodCorpusSource(
        source_id="medlineplus-creatinine",
        title="Creatinine Test - MedlinePlus",
        url="https://medlineplus.gov/lab-tests/creatinine-test/",
        tags=("creatinine", "kidney", "gfr"),
    ),
    BloodCorpusSource(
        source_id="medlineplus-bun",
        title="BUN (Blood Urea Nitrogen) - MedlinePlus",
        url="https://medlineplus.gov/lab-tests/bun-blood-urea-nitrogen/",
        tags=("bun", "kidney"),
    ),
)
