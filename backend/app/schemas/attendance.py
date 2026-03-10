import datetime

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from ..models.attendance import AttendanceStatus

_camel_config = ConfigDict(
    from_attributes=True,
    alias_generator=to_camel,
    populate_by_name=True,
)


class AttendanceRecordRequest(BaseModel):
    student_id: int
    status: AttendanceStatus


class AttendanceSessionCreate(BaseModel):
    class_id: int
    date: datetime.date
    records: list[AttendanceRecordRequest] = Field(min_length=1)


class AttendanceRecordResponse(BaseModel):
    model_config = _camel_config

    id: int
    student_id: int
    status: AttendanceStatus


class AttendanceSessionResponse(BaseModel):
    model_config = _camel_config

    id: int
    class_id: int
    date: datetime.date
    period: str
    taken_by: int
    created_at: datetime.datetime


class AttendanceSessionDetailResponse(AttendanceSessionResponse):
    records: list[AttendanceRecordResponse]
