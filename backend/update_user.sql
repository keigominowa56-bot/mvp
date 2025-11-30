UPDATE users
SET passwordHash='$2b$10$IMs7GmtZqZvtXOzbkTw1oek.XPZjVrjW9gvS2VJPXou0op.m0A9xS',
    role='admin',
    status='active'
WHERE email='keigominowa56@gmail.com';

.headers on
.mode column
SELECT id, email, role, status FROM users WHERE email='keigominowa56@gmail.com';
