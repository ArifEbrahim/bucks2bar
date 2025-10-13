import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from starlette.requests import Request
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_500_INTERNAL_SERVER_ERROR
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import re
import base64
import smtplib
from email.message import EmailMessage

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

class EmailRequest(BaseModel):
    email: EmailStr
    image: str

ALLOWED_TYPES = ["image/png", "image/jpeg"]

@app.post("/send-email")
@limiter.limit("5/15minutes")
async def send_email(request: Request, data: EmailRequest):
    # Validate image
    matches = re.match(r"^data:(image/[a-zA-Z]+);base64,", data.image)
    if not matches or matches.group(1) not in ALLOWED_TYPES:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Invalid or unsupported image type")

    # Prepare email
    msg = EmailMessage()
    msg["Subject"] = "Your Bucks2Bar Chart"
    msg["From"] = "onboarding@resend.dev"
    msg["To"] = data.email
    msg.set_content("Attached is your chart image.")
    image_data = data.image.split("base64,")[1]
    msg.add_attachment(base64.b64decode(image_data), maintype="image", subtype=matches.group(1).split("/")[1], filename="chart.png")

    # Send email via Resend SMTP
    try:
        with smtplib.SMTP_SSL("smtp.resend.com", 465) as smtp:
            smtp.login("resend", os.environ["RESEND_SMTP_PASS"])
            smtp.send_message(msg)
        return JSONResponse(content={"message": "Email sent!"})
    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to send email")

@app.get("/")
def root():
    return {"message": "Server running on FastAPI"}
