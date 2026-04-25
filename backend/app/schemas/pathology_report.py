from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PathologyReportOut(BaseModel):
    id: int
    case_id: int
    pathologist_id: int
    diagnosis: str
    malignant_neoplasm: bool = False
    report_file_path: Optional[str] = None
    report_original_filename: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
