module.exports = {
  gameOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [[{ text: "Сдаюсь", callback_data: "/giveup" }]],
    }),
  },
  againOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [[{ text: "Играть еще раз", callback_data: "/again" }]],
    }),
  },
};
