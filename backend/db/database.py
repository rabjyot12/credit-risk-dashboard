import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def get_connection(cursor_factory=None):
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=cursor_factory)
    return conn
