from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security_scheme = HTTPBearer(auto_error=False)


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
):
    if credentials is None:
        return None
    return {"sub": "placeholder-user-id", "role": "student"}
