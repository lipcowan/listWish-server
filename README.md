# LISTWISH BACKEND

[Client Side Repo](https://github.com/lipcowan/listWish-client)
[Client Demo Deployed Here](https://listwish.vercel.app/)

### Listwish is intended to be wishlist/registry product for 501(c)(3) organizations

#### To clone and deploy locally you will need: 

- PSQL or some database software
- optionally - dBeaver

#### To set up your environment follow the directions below:
- open your local projects folder in your terminal
- run in terminal: git clone git@github.com:lipcowan/listWish-server.git [project name] 
- run in terminal:  npm i (or npm install)
- Create a database and admin user (follow psql or database directions for this) [mac install and setup instructions](https://www.codementor.io/@engineerapart/getting-started-with-postgresql-on-mac-osx-are8jcopb)
- Create a .env file with 
 - NODE_ENV=developement
 - PORT=[number]
 - DATABASE_URL=["postgresql://username@localhost/databasename"]
 - (optional but recommended) TEST_DATABASE_URL=["postgresql://username@localhost/test_database_name"]
 - JWT_SECRET=[create_your_own_token]
- run in terminal:  npm run migrate
- run in terminal: npm run dev


### Contact me
- phillip.cowan@icloud.com
