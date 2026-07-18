import json
import sqlite3
from pathlib import Path

from user_medical_info import UserMedicalInfo

DB_PATH = (Path(__file__).parent / "runtime_files" / "user_info.db").resolve()


def _get_connection() -> sqlite3.Connection:
    return sqlite3.connect(DB_PATH)


def init_user_info_db() -> None:
    with _get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS user_medical_info (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                medical_info_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()


def create_user_medical_info(data: UserMedicalInfo) -> int:
    with _get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO user_medical_info (medical_info_json) VALUES (?)",
            (data.model_dump_json(),),
        )
        conn.commit()
        return int(cursor.lastrowid)


def get_user_medical_info_by_id(user_id: int) -> UserMedicalInfo | None:
    with _get_connection() as conn:
        cursor = conn.execute(
            "SELECT medical_info_json FROM user_medical_info WHERE id = ?",
            (user_id,),
        )
        row = cursor.fetchone()
        if row is None:
            return None

    medical_info_json = row[0]
    return UserMedicalInfo.model_validate(json.loads(medical_info_json))


def update_user_medical_info_by_id(user_id: int, data: UserMedicalInfo) -> bool:
    with _get_connection() as conn:
        cursor = conn.execute(
            """
            UPDATE user_medical_info
            SET medical_info_json = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (data.model_dump_json(), user_id),
        )
        conn.commit()
        return cursor.rowcount > 0
