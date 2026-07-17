from pydantic import BaseModel

class NominalRange(BaseModel):
    lower_value: int
    upper_value: int


class Measurement(BaseModel):
    category: str
    name: str
    observed_value: int
    nominal_range: NominalRange
    unit: str


class Measurements(BaseModel):
    collection: list[Measurement]
