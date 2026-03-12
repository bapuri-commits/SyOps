"""초기 admin 계정 생성 스크립트.

사용법:
    python -m backend.scripts.create_admin

SyOps/ 디렉토리에서 실행해야 합니다.
"""
from __future__ import annotations

import asyncio
import getpass

from sqlalchemy import select

from backend.core.auth import hash_password
from backend.core.database import async_session, close_db, init_db
from backend.models.user import User


async def main() -> None:
    await init_db()

    username = input("Username: ").strip()
    if not username:
        print("Username을 입력해주세요.")
        return

    password = getpass.getpass("Password: ")
    if len(password) < 4:
        print("비밀번호는 최소 4자 이상이어야 합니다.")
        return

    confirm = getpass.getpass("Confirm password: ")
    if password != confirm:
        print("비밀번호가 일치하지 않습니다.")
        return

    async with async_session() as db:
        existing = await db.execute(select(User).where(User.username == username))
        if existing.scalar_one_or_none():
            print(f"'{username}' 계정이 이미 존재합니다.")
            return

        user = User(
            username=username,
            hashed_password=hash_password(password),
            role="admin",
        )
        db.add(user)
        await db.commit()
        print(f"Admin 계정 '{username}' 생성 완료.")

    await close_db()


if __name__ == "__main__":
    asyncio.run(main())
