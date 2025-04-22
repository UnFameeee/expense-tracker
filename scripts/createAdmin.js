const readline = require('readline');
const bcrypt = require('bcrypt');
const prisma = require('../database/prismaClient');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

(async () => {
  try {
    const username = await ask('Admin username: ');
    const password = await ask('Admin password: ');
    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hash,
        role: 'admin'
      }
    });

    console.log('Admin user created:', user.username);
  } catch (err) {
    if (err.code === 'P2002') {
      console.error('Username already exists!');
    } else {
      console.error(err);
    }
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
})();
