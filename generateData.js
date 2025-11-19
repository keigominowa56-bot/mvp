// Node.jsのバージョンやプロジェクト設定によっては、requireを使用します。
// const { faker } = require('@faker-js/faker'); 

import { faker } from '@faker-js/faker';

// ランダムなユーザーデータを生成する関数
function createRandomUser() {
  return {
    userId: faker.string.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    password: faker.internet.password(),
    birthdate: faker.date.birthdate(),
    registeredAt: faker.date.past(),
  };
}

// createRandomUser関数を5回実行し、結果を配列に格納
const users = faker.helpers.multiple(createRandomUser, {
  count: 5,
});

// 生成されたデータをコンソールに出力
console.log(users);