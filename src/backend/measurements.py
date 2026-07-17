from pydantic import BaseModel, Field
from typing import Literal

class NominalRange(BaseModel):
    lower_value: int
    upper_value: int


class Measurement(BaseModel):
    category: str = Field(description="Category of blood test")
    name: str = Field(description="Name of exact test")
    observed_value: int = Field(description="Observed value of the test")
    nominal_range: NominalRange = Field(description="Nominal range of the test")
    unit: str = Field(description="Unit of the observed value")
    concern: Literal["Low", "Medium", "High"] = Field(description="How concerned the observed value is in context of the nominal range")


class Measurements(BaseModel):
    collection: list[Measurement]
