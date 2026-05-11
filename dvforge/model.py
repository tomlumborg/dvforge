from __future__ import annotations

from typing import Literal, Optional
from pydantic import BaseModel, model_validator


class Publisher(BaseModel):
    name: str
    display_name: str
    prefix: str
    option_value_prefix: int


class Solution(BaseModel):
    name: str
    display_name: str
    version: str
    publisher: Publisher


class OptionValue(BaseModel):
    label: str
    value: int


class OptionSet(BaseModel):
    name: str           # without prefix
    display_name: str
    options: list[OptionValue]


class Column(BaseModel):
    name: str           # without prefix
    type: Literal["string", "lookup", "choice", "datetime", "dateonly", "int"]
    display_name: str
    required: bool = False
    primary_name: bool = False
    max_length: Optional[int] = None    # string only
    option_set: Optional[str] = None    # choice only, without prefix
    related_table: Optional[str] = None # lookup only, without prefix

    @model_validator(mode="after")
    def check_type_fields(self) -> Column:
        if self.type == "choice" and not self.option_set:
            raise ValueError(f"Column '{self.name}': choice columns must specify option_set")
        if self.type == "lookup" and not self.related_table:
            raise ValueError(f"Column '{self.name}': lookup columns must specify related_table")
        if self.type in ("datetime", "dateonly", "int") and self.related_table:
            raise ValueError(f"Column '{self.name}': datetime/dateonly/int columns cannot specify related_table")
        if self.type in ("datetime", "dateonly", "int") and self.option_set:
            raise ValueError(f"Column '{self.name}': datetime/dateonly/int columns cannot specify option_set")
        return self


class Relationship(BaseModel):
    related_table: str   # without prefix — the "many" side entity
    lookup_column: str   # without prefix — the FK column on the many side


class Entity(BaseModel):
    name: str            # without prefix
    display_name: str
    display_name_plural: str
    description: Optional[str] = None
    ownership: Literal["user", "organization"] = "user"
    columns: list[Column] = []
    relationships: list[Relationship] = []


class Config(BaseModel):
    solution: Solution
    option_sets: list[OptionSet]
    entities: list[Entity]
