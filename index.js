const TelegramApi = require("node-telegram-bot-api");
const { gameOptions, againOptions } = require("./options");
const sequelize = require("./db");
const UserModel = require("./models");

const token = "123";

const bot = new TelegramApi(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(
    chatId,
    `Сейчас я загадаю число от 0 до 9, а ты должен его угадать.`
  );
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, "Можешь начинать отгадывать!", gameOptions);
};

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (e) {
    console.log(e);
  }

  bot.setMyCommands([
    { command: "/start", description: "Начальное приветствие" },
    { command: "/info", description: "Получить информацию" },
    { command: "/game", description: "Поиграть в игру Угадай число" },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    try {
      if (text === "/start") {
        await UserModel.create({ chatId });
        return bot.sendMessage(
          chatId,
          `Добро пожаловать в телеграмм бот от venpavel!`
        );
      }

      if (text === "/info") {
        const user = await UserModel.findOne({ chatId });
        await bot.sendMessage(
          chatId,
          `Твое имя: ${msg.from.first_name} ${msg.from.last_name}! В игре у тебя правильных ответов: ${user.right} , а неправильных: ${user.wrong} `
        );

        return bot.sendSticker(
          chatId,
          "https://tlgrm.ru/_/stickers/81a/eb1/81aeb18e-bea5-4f1b-8d9a-f7756f14d209/1.webp"
        );
      }

      if (text === "/game") {
        startGame(chatId);
      }

      return bot.sendMessage(chatId, `Я тебя не понимаю :). Попробуй еще раз.`);
    } catch (e) {
      return bot.sendMessage(chatId, "Произошла какая-то ошибка!");
    }
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    console.log("chats[chatsId]", chats[chatId]);

    if (data == "/again") {
      startGame(chatId);
    }

    const user = await UserModel.findOne({ chatId });

    if (data == chats[chatId]) {
      user.right += 1;
      await bot.sendMessage(
        chatId,
        `Поздравляем, ты угадал, бот загадал цифру ${chats[chatId]}`,
        againOptions
      );
    } else {
      user.wrong += 1;
      await bot.sendMessage(
        chatId,
        `К сожалению ты не угадал! Попробуй еще раз.`,
        againOptions
      );
    }

    await user.save();
  });
};

start();
