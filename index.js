const TelegramApi = require("node-telegram-bot-api");
const { gameOptions, againOptions } = require("./options");
const sequelize = require("./db");
const CountryModel = require("./models/Country");
const UserModel = require("./models/User");
const { where } = require("sequelize");

const token = "PUT HERE tg bot token";

const bot = new TelegramApi(token, { polling: true });

const chats = {};

const randomInteger = (min, max) => {
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
};

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, `Отгадай столицу страны!`);

  const countries = await CountryModel.findAll();
  const randomRow = randomInteger(1, countries.length);
  const askedCountry = countries[randomRow].dataValues;
  chats[chatId] = askedCountry;
  //console.log(chats);

  await bot.sendMessage(
    chatId,
    `Назови столицу у страны  ${chats[chatId].name} :)`,
    gameOptions
  );
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
    { command: "/game", description: "Поиграть в игру Угадай столицу страны" },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = String(msg.chat.id);

    try {
      if (text === "/start") {
        const user = await UserModel.findOne({ where: { chatId } });
        if (!user) {
          await UserModel.create({ chatId });
        }
        return await bot.sendMessage(
          chatId,
          `Добро пожаловать в телеграмм бот от venpavel!`
        );
      }

      if (text === "/info") {
        const user = await UserModel.findOne({ where: { chatId } });
        await bot.sendMessage(
          chatId,
          `Твое имя: ${msg.from.first_name} ${msg.from.last_name}! В игре у тебя правильных ответов: ${user.right} , а неправильных: ${user.wrong} `
        );

        return await bot.sendSticker(
          chatId,
          "https://tlgrm.ru/_/stickers/81a/eb1/81aeb18e-bea5-4f1b-8d9a-f7756f14d209/1.webp"
        );
      }

      if (text === "/game") {
        return startGame(chatId);
      }

      if (!text.includes("/") && chats[chatId].capital) {
        const user = await UserModel.findOne({ where: { chatId } });
        if (
          text.toLowerCase().trim() ==
          chats[chatId].capital.toLowerCase().trim()
        ) {
          user.right += 1;
          await bot.sendMessage(
            chatId,
            `Поздравляем, ты угадал, столица ${chats[chatId].name} -  ${chats[chatId].capital}`,
            againOptions
          );
        } else {
          user.wrong += 1;
          await bot.sendMessage(
            chatId,
            `К сожалению ты не угадал! Попробуй еще раз.`,
            gameOptions
          );
        }

        return await user.save();
      }

      return await bot.sendMessage(
        chatId,
        `Я тебя не понимаю :). Попробуй еще раз.`
      );
    } catch (e) {
      console.log(e);
      return bot.sendMessage(chatId, "Произошла какая-то ошибка!");
    }
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = String(msg.message.chat.id);

    if (data == "/again") {
      startGame(chatId);
    }

    if (data == "/giveup") {
      const user = await UserModel.findOne({ where: { chatId } });
      user.wrong += 1;
      await bot.sendMessage(
        chatId,
        `Жаль что ты сдался! Столица страны ${chats[chatId].name} на самом деле: ${chats[chatId].capital}. Попробуй сыграть еще раз!`,
        againOptions
      );
      chats[chatId] = {};
      await user.save();
    }
  });
};

start();
