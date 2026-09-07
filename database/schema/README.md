# Schema — `database/schema/*.json`

JSON schema contracts per domain (reference for PostgreSQL columns + JSON fallback shape).

- `users.json` — id, email(unique), passwordHash, role(User|Doctor|Trainer|Farmer|Delivery|Admin), phone, avatar, createdAt
- `health-reports.json` — id, userId, condition, severity, encrypted_data (AES-256-GCM)
- `marketplace.json` — crops(id,name,category,price,farmer), crop_bookings(userId,cropId,qty,status)
- `telemedicine.json` — doctor_profiles, appointments(doctorId,userId,date,time,mode,status)
- `delivery.json` — delivery_orders(orderId,assigned_to,customer,status), tracking_points(lat,lng,timestamp)
- `fitness.json` — workouts(id,category,duration), fitness_log(userId,year,week,streak)
- `farmer.json` — livestock, farmer_inventory(stock,unit,price), farmer_earnings
- `doctor.json` — doctor_profiles(verification), patient_records
- `notification.json` — notifications(userId,title,type,read,channel)
- `analytics.json` — audit_logs, activity_events

PostgreSQL tables are created by `migrations/001_init_postgresql.sql` → `004_trainer_postgresql.sql` (pgcrypto `gen_random_uuid()`). These JSON files document the shape used by `pgQuery` and JSON fallback.
