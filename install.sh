sudo apt-get install nodejs
sudo apt-get install npm
npm install
sudo npm install pm2@latest -g
pm2 stop 0
pm2 delete 0
git add *
git stash
git reset --hard
git pull
pm2 start client.js
