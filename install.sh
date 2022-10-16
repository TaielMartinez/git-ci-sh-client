sudo apt-get install nodejs
sudo apt-get install npm
sudo npm install pm2@latest -g
pm2 stop 0
pm2 delete 0
git add *
git stash
git reset --hard
git pull
npm install
pm2 start client.js
