const main = require('../../../../Config/main');
const messages = require('../../../../Config/messages');
const rates = require('../../../../Config/rates');
const inventory = require('../../../../Components/inventory');
const chatMessage = require('../../../../Components/message');
const { getSets } = require('../../../../Components/sets');
const log = require('../../../../Components/log');
const { filterCommands } = require('../../../../Utils');
const utils = require('../../../../Utils');

module.exports = (sender, client, users, community, allCards) => {
  const language = utils.getLanguage(sender.getSteamID64(), users);

  chatMessage(client, sender, messages.REQUEST[language]);
  log.userChat(sender.getSteamID64(), language, '[ !SELLCHECK ]');
  inventory.getInventory(sender.getSteamID64(), community, (ERR1, DATA) => {
    if (!ERR1) {
      const s = DATA;
      getSets(s, allCards, (ERR2, DDATA) => {
        if (!ERR2) {
          let userNSets = 0;
          for (let i = 0; i < Object.keys(DDATA).length; i += 1) {
            if (!inventory.botSets[Object.keys(DDATA)[i]]) {
              if (DDATA[Object.keys(DDATA)[i]].length >= main.maxStock) {
                userNSets += main.maxStock;
              } else {
                userNSets += DDATA[Object.keys(DDATA)[i]].length;
              }
            } else if (
              inventory.botSets[Object.keys(DDATA)[i]].length < main.maxStock
            ) {
              if (DDATA[Object.keys(DDATA)[i]].length >= main.maxStock) {
                userNSets +=
                  main.maxStock -
                  inventory.botSets[Object.keys(DDATA)[i]].length;
              } else if (
                DDATA[Object.keys(DDATA)[i]].length +
                  inventory.botSets[Object.keys(DDATA)[i]].length <=
                main.maxStock
              ) {
                userNSets += DDATA[Object.keys(DDATA)[i]].length;
              } else if (DDATA[Object.keys(DDATA)[i]].length > 0) {
                userNSets +=
                  main.maxStock -
                  inventory.botSets[Object.keys(DDATA)[i]].length;
              }
            }
          }

          if (userNSets) {
            const cs = parseInt(userNSets / rates.csgo.buy, 10);
            const hydra = parseInt(userNSets / rates.hydra.buy, 10);
            const tf = parseInt(userNSets / rates.tf.buy, 10);
            const gems = parseInt(userNSets * rates.gems.buy, 10);
            let message = ' ';
            if (cs > 0) {
              message += messages.SELLCHECK.CURRENCIES.CSGO[language]
                .replace(/{CSGO}/g, cs)
                .replace('{SETS1}', cs * rates.csgo.buy);
            }
            if (hydra > 0) {
              message += messages.SELLCHECK.CURRENCIES.HYDRA[language]
                .replace(/{HYDRA}/g, hydra)
                .replace('{SETS2}', hydra * rates.hydra.buy);
            }
            if (tf > 0) {
              message += messages.SELLCHECK.CURRENCIES.TF[language]
                .replace(/{TF}/g, tf)
                .replace('{SETS3}', tf * rates.tf.buy);
            }
            if (parseInt(userNSets, 10) > 0) {
              message += messages.SELLCHECK.CURRENCIES.GEMS[language]
                .replace('{GEMS}', gems)
                .replace('{SETS4}', userNSets)
                .replace('{SETS5}', parseInt(userNSets, 10));
            }

            message = filterCommands(message).join('\n');

            if (!message.includes('•')) {
              chatMessage(
                client,
                sender,
                messages.ERROR.OUTOFSTOCK.DEFAULT.SETS.THEM[0][language]
              );
              return;
            }

            chatMessage(
              client,
              sender,
              messages.SELLCHECK.RESPONSE[language]
                .replace('{SETS}', userNSets)
                .replace('{MESSAGE}', message)
            );
          } else {
            chatMessage(
              client,
              sender,
              messages.ERROR.OUTOFSTOCK.DEFAULT.SETS.THEM[0][language]
            );
          }
        } else {
          chatMessage(
            client,
            sender,
            messages.ERROR.LOADINVENTORY.THEM[0][language]
          );
          log.error(`An error occurred while getting user sets: ${ERR2}`);
        }
      });
    } else if (ERR1.message.indexOf('profile is private') > -1) {
      chatMessage(
        client,
        sender,
        messages.ERROR.LOADINVENTORY.THEM[2][language]
      );
      log.error(`An error occurred while getting user inventory: ${ERR1}`);
    } else {
      chatMessage(
        client,
        sender,
        messages.ERROR.LOADINVENTORY.THEM[0][language]
      );
      log.error(`An error occurred while getting user inventory: ${ERR1}`);
    }
  });
};
