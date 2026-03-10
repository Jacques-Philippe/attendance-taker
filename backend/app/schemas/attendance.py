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


class StudentAttendanceSummary(BaseModel):
    model_config = _camel_config

    student_id: int
    student_name: str
    total: int
    present: int
    absent: int
    late: int
    excused: int


class ClassReportResponse(BaseModel):
    model_config = _camel_config

    class_id: int
    class_name: str
    period: str
    total_sessions: int
    students: list[StudentAttendanceSummary]


class StudentSessionRecord(BaseModel):
    model_config = _camel_config

    session_id: int
    date: datetime.date
    period: str
    status: AttendanceStatus


class StudentHistoryResponse(BaseModel):
    model_config = _camel_config

    student_id: int
    student_name: str
    class_id: int
    class_name: str
    records: list[StudentSessionRecord]
