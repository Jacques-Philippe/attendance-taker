from pydantic import BaseModel, ConfigDict, Field, model_validator
from pydantic.alias_generators import to_camel


class ClassCreate(BaseModel):
    name: str = Field(min_length=1)
    period: str = Field(min_length=1)


class ClassUpdate(BaseModel):
    name: str | None = None
    period: str | None = None

    @model_validator(mode="after")
    def at_least_one_field(self) -> "ClassUpdate":
        if self.name is None and self.period is None:
            raise ValueError("At least one of name or period must be provided")
        return self


class StudentResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )

    id: int
    name: str
    class_id: int


class StudentCreate(BaseModel):
    name: str = Field(min_length=1)


class StudentUpdate(BaseModel):
    name: str = Field(min_length=1)


class ClassResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )

    id: int
    name: str
    period: str
    teacher_id: int


class ClassDetailResponse(ClassResponse):
    students: list[StudentResponse]
