ALTER TABLE listwish_wishes 
     ADD COLUMN user_id INTEGER REFERENCES listwish_users(id);