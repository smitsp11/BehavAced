"""
Authentication Middleware for Supabase Auth
Verifies JWT tokens and extracts user information
"""
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import jwt
from functools import wraps
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# HTTP Bearer token security
security = HTTPBearer(auto_error=False)


class AuthUser:
    """Authenticated user data extracted from JWT"""
    def __init__(self, user_id: str, email: Optional[str] = None, role: str = "authenticated"):
        self.user_id = user_id
        self.email = email
        self.role = role


def verify_supabase_token(token: str) -> Optional[dict]:
    """
    Verify a Supabase JWT token.
    
    Note: For production, you should verify against Supabase's JWT secret.
    The JWT secret can be found in Supabase Dashboard > Settings > API > JWT Secret
    """
    try:
        # Supabase uses HS256 algorithm
        # The JWT secret should be in your .env file
        jwt_secret = settings.SUPABASE_JWT_SECRET
        
        if not jwt_secret:
            # Fallback: decode without verification (NOT for production!)
            logger.warning("JWT_SECRET not set - decoding without verification (dev only)")
            payload = jwt.decode(token, options={"verify_signature": False})
        else:
            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256"],
                audience="authenticated"
            )
        
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        return None
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[AuthUser]:
    """
    Dependency to get the current authenticated user.
    Returns None if not authenticated.
    """
    if not credentials:
        return None
    
    token = credentials.credentials
    payload = verify_supabase_token(token)
    
    if not payload:
        return None
    
    # Extract user info from JWT payload
    user_id = payload.get("sub")  # Supabase uses 'sub' for user ID
    email = payload.get("email")
    role = payload.get("role", "authenticated")
    
    if not user_id:
        return None
    
    return AuthUser(user_id=user_id, email=email, role=role)


async def require_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> AuthUser:
    """
    Dependency that requires authentication.
    Raises 401 if not authenticated.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = credentials.credentials
    payload = verify_supabase_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user_id = payload.get("sub")
    email = payload.get("email")
    role = payload.get("role", "authenticated")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    return AuthUser(user_id=user_id, email=email, role=role)


def optional_auth(func):
    """
    Decorator for endpoints that work with or without auth.
    Injects 'current_user' which may be None.
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # The get_current_user dependency handles this
        return await func(*args, **kwargs)
    return wrapper

