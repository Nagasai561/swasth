from typing import Literal

from pydantic import BaseModel

ExistingConditionsOptions = list[
    Literal[
        "None",
        "Diabetes (Type 1)",
        "Diabetes (Type 2)",
        "Prediabetes",
        "Hypertension (High blood pressure)",
        "High cholesterol",
        "Heart disease",
        "Stroke / TIA",
        "Kidney disease",
        "Liver disease",
        "Fatty liver",
        "Thyroid disorder",
        "Anemia",
        "Iron deficiency",
        "Vitamin B12 deficiency",
        "Vitamin D deficiency",
        "Asthma",
        "COPD",
        "Autoimmune disease",
        "Rheumatoid arthritis",
        "Lupus (SLE)",
        "Cancer",
        "PCOS",
        "Gout",
        "Obesity",
        "Depression",
        "Anxiety",
        "HIV/AIDS",
        "Hepatitis B",
        "Hepatitis C",
    ]
    | str
]

CurrentMedicationsOptions = list[
    Literal[
        "None",
        "Diabetes medication",
        "Blood pressure medication",
        "Cholesterol medication",
        "Thyroid medication",
        "Blood thinner",
        "Steroid medication",
        "Antibiotics",
        "Hormonal medication (birth control/HRT)",
        "Cancer or immunosuppressive medication",
        "Iron supplement",
        "Vitamin supplements (B12, D, folic acid, multivitamin)",
        "Protein/Creatine supplement",
    ]
    | str
]

FamilyHistoryOptions = list[
    Literal[
        "None",
        "Diabetes",
        "Hypertension",
        "High cholesterol",
        "Heart disease",
        "Stroke",
        "Kidney disease",
        "Liver disease",
        "Thyroid disease",
        "Anemia",
        "Blood disorders",
        "Autoimmune disease",
        "Cancer",
        "Colon cancer",
        "Breast cancer",
        "Ovarian cancer",
        "Prostate cancer",
        "Leukemia",
        "Obesity",
        "Genetic disorder",
    ]
    | str
]

SymptomsOptions = list[
    Literal[
        "None",
        "Fatigue or weakness",
        "Fever",
        "Weight loss",
        "Weight gain",
        "Dizziness or fainting",
        "Headache",
        "Chest pain",
        "Shortness of breath",
        "Frequent infections",
        "Excessive thirst or urination",
        "Abdominal pain",
        "Nausea or vomiting",
        "Diarrhea or constipation",
        "Joint or muscle pain",
        "Hair loss",
        "Skin rash or itching",
        "Easy bruising or bleeding",
        "Swollen legs",
    ]
    | str
]


class LifeStyleOptions(BaseModel):
    smoking: Literal["Never", "Former Smoker", "Occasionally", "Daily"]
    alcohol: Literal["Never", "Occasionally", "Weekly", "Daily"]
    exercise: Literal["None", "1-2 days/week", "3-5 days/week", "6-7 days/week"]
    diet: Literal["Vegetarian", "Vegan", "Mixed"]
    sleep: Literal["<5 hours", "5-6 hours", "7-8 hours", "8+ hours"]


class UserMedicalInfo(BaseModel):
    age: int
    weight: int
    height: int
    sex: Literal["Male", "Female"]
    pregnant: bool
    existing_conditions: ExistingConditionsOptions
    current_medications: CurrentMedicationsOptions
    lifestyle: LifeStyleOptions
    family_history: FamilyHistoryOptions
    symptoms: SymptomsOptions
