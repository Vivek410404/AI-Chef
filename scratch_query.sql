SELECT id, email, "emailVerified", LEFT("verificationToken", 30) as tok 
FROM "User" 
WHERE email LIKE 'smoketest%' 
ORDER BY "createdAt" DESC 
LIMIT 5;
